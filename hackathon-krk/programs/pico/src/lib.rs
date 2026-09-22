use anchor_lang::prelude::*;
use anchor_lang::AccountDeserialize;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j");

/// Max seats: 1 Execution + up to 3 verification slots.
pub const MAX_SLOTS: usize = 4;
pub const BPS_DENOM: u16 = 10_000;

/// Pico — skill-qualified short tasks with USDC escrow.
///
/// Slots (from one Test-1→2→3 podium; times off-chain, assignment on-chain):
///   0 = Execution Slot
///   1 = Primary Verification Slot
///   2.. = Audit Verification chain → last submits to client
///
/// Client sets N verifications + slot_bps (of net after platform fee).
/// Replacement of a declined seat = single-seat fill (operator after off-chain race).
///
/// See hackathon-krk/FLOW.md
#[program]
pub mod pico {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        operator: Pubkey,
        fee_bps: u16,
    ) -> Result<()> {
        require!(fee_bps <= 2_500, PicoError::InvalidBps);

        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.operator = operator;
        config.mint = ctx.accounts.mint.key();
        config.treasury = ctx.accounts.treasury_token_account.key();
        config.fee_bps = fee_bps;
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn update_operator(ctx: Context<UpdateOperator>, new_operator: Pubkey) -> Result<()> {
        ctx.accounts.config.operator = new_operator;
        Ok(())
    }

    pub fn update_fees(ctx: Context<UpdateFees>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 2_500, PicoError::InvalidBps);
        ctx.accounts.config.fee_bps = fee_bps;
        Ok(())
    }

    /// Operator issues skill credential (off-chain assessment / reputation later).
    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        skill_id: u16,
        level: u8,
    ) -> Result<()> {
        require!(level > 0, PicoError::InvalidLevel);
        let cred = &mut ctx.accounts.credential;
        cred.worker = ctx.accounts.worker.key();
        cred.skill_id = skill_id;
        cred.level = level;
        cred.bump = ctx.bumps.credential;
        Ok(())
    }

    pub fn refresh_credential(ctx: Context<RefreshCredential>, level: u8) -> Result<()> {
        require!(level > 0, PicoError::InvalidLevel);
        ctx.accounts.credential.level = level;
        Ok(())
    }

    pub fn revoke_credential(_ctx: Context<RevokeCredential>) -> Result<()> {
        Ok(())
    }

    /// Client posts task, locks USDC, sets N verifications + per-slot bps of *net*.
    /// `slot_bps[0..review_count+1)` must sum to 10_000; unused entries must be 0.
    pub fn create_task(
        ctx: Context<CreateTask>,
        skill_id: u16,
        reward: u64,
        deadline_ts: i64,
        task_nonce: u64,
        review_count: u8,
        slot_bps: [u16; MAX_SLOTS],
    ) -> Result<()> {
        require!(reward > 0, PicoError::ZeroAmount);
        require!(
            review_count >= 1 && review_count < MAX_SLOTS as u8,
            PicoError::InvalidReviewCount
        );
        let slot_count = review_count + 1;
        validate_slot_bps(slot_count, &slot_bps)?;

        let now = Clock::get()?.unix_timestamp;
        require!(deadline_ts > now, PicoError::DeadlineInPast);

        let task = &mut ctx.accounts.task;
        task.client = ctx.accounts.client.key();
        task.skill_id = skill_id;
        task.task_nonce = task_nonce;
        task.reward = reward;
        task.deadline = deadline_ts;
        task.status = TaskStatus::Qualifying;
        task.review_count = review_count;
        task.slot_count = slot_count;
        task.slot_bps = slot_bps;
        task.slot_holders = [Pubkey::default(); MAX_SLOTS];
        task.slot_times_ms = [0u32; MAX_SLOTS];
        task.work_hashes = [[0u8; 32]; MAX_SLOTS];
        task.explanation_hash = [0u8; 32];
        task.active_slot = 0;
        task.hiring_slot = 0;
        task.vault = ctx.accounts.vault.key();
        task.bump = ctx.bumps.task;
        task.vault_bump = ctx.bumps.vault_authority;

        transfer_from_signer(
            &ctx.accounts.token_program,
            &ctx.accounts.client_token_account,
            &ctx.accounts.vault,
            &ctx.accounts.client,
            reward,
        )?;

        emit!(TaskCreatedEvent {
            task: task.key(),
            client: task.client,
            skill_id,
            reward,
            deadline: deadline_ts,
            task_nonce,
            review_count,
        });

        Ok(())
    }

    /// Client cancel only while still Qualifying (no team assigned).
    pub fn cancel_task(ctx: Context<CancelTask>) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Qualifying,
            PicoError::InvalidStatus
        );

        let amount = ctx.accounts.vault.amount;
        refund_client(ctx.accounts.into_refund_parts(), amount)?;
        ctx.accounts.task.status = TaskStatus::Cancelled;

        emit!(TaskCancelledEvent {
            task: ctx.accounts.task.key(),
            client: ctx.accounts.task.client,
            amount,
        });
        Ok(())
    }

    pub fn expire_qualifying_task(ctx: Context<ExpireQualifyingTask>) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Qualifying,
            PicoError::InvalidStatus
        );
        let now = Clock::get()?.unix_timestamp;
        require!(now >= ctx.accounts.task.deadline, PicoError::NotExpired);

        let amount = ctx.accounts.vault.amount;
        refund_client(ctx.accounts.into_refund_parts(), amount)?;
        ctx.accounts.task.status = TaskStatus::Cancelled;

        emit!(TaskExpiredEvent {
            task: ctx.accounts.task.key(),
            amount,
        });
        Ok(())
    }

    /// Operator records podium after off-chain Test 1→2→3.
    /// holders[0] = Execution (fastest T3); holders[1..] = verification slots.
    /// times_ms are stored so place-2 can see why they are not Execution.
    pub fn assign_team(
        ctx: Context<AssignTeam>,
        holders: [Pubkey; MAX_SLOTS],
        times_ms: [u32; MAX_SLOTS],
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Qualifying,
            PicoError::InvalidStatus
        );

        let slot_count = ctx.accounts.task.slot_count as usize;
        require_unique_holders(slot_count, &holders)?;

        for i in 0..slot_count {
            require!(holders[i] != Pubkey::default(), PicoError::EmptySlot);
        }
        for i in slot_count..MAX_SLOTS {
            require!(holders[i] == Pubkey::default(), PicoError::InvalidSlotPayload);
            require!(times_ms[i] == 0, PicoError::InvalidSlotPayload);
        }

        // Execution must be uniquely fastest among assigned (transparent ranking).
        for i in 1..slot_count {
            require!(
                times_ms[0] > 0 && times_ms[i] > times_ms[0],
                PicoError::RankingInvalid
            );
        }

        let task = &mut ctx.accounts.task;
        task.slot_holders = holders;
        task.slot_times_ms = times_ms;
        task.active_slot = 0;
        task.status = TaskStatus::Working;

        emit!(TeamAssignedEvent {
            task: task.key(),
            holders,
            times_ms,
        });
        Ok(())
    }

    /// Current slot holder declines → HiringSlot for that index only.
    pub fn decline_slot(ctx: Context<DeclineSlot>) -> Result<()> {
        let status = ctx.accounts.task.status;
        require!(
            status == TaskStatus::Working
                || status == TaskStatus::InReview
                || status == TaskStatus::HiringSlot,
            PicoError::InvalidStatus
        );

        let signer = ctx.accounts.holder.key();
        let slot_count = ctx.accounts.task.slot_count as usize;
        let mut found: Option<u8> = None;
        for i in 0..slot_count {
            if ctx.accounts.task.slot_holders[i] == signer {
                found = Some(i as u8);
                break;
            }
        }
        let idx = found.ok_or(PicoError::Unauthorized)?;

        // Only decline your own active responsibility or any seat while Working before submit.
        if status == TaskStatus::InReview {
            require!(
                idx == ctx.accounts.task.active_slot,
                PicoError::NotActiveSlot
            );
        }
        if status == TaskStatus::Working {
            require!(idx == 0, PicoError::NotActiveSlot);
        }

        let task = &mut ctx.accounts.task;
        task.slot_holders[idx as usize] = Pubkey::default();
        task.slot_times_ms[idx as usize] = 0;
        task.hiring_slot = idx;
        task.status = TaskStatus::HiringSlot;

        emit!(SlotDeclinedEvent {
            task: task.key(),
            slot_index: idx,
            by: signer,
        });
        Ok(())
    }

    /// Operator fills one empty seat after single-seat off-chain test (exactly one winner).
    pub fn fill_slot(
        ctx: Context<FillSlot>,
        slot_index: u8,
        time_ms: u32,
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::HiringSlot,
            PicoError::InvalidStatus
        );
        require!(
            slot_index == ctx.accounts.task.hiring_slot,
            PicoError::WrongHiringSlot
        );
        require!(
            (slot_index as usize) < ctx.accounts.task.slot_count as usize,
            PicoError::InvalidSlotIndex
        );
        require!(time_ms > 0, PicoError::RankingInvalid);

        let new_holder = ctx.accounts.new_holder.key();
        require!(new_holder != Pubkey::default(), PicoError::EmptySlot);

        let slot_count = ctx.accounts.task.slot_count as usize;
        for i in 0..slot_count {
            if i == slot_index as usize {
                continue;
            }
            require!(
                ctx.accounts.task.slot_holders[i] != new_holder,
                PicoError::DuplicateHolder
            );
        }

        let task = &mut ctx.accounts.task;
        task.slot_holders[slot_index as usize] = new_holder;
        task.slot_times_ms[slot_index as usize] = time_ms;

        // Resume: Execution seat → Working; verification seat → InReview at that index.
        if slot_index == 0 {
            task.active_slot = 0;
            task.status = TaskStatus::Working;
        } else {
            task.active_slot = slot_index;
            task.status = TaskStatus::InReview;
        }
        task.hiring_slot = 0;

        emit!(SlotFilledEvent {
            task: task.key(),
            slot_index,
            holder: new_holder,
            time_ms,
        });
        Ok(())
    }

    /// Execution Slot submits deliverable + explanation.
    pub fn submit_execution(
        ctx: Context<SubmitExecution>,
        result_hash: [u8; 32],
        explanation_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Working,
            PicoError::InvalidStatus
        );
        require!(result_hash != [0u8; 32], PicoError::EmptyHash);
        require!(explanation_hash != [0u8; 32], PicoError::EmptyHash);

        let task = &mut ctx.accounts.task;
        task.work_hashes[0] = result_hash;
        task.explanation_hash = explanation_hash;
        task.active_slot = 1;
        task.status = TaskStatus::InReview;

        emit!(ExecutionSubmittedEvent {
            task: task.key(),
            executor: task.slot_holders[0],
            result_hash,
            explanation_hash,
        });
        Ok(())
    }

    /// Active verification slot submits review of previous slot’s work.
    /// Last verifier → status Submitted (ready for finalize_and_pay).
    pub fn submit_verification(
        ctx: Context<SubmitVerification>,
        review_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::InReview,
            PicoError::InvalidStatus
        );
        require!(review_hash != [0u8; 32], PicoError::EmptyHash);

        let active = ctx.accounts.task.active_slot as usize;
        require!(active >= 1, PicoError::InvalidSlotIndex);
        require!(
            active < ctx.accounts.task.slot_count as usize,
            PicoError::InvalidSlotIndex
        );
        require!(
            ctx.accounts.task.slot_holders[active] == ctx.accounts.verifier.key(),
            PicoError::Unauthorized
        );

        let task = &mut ctx.accounts.task;
        task.work_hashes[active] = review_hash;

        let last = (task.slot_count - 1) as usize;
        if active == last {
            task.status = TaskStatus::Submitted;
            emit!(ChainCompleteEvent {
                task: task.key(),
                last_slot: active as u8,
            });
        } else {
            task.active_slot = (active + 1) as u8;
            emit!(VerificationSubmittedEvent {
                task: task.key(),
                slot_index: active as u8,
                review_hash,
                next_slot: task.active_slot,
            });
        }
        Ok(())
    }

    /// Active verifier rejects → Disputed (escrow stays locked).
    pub fn reject_verification(
        ctx: Context<RejectVerification>,
        review_hash: [u8; 32],
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::InReview,
            PicoError::InvalidStatus
        );
        require!(review_hash != [0u8; 32], PicoError::EmptyHash);
        let active = ctx.accounts.task.active_slot as usize;
        require!(
            active < ctx.accounts.task.slot_count as usize,
            PicoError::InvalidSlotIndex
        );
        require!(
            ctx.accounts.task.slot_holders[active] == ctx.accounts.verifier.key(),
            PicoError::Unauthorized
        );

        let task = &mut ctx.accounts.task;
        task.work_hashes[active] = review_hash;
        task.status = TaskStatus::Disputed;

        emit!(TaskDisputedEvent {
            task: task.key(),
            by: ctx.accounts.verifier.key(),
            reason: DisputeReason::VerificationFailed,
        });
        Ok(())
    }

    /// After last verification → pay all slots by client bps + platform fee.
    /// Pass token accounts: treasury, then slot 0..slot_count-1 ATAs in order.
    pub fn finalize_and_pay<'info>(
        ctx: Context<'_, '_, 'info, 'info, FinalizeAndPay<'info>>,
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Submitted,
            PicoError::InvalidStatus
        );

        let total = ctx.accounts.vault.amount;
        require!(total > 0, PicoError::EmptyVault);
        require!(total == ctx.accounts.task.reward, PicoError::VaultMismatch);

        let fee_bps = ctx.accounts.config.fee_bps as u128;
        let total_u = total as u128;
        let fee = total_u
            .checked_mul(fee_bps)
            .ok_or(PicoError::MathOverflow)?
            .checked_div(10_000)
            .ok_or(PicoError::MathOverflow)? as u64;
        let net = total.checked_sub(fee).ok_or(PicoError::MathOverflow)?;

        let slot_count = ctx.accounts.task.slot_count as usize;
        require!(
            ctx.remaining_accounts.len() == slot_count,
            PicoError::RemainingAccounts
        );

        let mut pays = [0u64; MAX_SLOTS];
        let mut paid_sum: u64 = 0;
        for i in 0..slot_count {
            let bps = ctx.accounts.task.slot_bps[i] as u128;
            let pay = (net as u128)
                .checked_mul(bps)
                .ok_or(PicoError::MathOverflow)?
                .checked_div(10_000)
                .ok_or(PicoError::MathOverflow)? as u64;
            pays[i] = pay;
            paid_sum = paid_sum.checked_add(pay).ok_or(PicoError::MathOverflow)?;
        }
        // Dust from integer division → Execution slot.
        if paid_sum < net {
            let dust = net - paid_sum;
            pays[0] = pays[0].checked_add(dust).ok_or(PicoError::MathOverflow)?;
        }

        let task_key = ctx.accounts.task.key();
        let bump = [ctx.accounts.task.vault_bump];
        let seeds: &[&[u8]] = &[b"vault_authority", task_key.as_ref(), &bump];
        let signer = &[seeds];

        let holders = ctx.accounts.task.slot_holders;
        let vault_mint = ctx.accounts.vault.mint;
        let token_program = ctx.accounts.token_program.to_account_info();
        let vault = ctx.accounts.vault.to_account_info();
        let vault_authority = ctx.accounts.vault_authority.to_account_info();
        let treasury = ctx.accounts.treasury_token_account.to_account_info();

        if fee > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone(),
                    Transfer {
                        from: vault.clone(),
                        to: treasury,
                        authority: vault_authority.clone(),
                    },
                    signer,
                ),
                fee,
            )?;
        }

        for i in 0..slot_count {
            let dest = &ctx.remaining_accounts[i];
            assert_ata(dest, holders[i], vault_mint)?;
            if pays[i] > 0 {
                token::transfer(
                    CpiContext::new_with_signer(
                        token_program.clone(),
                        Transfer {
                            from: vault.clone(),
                            to: dest.to_account_info(),
                            authority: vault_authority.clone(),
                        },
                        signer,
                    ),
                    pays[i],
                )?;
            }
        }

        ctx.accounts.task.status = TaskStatus::Paid;

        emit!(TaskPaidEvent {
            task: ctx.accounts.task.key(),
            fee,
            pays,
        });
        Ok(())
    }

    pub fn raise_dispute(ctx: Context<RaiseDispute>) -> Result<()> {
        let status = ctx.accounts.task.status;
        require!(
            status == TaskStatus::Working
                || status == TaskStatus::InReview
                || status == TaskStatus::Submitted
                || status == TaskStatus::HiringSlot,
            PicoError::InvalidStatus
        );

        let signer = ctx.accounts.party.key();
        let is_client = signer == ctx.accounts.task.client;
        let mut is_slot = false;
        for i in 0..(ctx.accounts.task.slot_count as usize) {
            if ctx.accounts.task.slot_holders[i] == signer {
                is_slot = true;
                break;
            }
        }
        require!(is_client || is_slot, PicoError::Unauthorized);

        ctx.accounts.task.status = TaskStatus::Disputed;

        emit!(TaskDisputedEvent {
            task: ctx.accounts.task.key(),
            by: signer,
            reason: DisputeReason::RaisedByParty,
        });
        Ok(())
    }

    /// Operator splits vault arbitrarily; amounts must sum to balance.
    /// remaining_accounts: ATAs for each slot_i with slot_amounts[i] > 0 (in order).
    pub fn resolve_dispute<'info>(
        ctx: Context<'_, '_, 'info, 'info, ResolveDispute<'info>>,
        client_amount: u64,
        fee_amount: u64,
        slot_amounts: [u64; MAX_SLOTS],
    ) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Disputed,
            PicoError::InvalidStatus
        );

        let total = ctx.accounts.vault.amount;
        let mut sum = client_amount
            .checked_add(fee_amount)
            .ok_or(PicoError::MathOverflow)?;
        for a in slot_amounts {
            sum = sum.checked_add(a).ok_or(PicoError::MathOverflow)?;
        }
        require!(sum == total, PicoError::PayoutMismatch);

        let slot_count = ctx.accounts.task.slot_count as usize;
        let holders = ctx.accounts.task.slot_holders;
        let mut needed = 0usize;
        for i in 0..slot_count {
            if slot_amounts[i] > 0 {
                needed += 1;
            }
        }
        require!(
            ctx.remaining_accounts.len() == needed,
            PicoError::RemainingAccounts
        );

        let task_key = ctx.accounts.task.key();
        let bump = [ctx.accounts.task.vault_bump];
        let seeds: &[&[u8]] = &[b"vault_authority", task_key.as_ref(), &bump];
        let signer = &[seeds];

        let vault_mint = ctx.accounts.vault.mint;
        let token_program = ctx.accounts.token_program.to_account_info();
        let vault = ctx.accounts.vault.to_account_info();
        let vault_authority = ctx.accounts.vault_authority.to_account_info();
        let treasury = ctx.accounts.treasury_token_account.to_account_info();
        let client_ata = ctx.accounts.client_token_account.to_account_info();

        if fee_amount > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone(),
                    Transfer {
                        from: vault.clone(),
                        to: treasury,
                        authority: vault_authority.clone(),
                    },
                    signer,
                ),
                fee_amount,
            )?;
        }
        if client_amount > 0 {
            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone(),
                    Transfer {
                        from: vault.clone(),
                        to: client_ata,
                        authority: vault_authority.clone(),
                    },
                    signer,
                ),
                client_amount,
            )?;
        }

        let mut rem_i = 0usize;
        for i in 0..slot_count {
            if slot_amounts[i] == 0 {
                continue;
            }
            let dest = &ctx.remaining_accounts[rem_i];
            rem_i += 1;
            assert_ata(dest, holders[i], vault_mint)?;

            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone(),
                    Transfer {
                        from: vault.clone(),
                        to: dest.to_account_info(),
                        authority: vault_authority.clone(),
                    },
                    signer,
                ),
                slot_amounts[i],
            )?;
        }

        ctx.accounts.task.status = TaskStatus::Paid;

        emit!(DisputeResolvedEvent {
            task: ctx.accounts.task.key(),
            client_amount,
            fee_amount,
            slot_amounts,
        });
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn assert_ata(info: &AccountInfo, owner: Pubkey, mint: Pubkey) -> Result<()> {
    let data = info.try_borrow_data()?;
    let ata = TokenAccount::try_deserialize_unchecked(&mut &data[..])
        .map_err(|_| error!(PicoError::Unauthorized))?;
    require!(ata.owner == owner, PicoError::Unauthorized);
    require!(ata.mint == mint, PicoError::MintMismatch);
    Ok(())
}

