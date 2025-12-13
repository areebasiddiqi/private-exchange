-- Pending Transactions Table for Admin Approval Workflow
create table if not exists pending_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  deal_id uuid references deals not null,
  type text not null check (type in ('investment', 'repayment')),
  amount numeric not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- RLS Policies for pending_transactions
alter table pending_transactions enable row level security;

-- Users can view their own pending transactions
create policy "Users can view own pending transactions"
  on pending_transactions for select
  using (auth.uid() = user_id);

-- Users can create pending transactions
create policy "Users can create pending transactions"
  on pending_transactions for insert
  with check (auth.uid() = user_id);

-- Admins can view all pending transactions
create policy "Admins can view all pending transactions"
  on pending_transactions for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update pending transactions
create policy "Admins can update pending transactions"
  on pending_transactions for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
