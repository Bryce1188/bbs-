create table if not exists public.email_verification_codes (
  id bigserial primary key,
  email text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_verification_codes_email_created
  on public.email_verification_codes (email, created_at desc);

create index if not exists idx_email_verification_codes_unused
  on public.email_verification_codes (email, expires_at desc)
  where used_at is null;

alter table public.email_verification_codes enable row level security;

drop policy if exists "service role manages email verification codes" on public.email_verification_codes;
create policy "service role manages email verification codes"
  on public.email_verification_codes
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
