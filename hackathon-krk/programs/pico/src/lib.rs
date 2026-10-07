use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j");

pub const BPS_DENOM: u64 = 10_000;
/// Worker who declines a change request keeps half of the current reward.
pub const DECLINE_BPS: u64 = 5_000;
/// Client silence after submission pays the worker. Matches the design: 14 days.
pub const AUTO_ACCEPT_SECS: i64 = 14 * 24 * 60 * 60;

/// Escrow for the current Pico UI.
///
/// One worker does the task. The client reviews, or one independent reviewer
/// does, for a fee locked on top of the reward. There is no slot team.
///
/// Finding → claim → Assigned → InProgress → submit
///   → Submitted (client) or InVerification (reviewer)
///   → Paid, or Revision and submit again.
/// A declined change pays the worker 50% and returns the task to Finding.
/// Cancel together, or nobody claims before `finding_deadline`, refunds the vault.
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

    /// Reviewer fee rate. The worker reward is not skimmed.
    pub fn update_fees(ctx: Context<UpdateFees>, fee_bps: u16) -> Result<()> {
        require!(fee_bps <= 2_500, PicoError::InvalidBps);
        ctx.accounts.config.fee_bps = fee_bps;
        Ok(())
    }

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

    /// Lock the worker reward and, when `with_reviewer` is set, the reviewer fee on top.
    pub fn create_task(
        ctx: Context<CreateTask>,
        skill_id: u16,
        min_level: u8,
        reward: u64,
        task_nonce: u64,
        with_reviewer: bool,
        finding_deadline: i64,
    ) -> Result<()> {
        require!(reward > 0, PicoError::ZeroAmount);
        require!(min_level > 0, PicoError::InvalidLevel);
        let now = Clock::get()?.unix_timestamp;
        require!(finding_deadline > now, PicoError::DeadlineInPast);

        let fee = if with_reviewer {
            reviewer_fee(reward, ctx.accounts.config.fee_bps)
        } else {
            0
        };
        pull(
            &ctx.accounts.token_program,
            &ctx.accounts.client_token_account,
            &ctx.accounts.vault,
            &ctx.accounts.client,
            reward.saturating_add(fee),
        )?;

        let task = &mut ctx.accounts.task;
        task.client = ctx.accounts.client.key();
        task.worker = Pubkey::default();
        task.reviewer = Pubkey::default();
        task.skill_id = skill_id;
        task.min_level = min_level;
        task.task_nonce = task_nonce;
        task.reward = reward;
        task.reviewer_fee = fee;
        task.finding_deadline = finding_deadline;
        task.work_deadline = 0;
        task.submitted_at = 0;
        task.status = TaskStatus::Finding;
        task.work_hash = [0u8; 32];
        task.change_open = false;
        task.change_reward = 0;
        task.change_deadline = 0;
        task.vault = ctx.accounts.vault.key();
        task.bump = ctx.bumps.task;
        task.vault_bump = ctx.bumps.vault_authority;
        Ok(())
    }

    /// Nobody claimed before the finding deadline. Full refund.
    pub fn expire_finding(ctx: Context<SettleClient>) -> Result<()> {
        let status = ctx.accounts.task.status;
        let worker = ctx.accounts.task.worker;
        let deadline = ctx.accounts.task.finding_deadline;
        let amount = ctx
            .accounts
            .task
            .reward
            .saturating_add(ctx.accounts.task.reviewer_fee);
        let bump = ctx.accounts.task.vault_bump;
        let key = ctx.accounts.task.key();
        require!(status == TaskStatus::Finding, PicoError::BadStatus);
        require!(worker == Pubkey::default(), PicoError::BadStatus);
        let now = Clock::get()?.unix_timestamp;
        require!(now >= deadline, PicoError::FindingOpen);
        transfer_from_vault(
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.vault_authority.to_account_info(),
            &ctx.accounts.client_token_account.to_account_info(),
            &key,
            bump,
            amount,
        )?;
        let task = &mut ctx.accounts.task;
        task.reward = 0;
        task.reviewer_fee = 0;
        task.status = TaskStatus::Refunded;
        Ok(())
    }

    /// First eligible worker: skill matches and level is high enough. First transaction wins.
    pub fn claim_task(ctx: Context<ClaimTask>, work_deadline: i64) -> Result<()> {
        let now = Clock::get()?.unix_timestamp;
        require!(work_deadline > now, PicoError::DeadlineInPast);
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Finding, PicoError::BadStatus);
        require!(task.worker == Pubkey::default(), PicoError::BadStatus);
        require!(now < task.finding_deadline, PicoError::FindingClosed);
        require!(
            ctx.accounts.credential.skill_id == task.skill_id,
            PicoError::SkillMismatch
        );
        require!(
            ctx.accounts.credential.level >= task.min_level,
            PicoError::LevelTooLow
        );
        task.worker = ctx.accounts.worker.key();
        task.work_deadline = work_deadline;
        task.status = TaskStatus::Assigned;
        Ok(())
    }

    pub fn start_work(ctx: Context<WorkerOnly>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::Assigned, PicoError::BadStatus);
        require!(task.worker == ctx.accounts.worker.key(), PicoError::Unauthorized);
        task.status = TaskStatus::InProgress;
        Ok(())
    }

    pub fn submit_work(ctx: Context<WorkerOnly>, work_hash: [u8; 32]) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.worker == ctx.accounts.worker.key(), PicoError::Unauthorized);
        require!(
            task.status == TaskStatus::Assigned
                || task.status == TaskStatus::InProgress
                || task.status == TaskStatus::Revision,
            PicoError::BadStatus
        );
        task.work_hash = work_hash;
        task.change_open = false;
        task.submitted_at = Clock::get()?.unix_timestamp;
        task.status = if task.reviewer_fee > 0 {
            TaskStatus::InVerification
        } else {
            TaskStatus::Submitted
        };
        Ok(())
    }

    pub fn claim_review(ctx: Context<ClaimReview>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        require!(task.status == TaskStatus::InVerification, PicoError::BadStatus);
        require!(task.reviewer == Pubkey::default(), PicoError::BadStatus);
        require!(task.reviewer_fee > 0, PicoError::BadStatus);
        require!(
            ctx.accounts.reviewer.key() != task.worker,
            PicoError::SameParty
        );
        require!(
            ctx.accounts.credential.skill_id == task.skill_id,
            PicoError::SkillMismatch
        );
        require!(
            ctx.accounts.credential.level >= task.min_level,
            PicoError::LevelTooLow
        );
        task.reviewer = ctx.accounts.reviewer.key();
        Ok(())
    }

    /// Client accepts. Only when there is no independent reviewer.
    pub fn accept_work(ctx: Context<AcceptWork>) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Submitted,
            PicoError::BadStatus
        );
        require!(ctx.accounts.task.reviewer_fee == 0, PicoError::BadStatus);
        pay_success(ctx)
    }

    /// Anyone can crank this 14 days after submission, client review only.
    pub fn auto_accept(ctx: Context<AutoAccept>) -> Result<()> {
        let status = ctx.accounts.task.status;
        let fee = ctx.accounts.task.reviewer_fee;
        let submitted_at = ctx.accounts.task.submitted_at;
        let reward = ctx.accounts.task.reward;
        require!(status == TaskStatus::Submitted, PicoError::BadStatus);
        require!(fee == 0, PicoError::BadStatus);
        let now = Clock::get()?.unix_timestamp;
        require!(
            submitted_at > 0 && now >= submitted_at + AUTO_ACCEPT_SECS,
            PicoError::TooEarly
        );
        pay_worker(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.vault_authority,
            &ctx.accounts.worker_token_account,
            &ctx.accounts.task,
            reward,
        )?;
        let task = &mut ctx.accounts.task;
        task.reward = 0;
        task.status = TaskStatus::Paid;
        Ok(())
    }

    pub fn request_revision(ctx: Context<RequestRevision>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let signer = ctx.accounts.signer.key();
        if task.status == TaskStatus::Submitted {
            require!(signer == task.client, PicoError::Unauthorized);
        } else if task.status == TaskStatus::InVerification {
            require!(task.reviewer != Pubkey::default(), PicoError::BadStatus);
            require!(signer == task.reviewer, PicoError::Unauthorized);
        } else {
            return err!(PicoError::BadStatus);
        }
        task.status = TaskStatus::Revision;
        Ok(())
    }

    /// Reviewer passes. Pays the worker the full reward and the reviewer the fee once.
    pub fn pass_review(ctx: Context<PassReview>) -> Result<()> {
        let status = ctx.accounts.task.status;
        let reviewer = ctx.accounts.task.reviewer;
        let reward = ctx.accounts.task.reward;
        require!(status == TaskStatus::InVerification, PicoError::BadStatus);
        require!(reviewer == ctx.accounts.reviewer.key(), PicoError::Unauthorized);
        require!(reviewer != Pubkey::default(), PicoError::BadStatus);
        pay_worker(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.vault_authority,
            &ctx.accounts.worker_token_account,
            &ctx.accounts.task,
            reward,
        )?;
        pay_reviewer_or_refund_fee(
            &ctx.accounts.token_program,
            &ctx.accounts.vault,
            &ctx.accounts.vault_authority,
            &ctx.accounts.reviewer_token_account,
            &ctx.accounts.client_token_account,
            &ctx.accounts.task,
        )?;
        let task = &mut ctx.accounts.task;
        task.reward = 0;
        task.reviewer_fee = 0;
        task.status = TaskStatus::Paid;
        Ok(())
    }

    /// Higher reward locks the difference now. Lower reward moves nothing until the worker accepts.
    pub fn propose_change(
        ctx: Context<ProposeChange>,
        new_reward: u64,
        new_deadline: i64,
    ) -> Result<()> {
        require!(new_reward > 0, PicoError::ZeroAmount);
        let now = Clock::get()?.unix_timestamp;
        require!(new_deadline > now, PicoError::DeadlineInPast);
        let client = ctx.accounts.task.client;
        let change_open = ctx.accounts.task.change_open;
        let status = ctx.accounts.task.status;
        let reward = ctx.accounts.task.reward;
        require!(ctx.accounts.client.key() == client, PicoError::Unauthorized);
        require!(!change_open, PicoError::ChangeOpen);
        require!(
            status == TaskStatus::Assigned
                || status == TaskStatus::InProgress
                || status == TaskStatus::Revision,
            PicoError::BadStatus
        );
        if new_reward > reward {
            pull(
                &ctx.accounts.token_program,
                &ctx.accounts.client_token_account,
                &ctx.accounts.vault,
                &ctx.accounts.client,
                new_reward - reward,
            )?;
        }
        let task = &mut ctx.accounts.task;
        task.change_open = true;
        task.change_reward = new_reward;
        task.change_deadline = new_deadline;
        Ok(())
    }

    pub fn accept_change(ctx: Context<AcceptChange>) -> Result<()> {
        let task_key = ctx.accounts.task.key();
        let bump = ctx.accounts.task.vault_bump;
        let reward = ctx.accounts.task.reward;
        let next = ctx.accounts.task.change_reward;
        require!(ctx.accounts.task.change_open, PicoError::NothingToChange);
        require!(
            ctx.accounts.task.worker == ctx.accounts.worker.key(),
            PicoError::Unauthorized
        );
        if next < reward {
            transfer_from_vault(
                &ctx.accounts.token_program.to_account_info(),
                &ctx.accounts.vault.to_account_info(),
                &ctx.accounts.vault_authority.to_account_info(),
                &ctx.accounts.client_token_account.to_account_info(),
                &task_key,
                bump,
                reward - next,
            )?;
        }
        let task = &mut ctx.accounts.task;
        task.reward = next;
        task.work_deadline = task.change_deadline;
        task.change_open = false;
        task.change_reward = 0;
        task.change_deadline = 0;
        Ok(())
    }

    /// Worker declines. They receive half of the current reward and leave.
    /// A proposed top-up that was not accepted goes back to the client.
    /// The task is Finding again for the remaining reward.
    pub fn decline_change(ctx: Context<DeclineChange>) -> Result<()> {
        let current = ctx.accounts.task.reward;
        let proposed = ctx.accounts.task.change_reward;
        let bump = ctx.accounts.task.vault_bump;
        let key = ctx.accounts.task.key();
        require!(ctx.accounts.task.change_open, PicoError::NothingToChange);
        require!(
            ctx.accounts.task.worker == ctx.accounts.worker.key(),
            PicoError::Unauthorized
        );
        if proposed > current {
            transfer_from_vault(
                &ctx.accounts.token_program.to_account_info(),
                &ctx.accounts.vault.to_account_info(),
                &ctx.accounts.vault_authority.to_account_info(),
                &ctx.accounts.client_token_account.to_account_info(),
                &key,
                bump,
                proposed - current,
            )?;
        }
        let half = current * DECLINE_BPS / BPS_DENOM;
        transfer_from_vault(
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.vault_authority.to_account_info(),
            &ctx.accounts.worker_token_account.to_account_info(),
            &key,
            bump,
            half,
        )?;
        let task = &mut ctx.accounts.task;
        task.reward = current - half;
        task.worker = Pubkey::default();
        task.change_open = false;
        task.change_reward = 0;
        task.change_deadline = 0;
        task.work_hash = [0u8; 32];
        task.submitted_at = 0;
        task.status = if task.reward == 0 && task.reviewer_fee == 0 {
            TaskStatus::Refunded
        } else {
            TaskStatus::Finding
        };
        let now = Clock::get()?.unix_timestamp;
        if task.status == TaskStatus::Finding {
            task.finding_deadline = now + 7 * 24 * 60 * 60;
        }
        Ok(())
    }

    /// While Finding again, the client can add reward for the next worker.
    pub fn top_up(ctx: Context<ProposeChange>, amount: u64) -> Result<()> {
        require!(amount > 0, PicoError::ZeroAmount);
        let client = ctx.accounts.task.client;
        let status = ctx.accounts.task.status;
        let worker = ctx.accounts.task.worker;
        require!(ctx.accounts.client.key() == client, PicoError::Unauthorized);
        require!(status == TaskStatus::Finding, PicoError::BadStatus);
        require!(worker == Pubkey::default(), PicoError::BadStatus);
        pull(
            &ctx.accounts.token_program,
            &ctx.accounts.client_token_account,
            &ctx.accounts.vault,
            &ctx.accounts.client,
            amount,
        )?;
        ctx.accounts.task.reward = ctx.accounts.task.reward.saturating_add(amount);
        Ok(())
    }

    pub fn cancel_together(ctx: Context<CancelTogether>) -> Result<()> {
        let reward = ctx.accounts.task.reward;
        let fee = ctx.accounts.task.reviewer_fee;
        let proposed = ctx.accounts.task.change_reward;
        let change_open = ctx.accounts.task.change_open;
        let bump = ctx.accounts.task.vault_bump;
        let key = ctx.accounts.task.key();
        require!(
            ctx.accounts.task.worker == ctx.accounts.worker.key(),
            PicoError::Unauthorized
        );
        require!(
            matches!(
                ctx.accounts.task.status,
                TaskStatus::Assigned
                    | TaskStatus::InProgress
                    | TaskStatus::Submitted
                    | TaskStatus::InVerification
                    | TaskStatus::Revision
            ),
            PicoError::BadStatus
        );
        let extra = if change_open && proposed > reward {
            proposed - reward
        } else {
            0
        };
        transfer_from_vault(
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.vault_authority.to_account_info(),
            &ctx.accounts.client_token_account.to_account_info(),
            &key,
            bump,
            reward.saturating_add(fee).saturating_add(extra),
        )?;
        let task = &mut ctx.accounts.task;
        task.reward = 0;
        task.reviewer_fee = 0;
        task.change_open = false;
        task.status = TaskStatus::Refunded;
        Ok(())
    }

    pub fn raise_dispute(ctx: Context<RaiseDispute>) -> Result<()> {
        let task = &mut ctx.accounts.task;
        let signer = ctx.accounts.signer.key();
        require!(
            signer == task.client || signer == task.worker,
            PicoError::Unauthorized
        );
        require!(
            matches!(
                task.status,
                TaskStatus::Assigned
                    | TaskStatus::InProgress
                    | TaskStatus::Submitted
                    | TaskStatus::InVerification
                    | TaskStatus::Revision
            ),
            PicoError::BadStatus
        );
        task.status = TaskStatus::Disputed;
        Ok(())
    }

    /// Operator splits the vault. Amounts are absolute tokens and must equal the vault.
    /// `reopen` sends nothing and puts the task back in Finding.
    pub fn resolve_dispute(ctx: Context<ResolveDispute>, to_worker: u64, to_reviewer: u64, to_client: u64, reopen: bool) -> Result<()> {
        require!(
            ctx.accounts.task.status == TaskStatus::Disputed,
            PicoError::BadStatus
        );
        if reopen {
            require!(
                to_worker == 0 && to_reviewer == 0 && to_client == 0,
                PicoError::AmountMismatch
            );
            let task = &mut ctx.accounts.task;
            task.worker = Pubkey::default();
            task.reviewer = Pubkey::default();
            task.change_open = false;
            task.submitted_at = 0;
            task.work_hash = [0u8; 32];
            task.status = TaskStatus::Finding;
            task.finding_deadline = Clock::get()?.unix_timestamp + 7 * 24 * 60 * 60;
            return Ok(());
        }
        let locked = vault_balance(&ctx.accounts.vault)?;
        require!(
            to_worker.saturating_add(to_reviewer).saturating_add(to_client) == locked,
            PicoError::AmountMismatch
        );
        let bump = ctx.accounts.task.vault_bump;
        let key = ctx.accounts.task.key();
        transfer_from_vault(&ctx.accounts.token_program.to_account_info(), &ctx.accounts.vault.to_account_info(), &ctx.accounts.vault_authority.to_account_info(), &ctx.accounts.worker_token_account.to_account_info(), &key, bump, to_worker)?;
        transfer_from_vault(&ctx.accounts.token_program.to_account_info(), &ctx.accounts.vault.to_account_info(), &ctx.accounts.vault_authority.to_account_info(), &ctx.accounts.reviewer_token_account.to_account_info(), &key, bump, to_reviewer)?;
        transfer_from_vault(&ctx.accounts.token_program.to_account_info(), &ctx.accounts.vault.to_account_info(), &ctx.accounts.vault_authority.to_account_info(), &ctx.accounts.client_token_account.to_account_info(), &key, bump, to_client)?;
        let task = &mut ctx.accounts.task;
        task.reward = 0;
        task.reviewer_fee = 0;
        task.change_open = false;
        task.status = if to_worker > 0 || to_reviewer > 0 {
            TaskStatus::Paid
        } else {
            TaskStatus::Refunded
        };
        Ok(())
    }
}

