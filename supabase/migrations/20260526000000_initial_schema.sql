create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'moderator', 'member');
create type public.post_status as enum ('featured', 'pinned', 'normal');
create type public.report_status as enum ('pending', 'resolved', 'rejected');
create type public.notification_type as enum ('reply', 'friend', 'system', 'report');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_path text,
  role public.user_role not null default 'member',
  level_name text not null default 'Lv.1 新人',
  points integer not null default 0,
  signature text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  description text not null default ''
);

create table public.user_roles (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete cascade,
  unique (user_id, role_id)
);

create table public.boards (
  id bigserial primary key,
  slug text unique not null,
  name text not null,
  group_name text not null,
  description text not null default '',
  icon text not null default 'PanelsTopLeft',
  theme_color text not null default 'teal',
  post_count integer not null default 0,
  today_count integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.posts (
  id bigserial primary key,
  board_id bigint not null references public.boards(id) on delete restrict,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  excerpt text not null default '',
  content text not null,
  tags text[] not null default '{}',
  status public.post_status not null default 'normal',
  reply_count integer not null default 0,
  view_count integer not null default 0,
  like_count integer not null default 0,
  collect_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_replies (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  seat integer not null default 1,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.post_reactions (
  id bigserial primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction)
);

create table public.bookmarks (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id bigint not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table public.follows (
  id bigserial primary key,
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.friendships (
  id bigserial primary key,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table public.private_messages (
  id bigserial primary key,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  image_path text,
  is_read boolean not null default false,
  sender_deleted boolean not null default false,
  receiver_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  description text not null default '',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.reports (
  id bigserial primary key,
  reporter_id uuid references public.profiles(id) on delete set null,
  post_id bigint references public.posts(id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.notices (
  id bigserial primary key,
  title text not null,
  content text not null,
  board_id bigint references public.boards(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.checkins (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null default current_date,
  award_points integer not null default 5,
  unique (user_id, checkin_date)
);

create table public.grades (
  id bigserial primary key,
  name text not null,
  min_points integer not null,
  image_path text
);

create table public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  ip inet,
  created_at timestamptz not null default now()
);

create index idx_posts_board_updated on public.posts(board_id, updated_at desc);
create index idx_posts_author on public.posts(author_id);
create index idx_replies_post_created on public.post_replies(post_id, created_at);
create index idx_private_messages_inbox on public.private_messages(receiver_id, is_read, created_at desc);
create index idx_notifications_user_read on public.notifications(user_id, is_read, created_at desc);
create index idx_reports_status on public.reports(status, created_at desc);
create index idx_reports_reporter_created on public.reports(reporter_id, created_at desc);
create index idx_follows_follower_created on public.follows(follower_id, created_at desc);
create index idx_follows_following_created on public.follows(following_id, created_at desc);
create index idx_friendships_requester_status on public.friendships(requester_id, status);
create index idx_friendships_addressee_status on public.friendships(addressee_id, status);

create view public.public_profiles
with (security_barrier = true) as
select
  id,
  username,
  display_name,
  avatar_path,
  level_name,
  points,
  signature,
  created_at
from public.profiles;

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role in ('admin', 'moderator')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fallback_name text;
begin
  fallback_name := coalesce(
    new.raw_user_meta_data ->> 'username',
    nullif(split_part(new.email, '@', 1), ''),
    'user_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username, display_name, avatar_path)
  values (
    new.id,
    fallback_name || '_' || substr(new.id::text, 1, 8),
    coalesce(new.raw_user_meta_data ->> 'display_name', fallback_name),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('bbs.bootstrap_admin', true) = 'true' then
    new.updated_at := now();
    return new;
  end if;

  if not public.is_admin() then
    new.role := old.role;
    new.level_name := old.level_name;
    new.points := old.points;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

create or replace function public.create_post(target_board_id bigint, post_title text, post_content text, post_tags text[] default '{}')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  new_post_id bigint;
  summary text;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  summary := left(regexp_replace(post_content, '\s+', ' ', 'g'), 180);

  insert into public.posts (board_id, author_id, title, excerpt, content, tags)
  values (target_board_id, actor_id, post_title, summary, post_content, coalesce(post_tags, '{}'))
  returning id into new_post_id;

  update public.boards
  set
    post_count = post_count + 1,
    today_count = today_count + 1
  where id = target_board_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id)
  values (actor_id, 'create_post', 'post', new_post_id::text);

  return new_post_id;
end;
$$;

create or replace function public.create_reply(target_post_id bigint, reply_content text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  next_seat integer;
  new_reply_id bigint;
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  select coalesce(max(seat), 0) + 1
  into next_seat
  from public.post_replies
  where post_id = target_post_id;

  insert into public.post_replies (post_id, author_id, content, seat)
  values (target_post_id, actor_id, reply_content, next_seat)
  returning id into new_reply_id;

  update public.posts
  set
    reply_count = reply_count + 1,
    updated_at = now()
  where id = target_post_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id)
  values (actor_id, 'create_reply', 'reply', new_reply_id::text);

  return new_reply_id;
end;
$$;

create or replace function public.toggle_post_reaction(target_post_id bigint, target_reaction text default 'like')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  if target_reaction <> 'like' then
    raise exception 'unsupported reaction %', target_reaction;
  end if;

  if exists (
    select 1
    from public.post_reactions
    where post_id = target_post_id
      and user_id = actor_id
      and reaction = target_reaction
  ) then
    delete from public.post_reactions
    where post_id = target_post_id
      and user_id = actor_id
      and reaction = target_reaction;

    update public.posts
    set like_count = greatest(like_count - 1, 0)
    where id = target_post_id;

    return false;
  end if;

  insert into public.post_reactions (post_id, user_id, reaction)
  values (target_post_id, actor_id, target_reaction)
  on conflict do nothing;

  if found then
    update public.posts
    set like_count = like_count + 1
    where id = target_post_id;
  end if;

  return true;
end;
$$;

create or replace function public.toggle_bookmark(target_post_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'authentication required';
  end if;

  if exists (
    select 1
    from public.bookmarks
    where post_id = target_post_id
      and user_id = actor_id
  ) then
    delete from public.bookmarks
    where post_id = target_post_id
      and user_id = actor_id;

    update public.posts
    set collect_count = greatest(collect_count - 1, 0)
    where id = target_post_id;

    return false;
  end if;

  insert into public.bookmarks (post_id, user_id)
  values (target_post_id, actor_id)
  on conflict do nothing;

  if found then
    update public.posts
    set collect_count = collect_count + 1
    where id = target_post_id;
  end if;

  return true;
end;
$$;

create or replace function public.bootstrap_admin_by_email(target_email text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
begin
  select id into target_user_id
  from auth.users
  where lower(email) = lower(target_email)
  limit 1;

  if target_user_id is null then
    raise exception 'user not found for email %', target_email;
  end if;

  perform set_config('bbs.bootstrap_admin', 'true', true);

  update public.profiles
  set
    role = 'admin',
    level_name = 'Lv.8 星河领航员',
    updated_at = now()
  where id = target_user_id;

  insert into public.audit_logs (actor_id, action, target_type, target_id)
  values (null, 'bootstrap_admin', 'profile', target_user_id::text);

  return target_user_id;
end;
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to anon, authenticated, service_role;

revoke all on function public.handle_new_user() from public;
revoke all on function public.prevent_profile_privilege_escalation() from public;

revoke all on function public.create_post(bigint, text, text, text[]) from public;
grant execute on function public.create_post(bigint, text, text, text[]) to authenticated;

revoke all on function public.create_reply(bigint, text) from public;
grant execute on function public.create_reply(bigint, text) to authenticated;

revoke all on function public.toggle_post_reaction(bigint, text) from public;
grant execute on function public.toggle_post_reaction(bigint, text) to authenticated;

revoke all on function public.toggle_bookmark(bigint) from public;
grant execute on function public.toggle_bookmark(bigint) to authenticated;

revoke all on function public.bootstrap_admin_by_email(text) from public;
grant execute on function public.bootstrap_admin_by_email(text) to service_role;

revoke all on table public.public_profiles from public;
grant select on table public.public_profiles to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.post_replies enable row level security;
alter table public.post_reactions enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.friendships enable row level security;
alter table public.private_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.notices enable row level security;
alter table public.checkins enable row level security;
alter table public.grades enable row level security;
alter table public.audit_logs enable row level security;

create policy "users and admins read protected profiles" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "users create own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "admins update profiles" on public.profiles for update using (public.is_admin());

create policy "roles are readable" on public.roles for select using (true);
create policy "admins manage roles" on public.roles for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own roles" on public.user_roles for select using (auth.uid() = user_id or public.is_admin());
create policy "admins manage user roles" on public.user_roles for all using (public.is_admin()) with check (public.is_admin());

create policy "boards are readable" on public.boards for select using (true);
create policy "admins manage boards" on public.boards for all using (public.is_admin()) with check (public.is_admin());
create policy "posts are readable" on public.posts for select using (true);
create policy "authenticated users create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "authors update posts" on public.posts for update using (auth.uid() = author_id);
create policy "admins manage posts" on public.posts for all using (public.is_admin()) with check (public.is_admin());

create policy "replies are readable" on public.post_replies for select using (is_visible);
create policy "authenticated users create replies" on public.post_replies for insert with check (auth.uid() = author_id);
create policy "authors update replies" on public.post_replies for update using (auth.uid() = author_id);
create policy "admins manage replies" on public.post_replies for all using (public.is_admin()) with check (public.is_admin());

create policy "post reactions are readable" on public.post_reactions for select using (true);
create policy "users manage own reactions" on public.post_reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read related follows" on public.follows for select using (auth.uid() = follower_id or auth.uid() = following_id or public.is_admin());
create policy "users manage own follows" on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);
create policy "users read own friendships" on public.friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id or public.is_admin());
create policy "users manage own friendships" on public.friendships for all using (auth.uid() = requester_id or auth.uid() = addressee_id) with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "message participants read" on public.private_messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "message sender inserts" on public.private_messages
  for insert with check (auth.uid() = sender_id);
create policy "message participants update" on public.private_messages
  for update using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "users read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "admins manage notifications" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

create policy "users create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports readable by reporter" on public.reports for select using (auth.uid() = reporter_id);
create policy "admins read reports" on public.reports for select using (public.is_admin());
create policy "admins update reports" on public.reports for update using (public.is_admin()) with check (public.is_admin());

create policy "active notices are readable" on public.notices for select using (is_active or public.is_admin());
create policy "admins manage notices" on public.notices for all using (public.is_admin()) with check (public.is_admin());

create policy "users manage own checkins" on public.checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "grades are readable" on public.grades for select using (true);
create policy "admins manage grades" on public.grades for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());
create policy "admins write audit logs" on public.audit_logs for insert with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']),
  ('post-images', 'post-images', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "public read forum storage" on storage.objects
  for select using (bucket_id in ('avatars', 'post-images'));
create policy "authenticated upload forum storage" on storage.objects
  for insert with check (bucket_id in ('avatars', 'post-images') and auth.role() = 'authenticated');
create policy "owners update forum storage" on storage.objects
  for update using (bucket_id in ('avatars', 'post-images') and owner = auth.uid())
  with check (bucket_id in ('avatars', 'post-images') and owner = auth.uid());
create policy "owners delete forum storage" on storage.objects
  for delete using (bucket_id in ('avatars', 'post-images') and owner = auth.uid());
