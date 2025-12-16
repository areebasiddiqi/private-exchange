-- Run this SQL in Supabase SQL Editor to fix investment flow

-- Function to process investment atomically and bypass RLS for cross-user updates
CREATE OR REPLACE FUNCTION public.process_investment(
  p_deal_id uuid,
  p_investor_id uuid,
  p_amount numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (admin), bypassing RLS
AS $$
DECLARE
  v_lender_id uuid;
  v_investor_balance numeric;
  v_loan_amount numeric;
  v_total_invested numeric;
BEGIN
  -- 1. Get Deal Info (Lender ID and Loan Amount)
  SELECT lender_id, loan_amount INTO v_lender_id, v_loan_amount
  FROM public.deals
  WHERE id = p_deal_id;

  IF v_lender_id IS NULL THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;

  -- 2. Check Investor Balance
  SELECT balance INTO v_investor_balance
  FROM public.wallets
  WHERE user_id = p_investor_id;

  IF v_investor_balance IS NULL OR v_investor_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  -- 3. Deduct from Investor Wallet
  UPDATE public.wallets
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE user_id = p_investor_id;

  -- 4. Add to Lender Wallet (Upsert to handle missing wallet)
  INSERT INTO public.wallets (user_id, balance)
  VALUES (v_lender_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = wallets.balance + EXCLUDED.balance, updated_at = now();

  -- 5. Create Investment Record
  INSERT INTO public.investments (deal_id, investor_id, amount, status)
  VALUES (p_deal_id, p_investor_id, p_amount, 'completed');

  -- 6. Create Transaction for Investor (Outflow)
  INSERT INTO public.transactions (user_id, type, amount, status, reference_id)
  VALUES (p_investor_id, 'investment', -p_amount, 'completed', p_deal_id);

  -- 7. Create Transaction for Lender (Inflow)
  INSERT INTO public.transactions (user_id, type, amount, status, reference_id)
  VALUES (v_lender_id, 'investment', p_amount, 'completed', p_deal_id);

  -- 8. Check and Update Deal Status to 'funded' if fully invested
  SELECT COALESCE(SUM(amount), 0) INTO v_total_invested
  FROM public.investments
  WHERE deal_id = p_deal_id AND status = 'completed';

  IF v_total_invested >= v_loan_amount THEN
    UPDATE public.deals SET status = 'funded', updated_at = now() WHERE id = p_deal_id;
  END IF;

END;
$$;

-- Fix existing deals that should be funded but aren't
UPDATE public.deals
SET status = 'funded', updated_at = now()
WHERE id IN (
  SELECT d.id
  FROM public.deals d
  JOIN public.investments i ON d.id = i.deal_id
  WHERE i.status = 'completed'
  GROUP BY d.id, d.loan_amount
  HAVING SUM(i.amount) >= d.loan_amount
) AND status != 'funded' AND status != 'repaid';

-- Ensure all lenders have wallets
INSERT INTO public.wallets (user_id, balance)
SELECT p.id, 0
FROM public.profiles p
WHERE p.role = 'lender'
AND NOT EXISTS (SELECT 1 FROM public.wallets w WHERE w.user_id = p.id)
ON CONFLICT (user_id) DO NOTHING;