fn reviewer_fee(reward: u64, fee_bps: u16) -> u64 {
    ((reward as u128).saturating_mul(fee_bps as u128) / BPS_DENOM as u128) as u64
}

fn vault_balance(vault: &Account<TokenAccount>) -> Result<u64> {
    Ok(vault.amount)
}

fn pull<'info>(
    token_program: &Program<'info, Token>,
    from: &Account<'info, TokenAccount>,
    to: &Account<'info, TokenAccount>,
    authority: &Signer<'info>,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
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

fn transfer_from_vault<'info>(
    token_program: &AccountInfo<'info>,
    vault: &AccountInfo<'info>,
    vault_authority: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    task_key: &Pubkey,
    vault_bump: u8,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    let bump = [vault_bump];
    let seeds: &[&[u8]] = &[b"vault_authority", task_key.as_ref(), &bump];
    token::transfer(
        CpiContext::new_with_signer(
            token_program.clone(),
            Transfer {
                from: vault.clone(),
                to: to.clone(),
                authority: vault_authority.clone(),
            },
            &[seeds],
        ),
        amount,
    )
}

fn pay_worker<'info>(
    token_program: &Program<'info, Token>,
    vault: &Account<'info, TokenAccount>,
    vault_authority: &UncheckedAccount<'info>,
    worker_token_account: &Account<'info, TokenAccount>,
    task: &Account<'info, Task>,
    amount: u64,
) -> Result<()> {
    transfer_from_vault(
        &token_program.to_account_info(),
        &vault.to_account_info(),
        &vault_authority.to_account_info(),
        &worker_token_account.to_account_info(),
        &task.key(),
        task.vault_bump,
        amount,
    )
}