fn validate_slot_bps(slot_count: u8, slot_bps: &[u16; MAX_SLOTS]) -> Result<()> {
    let n = slot_count as usize;
    let mut sum: u32 = 0;
    for i in 0..n {
        require!(slot_bps[i] > 0, PicoError::InvalidBps);
        sum = sum.saturating_add(slot_bps[i] as u32);
    }
    require!(sum == BPS_DENOM as u32, PicoError::InvalidBps);
    for i in n..MAX_SLOTS {
        require!(slot_bps[i] == 0, PicoError::InvalidBps);
    }
    Ok(())
}

fn require_unique_holders(slot_count: usize, holders: &[Pubkey; MAX_SLOTS]) -> Result<()> {
    for i in 0..slot_count {
        for j in (i + 1)..slot_count {
            require!(holders[i] != holders[j], PicoError::DuplicateHolder);
        }
    }
    Ok(())
}

fn transfer_from_signer<'info>(
    token_program: &Program<'info, Token>,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    amount: u64,
) -> Result<()> {
    token::transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        amount,
    )
}

struct RefundParts<'info> {
    token_program: AccountInfo<'info>,
    vault: AccountInfo<'info>,
    vault_authority: AccountInfo<'info>,
    client_token_account: AccountInfo<'info>,
    task_key: Pubkey,
    vault_bump: u8,
}

