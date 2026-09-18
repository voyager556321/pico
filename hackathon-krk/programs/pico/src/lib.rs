use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("6irGnLScTsE7i5C1Ai74rdhD1iKG3rdxJnZWNnWthV7j");

#[program]
pub mod pico {
    use super::*;

    /// One-time protocol config: operator (backend), USDC mint, treasury ATA.
    pub fn initialize_config(ctx: Context<InitializeConfig>, operator: Pubkey) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.operator = operator;
        config.mint = ctx.accounts.mint.key();
        config.treasury = ctx.accounts.treasury_token_account.key();
        config.bump = ctx.bumps.config;
        Ok(())
    }

    pub fn update_operator(ctx: Context<UpdateOperator>, new_operator: Pubkey) -> Result<()> {
        ctx.accounts.config.operator = new_operator;
        Ok(())
    }

    /// Create user Budget PDA + vault ATA, deposit initial USDC.
    pub fn initialize_budget(ctx: Context<InitializeBudget>, amount: u64) -> Result<()> {
        require!(amount > 0, PicoError::ZeroAmount);

        let budget = &mut ctx.accounts.budget;
        budget.owner = ctx.accounts.owner.key();
        budget.mint = ctx.accounts.mint.key();
        budget.vault = ctx.accounts.vault.key();
        budget.total_deposited = 0;
        budget.total_spent = 0;
        budget.spend_count = 0;
        budget.bump = ctx.bumps.budget;
        budget.vault_bump = ctx.bumps.vault_authority;

        transfer_from_owner(
            &ctx.accounts.token_program,
            &ctx.accounts.owner_token_account,
            &ctx.accounts.vault,
            &ctx.accounts.owner,
            amount,
        )?;

        ctx.accounts.budget.total_deposited = amount;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, PicoError::ZeroAmount);

        transfer_from_owner(
            &ctx.accounts.token_program,
            &ctx.accounts.owner_token_account,
            &ctx.accounts.vault,
            &ctx.accounts.owner,
            amount,
        )?;

        let budget = &mut ctx.accounts.budget;
        budget.total_deposited = budget
            .total_deposited
            .checked_add(amount)
            .ok_or(PicoError::MathOverflow)?;
        Ok(())
    }

    /// Operator meters a paid AI action: vault USDC -> treasury.
    /// tool_id: 1 = ExplainTx, 2 = TokenCheck (off-chain convention).
    pub fn debit(ctx: Context<Debit>, amount: u64, tool_id: u16) -> Result<()> {
        require!(amount > 0, PicoError::ZeroAmount);

        let vault_balance = ctx.accounts.vault.amount;
        require!(vault_balance >= amount, PicoError::InsufficientBudget);

        let budget_key = ctx.accounts.budget.key();
        let bump = [ctx.accounts.budget.vault_bump];
        let seeds: &[&[u8]] = &[b"vault_authority", budget_key.as_ref(), &bump];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        let budget = &mut ctx.accounts.budget;
        budget.total_spent = budget
            .total_spent
            .checked_add(amount)
            .ok_or(PicoError::MathOverflow)?;
        budget.spend_count = budget
            .spend_count
            .checked_add(1)
            .ok_or(PicoError::MathOverflow)?;

        let remaining = vault_balance
            .checked_sub(amount)
            .ok_or(PicoError::MathOverflow)?;

        emit!(SpendEvent {
            owner: budget.owner,
            amount,
            tool_id,
            total_spent: budget.total_spent,
            spend_count: budget.spend_count,
            remaining,
        });

        Ok(())
    }

    /// Owner withdraws all remaining USDC from the vault.
    pub fn withdraw_remaining(ctx: Context<WithdrawRemaining>) -> Result<()> {
        let amount = ctx.accounts.vault.amount;
        require!(amount > 0, PicoError::NothingToWithdraw);

        let budget_key = ctx.accounts.budget.key();
        let bump = [ctx.accounts.budget.vault_bump];
        let seeds: &[&[u8]] = &[b"vault_authority", budget_key.as_ref(), &bump];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.owner_token_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        Ok(())
    }
}

fn transfer_from_owner<'info>(
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
pub struct InitializeBudget<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        seeds = [b"config"],
        bump = config.bump,
        constraint = config.mint == mint.key() @ PicoError::MintMismatch
    )]
    pub config: Account<'info, Config>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        space = 8 + Budget::INIT_SPACE,
        seeds = [b"budget", owner.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub budget: Account<'info, Budget>,

    /// CHECK: PDA authority that owns the vault ATA.
    #[account(
        seeds = [b"vault_authority", budget.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = vault_authority
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key() @ PicoError::Unauthorized,
        constraint = owner_token_account.mint == mint.key() @ PicoError::MintMismatch
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"budget", owner.key().as_ref(), budget.mint.as_ref()],
        bump = budget.bump,
        has_one = owner @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub budget: Account<'info, Budget>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key() @ PicoError::Unauthorized,
        constraint = owner_token_account.mint == budget.mint @ PicoError::MintMismatch
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Debit<'info> {
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
        seeds = [b"budget", budget.owner.as_ref(), budget.mint.as_ref()],
        bump = budget.bump,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub budget: Account<'info, Budget>,

    /// CHECK: vault authority PDA
    #[account(
        seeds = [b"vault_authority", budget.key().as_ref()],
        bump = budget.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = treasury_token_account.mint == budget.mint @ PicoError::MintMismatch
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawRemaining<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"budget", owner.key().as_ref(), budget.mint.as_ref()],
        bump = budget.bump,
        has_one = owner @ PicoError::Unauthorized,
        has_one = vault @ PicoError::VaultMismatch
    )]
    pub budget: Account<'info, Budget>,

    /// CHECK: vault authority PDA
    #[account(
        seeds = [b"vault_authority", budget.key().as_ref()],
        bump = budget.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key() @ PicoError::Unauthorized,
        constraint = owner_token_account.mint == budget.mint @ PicoError::MintMismatch
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

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
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Budget {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub vault: Pubkey,
    pub total_deposited: u64,
    pub total_spent: u64,
    pub spend_count: u64,
    pub bump: u8,
    pub vault_bump: u8,
}

#[event]
pub struct SpendEvent {
    pub owner: Pubkey,
    pub amount: u64,
    pub tool_id: u16,
    pub total_spent: u64,
    pub spend_count: u64,
    pub remaining: u64,
}

#[error_code]
pub enum PicoError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient budget in vault")]
    InsufficientBudget,
    #[msg("Nothing left to withdraw")]
    NothingToWithdraw,
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
}
