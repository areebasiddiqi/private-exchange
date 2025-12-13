-- Function to process investment atomically and bypass RLS for cross-user updates
create or replace function public.process_investment(
  p_deal_id uuid,
  p_investor_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer -- Runs with privileges of the creator (admin), bypassing RLS
as $$
declare
  v_lender_id uuid;
  v_investor_balance numeric;
  v_loan_amount numeric;
  v_total_invested numeric;
begin
  -- 1. Get Deal Info (Lender ID and Loan Amount)
  select lender_id, loan_amount into v_lender_id, v_loan_amount
  from public.deals
  where id = p_deal_id;

  if v_lender_id is null then
    raise exception 'Deal not found';
  end if;

  -- 2. Check Investor Balance
  select balance into v_investor_balance
  from public.wallets
  where user_id = p_investor_id;

  if v_investor_balance is null or v_investor_balance < p_amount then
    raise exception 'Insufficient funds';
  end if;

  -- 3. Deduct from Investor Wallet
  update public.wallets
  set balance = balance - p_amount,
      updated_at = now()
  where user_id = p_investor_id;

  -- 4. Add to Lender Wallet (Upsert to handle missing wallet)
  insert into public.wallets (user_id, balance)
  values (v_lender_id, p_amount)
  on conflict (user_id)
  do update set balance = wallets.balance + excluded.balance, updated_at = now();

  -- 5. Create Investment Record
  insert into public.investments (deal_id, investor_id, amount, status)
  values (p_deal_id, p_investor_id, p_amount, 'completed');

  -- 6. Create Transaction for Investor (Outflow)
  insert into public.transactions (user_id, type, amount, status, reference_id)
  values (p_investor_id, 'investment', -p_amount, 'completed', p_deal_id);

  -- 7. Create Transaction for Lender (Inflow)
  -- Changed type from 'deposit' to 'investment' per user request
  insert into public.transactions (user_id, type, amount, status, reference_id)
  values (v_lender_id, 'investment', p_amount, 'completed', p_deal_id);

  -- 8. Check and Update Deal Status
  select coalesce(sum(amount), 0) into v_total_invested
  from public.investments
  where deal_id = p_deal_id;
  
  if v_total_invested >= v_loan_amount then
    update public.deals set status = 'funded' where id = p_deal_id;
  end if;

end;
$$;

-- Function to process loan repayment atomically
create or replace function public.process_repayment(
  p_deal_id uuid,
  p_lender_id uuid,
  p_total_repayment_amount numeric
)
returns void
language plpgsql
security definer
as $$
declare
  v_lender_balance numeric;
  v_loan_amount numeric;
  v_investment record;
  v_share numeric;
  v_payout numeric;
begin
  -- 1. Verify Deal and Loan Amount
  select loan_amount into v_loan_amount
  from public.deals
  where id = p_deal_id and lender_id = p_lender_id;

  if v_loan_amount is null then
    raise exception 'Deal not found or unauthorized';
  end if;

  -- 2. Check Lender Balance
  select balance into v_lender_balance
  from public.wallets
  where user_id = p_lender_id;

  if v_lender_balance is null or v_lender_balance < p_total_repayment_amount then
    raise exception 'Insufficient funds in lender wallet';
  end if;

  -- 3. Deduct from Lender Wallet
  update public.wallets
  set balance = balance - p_total_repayment_amount,
      updated_at = now()
  where user_id = p_lender_id;

  -- 4. Create Transaction for Lender (Repayment Outflow)
  insert into public.transactions (user_id, type, amount, status, reference_id)
  values (p_lender_id, 'repayment', -p_total_repayment_amount, 'completed', p_deal_id);

  -- 5. Distribute to Investors
  for v_investment in 
    select * from public.investments 
    where deal_id = p_deal_id and status = 'completed'
  loop
    -- Calculate share: (Investment Amount / Total Loan Amount)
    v_share := v_investment.amount / v_loan_amount;
    
    -- Calculate payout: Total Repayment * Share
    v_payout := p_total_repayment_amount * v_share;

    -- Update Investor Wallet (Upsert to be safe)
    insert into public.wallets (user_id, balance)
    values (v_investment.investor_id, v_payout)
    on conflict (user_id)
    do update set balance = wallets.balance + excluded.balance, updated_at = now();

    -- Create Transaction for Investor (Repayment Inflow)
    insert into public.transactions (user_id, type, amount, status, reference_id)
    values (v_investment.investor_id, 'repayment', v_payout, 'completed', p_deal_id);
  end loop;

  -- 6. Update Deal Status
  update public.deals
  set status = 'repaid',
      repayment_status = 'paid_off',
      updated_at = now()
  where id = p_deal_id;

end;
$$;

-- Fix existing deals that should be funded but aren't
update public.deals
set status = 'funded'
where id in (
  select d.id
  from public.deals d
  join public.investments i on d.id = i.deal_id
  group by d.id
  having sum(i.amount) >= d.loan_amount
) and status != 'funded';