fn refund_client<'info>(parts: RefundParts<'info>, amount: u64) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    let bump = [parts.vault_bump];
    let seeds: &[&[u8]] = &[b"vault_authority", parts.task_key.as_ref(), &bump];
    let signer = &[seeds];
    token::transfer(
        CpiContext::new_with_signer(
            parts.token_program,
            Transfer {
                from: parts.vault,
                to: parts.client_token_account,
                authority: parts.vault_authority,
            },
            signer,
        ),
        amount,
    )
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub mint: Account<'info, Mint>,

    #[account(
        constraint = treasury_token_account.mint == mint.key() @ PicoError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOperator<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = authority @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
#[instruction(skill_id: u16)]
pub struct IssueCredential<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    /// CHECK: worker receiving credential.
    pub worker: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + SkillCredential::INIT_SPACE,
        seeds = [b"credential", worker.key().as_ref(), &skill_id.to_le_bytes()],
        bump
    )]
    pub credential: Account<'info, SkillCredential>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefreshCredential<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [
            b"credential",
            credential.worker.as_ref(),
            &credential.skill_id.to_le_bytes()
        ],
        bump = credential.bump
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        close = operator,
        seeds = [
            b"credential",
            credential.worker.as_ref(),
            &credential.skill_id.to_le_bytes()
        ],
        bump = credential.bump
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
#[instruction(
    skill_id: u16,
    reward: u64,
    deadline_ts: i64,
    task_nonce: u64,
    review_count: u8,
    slot_bps: [u16; MAX_SLOTS]
)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.mint == mint.key() @ PicoError::MintMismatch
    )]
    pub config: Account<'info, Config>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = client,
        space = 8 + Task::INIT_SPACE,
        seeds = [b"task", client.key().as_ref(), &task_nonce.to_le_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,

    /// CHECK: PDA authority for vault ATA.
    #[account(
        seeds = [b"vault_authority", task.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = client,
        associated_token::mint = mint,
        associated_token::authority = vault_authority
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ PicoError::Unauthorized,
        constraint = client_token_account.mint == mint.key() @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelTask<'info> {
    pub client: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", client.key().as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = client @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,

    /// CHECK: vault authority
    #[account(
        seeds = [b"vault_authority", task.key().as_ref()],
        bump = task.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> CancelTask<'info> {
    fn into_refund_parts(&self) -> RefundParts<'info> {
        RefundParts {
            token_program: self.token_program.to_account_info(),
            vault: self.vault.to_account_info(),
            vault_authority: self.vault_authority.to_account_info(),
            client_token_account: self.client_token_account.to_account_info(),
            task_key: self.task.key(),
            vault_bump: self.task.vault_bump,
        }
    }
}

