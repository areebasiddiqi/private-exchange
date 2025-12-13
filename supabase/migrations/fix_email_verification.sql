-- Fix email verification flow by making role nullable
-- This allows us to detect users who haven't completed onboarding

-- 1. Make role nullable (remove NOT NULL constraint and default)
alter table public.profiles 
alter column role drop not null,
alter column role drop default;

-- 2. Update the handle_new_user trigger to NOT set a role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Note: Existing users with 'investor' default role will still work
-- New users will have NULL role until they complete onboarding