fn pay_reviewer_or_refund_fee<'info>(
    token_program: &Program<'info, Token>,
    vault: &Account<'info, TokenAccount>,
    vault_authority: &UncheckedAccount<'info>,
    reviewer_token_account: &Account<'info, TokenAccount>,
    client_token_account: &Account<'info, TokenAccount>,
    task: &Account<'info, Task>,
) -> Result<()> {
    if task.reviewer_fee == 0 {
        return Ok(());
    }
    let dest = if task.reviewer == Pubkey::default() {
        client_token_account.to_account_info()
    } else {
        reviewer_token_account.to_account_info()
    };
    transfer_from_vault(
        &token_program.to_account_info(),
        &vault.to_account_info(),
        &vault_authority.to_account_info(),
        &dest,
        &task.key(),
        task.vault_bump,
        task.reviewer_fee,
    )
}

fn pay_success(ctx: Context<AcceptWork>) -> Result<()> {
    let reward = ctx.accounts.task.reward;
    let fee = ctx.accounts.task.reviewer_fee;
    let bump = ctx.accounts.task.vault_bump;
    let key = ctx.accounts.task.key();
    pay_worker(
        &ctx.accounts.token_program,
        &ctx.accounts.vault,
        &ctx.accounts.vault_authority,
        &ctx.accounts.worker_token_account,
        &ctx.accounts.task,
        reward,
    )?;
    if fee > 0 {
        transfer_from_vault(
            &ctx.accounts.token_program.to_account_info(),
            &ctx.accounts.vault.to_account_info(),
            &ctx.accounts.vault_authority.to_account_info(),
            &ctx.accounts.client_token_account.to_account_info(),
            &key,
            bump,
            fee,
        )?;
    }
    let task = &mut ctx.accounts.task;
    task.reward = 0;
    task.reviewer_fee = 0;
    task.status = TaskStatus::Paid;
    Ok(())
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
    #[account(constraint = treasury_token_account.mint == mint.key() @ PicoError::MintMismatch)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateOperator<'info> {
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump, has_one = authority @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct UpdateFees<'info> {
    pub authority: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump = config.bump, has_one = authority @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
#[instruction(skill_id: u16)]
pub struct IssueCredential<'info> {
    pub operator: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, has_one = operator @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
    /// CHECK: worker receiving the credential.
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
    #[account(seeds = [b"config"], bump = config.bump, has_one = operator @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"credential", credential.worker.as_ref(), &credential.skill_id.to_le_bytes()],
        bump = credential.bump
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    pub operator: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, has_one = operator @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        close = operator,
        seeds = [b"credential", credential.worker.as_ref(), &credential.skill_id.to_le_bytes()],
        bump = credential.bump
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
#[instruction(skill_id: u16, min_level: u8, reward: u64, task_nonce: u64)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, has_one = mint @ PicoError::MintMismatch)]
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
    /// CHECK: vault signer PDA.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump)]
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
pub struct SettleClient<'info> {
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimTask<'info> {
    pub worker: Signer<'info>,
    #[account(mut, seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()], bump = task.bump)]
    pub task: Account<'info, Task>,
    #[account(
        seeds = [b"credential", worker.key().as_ref(), &task.skill_id.to_le_bytes()],
        bump = credential.bump,
        constraint = credential.worker == worker.key() @ PicoError::Unauthorized
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
pub struct WorkerOnly<'info> {
    pub worker: Signer<'info>,
    #[account(mut, seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()], bump = task.bump)]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct ClaimReview<'info> {
    pub reviewer: Signer<'info>,
    #[account(mut, seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()], bump = task.bump)]
    pub task: Account<'info, Task>,
    #[account(
        seeds = [b"credential", reviewer.key().as_ref(), &task.skill_id.to_le_bytes()],
        bump = credential.bump,
        constraint = credential.worker == reviewer.key() @ PicoError::Unauthorized
    )]
    pub credential: Account<'info, SkillCredential>,
}