#[derive(Accounts)]
pub struct ExpireQualifyingTask<'info> {
    /// CHECK: refund recipient
    #[account(mut)]
    pub client: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        constraint = task.client == client.key() @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,

    /// CHECK: vault authority
    #[account(
        seeds = [b"vault_authority", task.key().as_ref()],
        bump = task.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

impl<'info> ExpireQualifyingTask<'info> {
    fn into_refund_parts(&self) -> RefundParts<'info> {
        RefundParts {
            token_program: self.token_program.to_account_info(),
            vault: self.vault.to_account_info(),
            vault_authority: self.vault_authority.to_account_info(),
            client_token_account: self.client_token_account.to_account_info(),
            task_key: self.task.key(),
            vault_bump: self.task.vault_bump,
        }
    }
}

#[derive(Accounts)]
pub struct AssignTeam<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct DeclineSlot<'info> {
    pub holder: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct FillSlot<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,

    /// CHECK: single-seat race winner.
    pub new_holder: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SubmitExecution<'info> {
    pub executor: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        constraint = task.slot_holders[0] == executor.key() @ PicoError::Unauthorized
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct SubmitVerification<'info> {
    pub verifier: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct RejectVerification<'info> {
    pub verifier: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct FinalizeAndPay<'info> {
    pub payer_sig: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.treasury == treasury_token_account.key() @ PicoError::TreasuryMismatch
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,

    /// CHECK: vault authority
    #[account(
        seeds = [b"vault_authority", task.key().as_ref()],
        bump = task.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    pub party: Signer<'info>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump
    )]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub operator: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        has_one = operator @ PicoError::Unauthorized,
        constraint = config.treasury == treasury_token_account.key() @ PicoError::TreasuryMismatch
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,

    /// CHECK: vault authority
    #[account(
        seeds = [b"vault_authority", task.key().as_ref()],
        bump = task.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority: Pubkey,
    pub operator: Pubkey,
    pub mint: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct SkillCredential {
    pub worker: Pubkey,
    pub skill_id: u16,
    pub level: u8,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    pub client: Pubkey,
    pub skill_id: u16,
    pub task_nonce: u64,
    pub reward: u64,
    pub deadline: i64,
    pub status: TaskStatus,
    /// N verification slots (1..=3). Total seats = N+1.
    pub review_count: u8,
    pub slot_count: u8,
    /// Share of *net* (after platform fee). Indices 0..slot_count sum to 10_000.
    pub slot_bps: [u16; MAX_SLOTS],
    pub slot_holders: [Pubkey; MAX_SLOTS],
    /// Test-3 time (ms) for transparent ranking UI.
    pub slot_times_ms: [u32; MAX_SLOTS],
    /// [0]=execution result; [1..]=verification artifacts.
    pub work_hashes: [[u8; 32]; MAX_SLOTS],
    pub explanation_hash: [u8; 32],
    /// 0 while Working; 1..N while InReview.
    pub active_slot: u8,
    pub hiring_slot: u8,
    pub vault: Pubkey,
    pub bump: u8,
    pub vault_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TaskStatus {
    Qualifying,
    Working,
    InReview,
    HiringSlot,
    Submitted,
    Paid,
    Disputed,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, InitSpace)]
