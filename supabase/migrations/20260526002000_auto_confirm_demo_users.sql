create or replace function public.confirm_user_email_by_id(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = target_user_id;
end;
$$;

revoke all on function public.confirm_user_email_by_id(uuid) from public;
grant execute on function public.confirm_user_email_by_id(uuid) to anon, authenticated, service_role;

create or replace function public.register_confirmed_user(user_email text, user_password text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(trim(user_email));
  new_user_id uuid;
  fallback_name text;
begin
  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  if length(coalesce(user_password, '')) < 6 then
    raise exception 'weak_password';
  end if;

  select id into new_user_id from auth.users where lower(email) = normalized_email limit 1;
  if new_user_id is not null then
    raise exception 'user_already_exists';
  end if;

  new_user_id := gen_random_uuid();
  fallback_name := nullif(split_part(normalized_email, '@', 1), '');

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change_token_current,
    email_change,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000'::uuid,
    new_user_id,
    'authenticated',
    'authenticated',
    normalized_email,
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '',
    '',
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('username', fallback_name, 'display_name', fallback_name),
    now(),
    now()
  );

  insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  values (
    gen_random_uuid(),
    new_user_id::text,
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', normalized_email, 'email_verified', true, 'phone_verified', false),
    'email',
    now(),
    now()
  ) on conflict (provider_id, provider) do nothing;

  return new_user_id;
end;
$$;

revoke all on function public.register_confirmed_user(text, text) from public;
grant execute on function public.register_confirmed_user(text, text) to anon, authenticated, service_role;