#[derive(Accounts)]
pub struct AcceptWork<'info> {
    pub client: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = client @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == task.worker @ PicoError::Unauthorized,
        constraint = worker_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AutoAccept<'info> {
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == task.worker @ PicoError::Unauthorized,
        constraint = worker_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RequestRevision<'info> {
    pub signer: Signer<'info>,
    #[account(mut, seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()], bump = task.bump)]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct PassReview<'info> {
    pub reviewer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == task.worker @ PicoError::Unauthorized,
        constraint = worker_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = reviewer_token_account.owner == task.reviewer @ PicoError::Unauthorized,
        constraint = reviewer_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub reviewer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ProposeChange<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    #[account(mut, constraint = vault.mint == client_token_account.mint @ PicoError::MintMismatch)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == client.key() @ PicoError::Unauthorized
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AcceptChange<'info> {
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DeclineChange<'info> {
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = worker_token_account.owner == worker.key() @ PicoError::Unauthorized,
        constraint = worker_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelTogether<'info> {
    pub client: Signer<'info>,
    pub worker: Signer<'info>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = client @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    pub signer: Signer<'info>,
    #[account(mut, seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()], bump = task.bump)]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    pub operator: Signer<'info>,
    #[account(seeds = [b"config"], bump = config.bump, has_one = operator @ PicoError::Unauthorized)]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [b"task", task.client.as_ref(), &task.task_nonce.to_le_bytes()],
        bump = task.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub task: Account<'info, Task>,
    /// CHECK: vault signer.
    #[account(seeds = [b"vault_authority", task.key().as_ref()], bump = task.vault_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = worker_token_account.mint == vault.mint @ PicoError::MintMismatch)]
    pub worker_token_account: Account<'info, TokenAccount>,
    #[account(mut, constraint = reviewer_token_account.mint == vault.mint @ PicoError::MintMismatch)]
    pub reviewer_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = client_token_account.owner == task.client @ PicoError::Unauthorized,
        constraint = client_token_account.mint == vault.mint @ PicoError::MintMismatch
    )]
    pub client_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

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
    pub worker: Pubkey,
    pub reviewer: Pubkey,
    pub skill_id: u16,
    pub min_level: u8,
    pub task_nonce: u64,
    pub reward: u64,
    pub reviewer_fee: u64,
    pub finding_deadline: i64,
    pub work_deadline: i64,
    pub submitted_at: i64,
    pub status: TaskStatus,
    pub work_hash: [u8; 32],
    pub change_open: bool,
    pub change_reward: u64,
    pub change_deadline: i64,
    pub vault: Pubkey,
    pub bump: u8,
    pub vault_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum TaskStatus {
    Finding,
    Assigned,
    InProgress,
    Submitted,
    InVerification,
    Revision,
    Disputed,
    Paid,
    Refunded,
}

#[error_code]
pub enum PicoError {
    #[msg("Amount must be greater than zero.")]
    ZeroAmount,
    #[msg("Fee is above the allowed maximum.")]
    InvalidBps,
    #[msg("Level must be at least 1.")]
    InvalidLevel,
    #[msg("Deadline is not in the future.")]
    DeadlineInPast,
    #[msg("Signer cannot do this.")]
    Unauthorized,
    #[msg("Task is not in the right status.")]
    BadStatus,
    #[msg("Credential is for a different skill.")]
    SkillMismatch,
    #[msg("Credential level is below the task.")]
    LevelTooLow,
    #[msg("Reviewer and worker must be different.")]
    SameParty,
    #[msg("Finding window is still open.")]
    FindingOpen,
    #[msg("Finding window has closed.")]
    FindingClosed,
    #[msg("No change is waiting.")]
    NothingToChange,
    #[msg("A change is already waiting.")]
    ChangeOpen,
    #[msg("Payout amounts do not match the vault.")]
    AmountMismatch,
    #[msg("Vault account does not match the task.")]
    VaultMismatch,
    #[msg("Token mint does not match.")]
    MintMismatch,
    #[msg("Too early for automatic payout.")]
    TooEarly,
}