pub enum DisputeReason {
    VerificationFailed,
    RaisedByParty,
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

#[event]
pub struct TaskCreatedEvent {
    pub task: Pubkey,
    pub client: Pubkey,
    pub skill_id: u16,
    pub reward: u64,
    pub deadline: i64,
    pub task_nonce: u64,
    pub review_count: u8,
}

#[event]
pub struct TaskCancelledEvent {
    pub task: Pubkey,
    pub client: Pubkey,
    pub amount: u64,
}

#[event]
pub struct TaskExpiredEvent {
    pub task: Pubkey,
    pub amount: u64,
}

#[event]
pub struct TeamAssignedEvent {
    pub task: Pubkey,
    pub holders: [Pubkey; MAX_SLOTS],
    pub times_ms: [u32; MAX_SLOTS],
}

#[event]
pub struct SlotDeclinedEvent {
    pub task: Pubkey,
    pub slot_index: u8,
    pub by: Pubkey,
}

#[event]
pub struct SlotFilledEvent {
    pub task: Pubkey,
    pub slot_index: u8,
    pub holder: Pubkey,
    pub time_ms: u32,
}

#[event]
pub struct ExecutionSubmittedEvent {
    pub task: Pubkey,
    pub executor: Pubkey,
    pub result_hash: [u8; 32],
    pub explanation_hash: [u8; 32],
}

#[event]
pub struct VerificationSubmittedEvent {
    pub task: Pubkey,
    pub slot_index: u8,
    pub review_hash: [u8; 32],
    pub next_slot: u8,
}

#[event]
pub struct ChainCompleteEvent {
    pub task: Pubkey,
    pub last_slot: u8,
}

#[event]
pub struct TaskPaidEvent {
    pub task: Pubkey,
    pub fee: u64,
    pub pays: [u64; MAX_SLOTS],
}

#[event]
pub struct TaskDisputedEvent {
    pub task: Pubkey,
    pub by: Pubkey,
    pub reason: DisputeReason,
}

#[event]
pub struct DisputeResolvedEvent {
    pub task: Pubkey,
    pub client_amount: u64,
    pub fee_amount: u64,
    pub slot_amounts: [u64; MAX_SLOTS],
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[error_code]
pub enum PicoError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Mint mismatch")]
    MintMismatch,
    #[msg("Vault mismatch")]
    VaultMismatch,
    #[msg("Treasury mismatch")]
    TreasuryMismatch,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid bps / slot split")]
    InvalidBps,
    #[msg("Invalid credential level")]
    InvalidLevel,
    #[msg("Deadline must be in the future")]
    DeadlineInPast,
    #[msg("Task not yet expired")]
    NotExpired,
    #[msg("Invalid task status for this instruction")]
    InvalidStatus,
    #[msg("Hash must be non-zero")]
    EmptyHash,
    #[msg("Vault is empty")]
    EmptyVault,
    #[msg("Payout amounts must sum to vault balance")]
    PayoutMismatch,
    #[msg("review_count must be 1..=3")]
    InvalidReviewCount,
    #[msg("Slot holder missing")]
    EmptySlot,
    #[msg("Invalid unused slot payload")]
    InvalidSlotPayload,
    #[msg("Duplicate slot holder")]
    DuplicateHolder,
    #[msg("Execution must be fastest (lowest time_ms)")]
    RankingInvalid,
    #[msg("Not the active slot for this action")]
    NotActiveSlot,
    #[msg("Wrong hiring slot index")]
    WrongHiringSlot,
    #[msg("Invalid slot index")]
    InvalidSlotIndex,
    #[msg("Unexpected remaining accounts length")]
    RemainingAccounts,
}
