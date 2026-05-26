create or replace view public.public_profiles
with (security_invoker = true, security_barrier = true) as
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

revoke all on table public.public_profiles from public;
grant select on table public.public_profiles to anon, authenticated, service_role;

revoke execute on function public.bootstrap_admin_by_email(text) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.prevent_profile_privilege_escalation() from anon, authenticated;
revoke execute on function public.create_post(bigint, text, text, text[]) from anon;
revoke execute on function public.create_reply(bigint, text) from anon;
revoke execute on function public.toggle_bookmark(bigint) from anon;
revoke execute on function public.toggle_post_reaction(bigint, text) from anon;

create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_bookmarks_post on public.bookmarks(post_id);
create index if not exists idx_notices_board on public.notices(board_id);
create index if not exists idx_post_reactions_user on public.post_reactions(user_id);
create index if not exists idx_post_replies_author on public.post_replies(author_id);
create index if not exists idx_private_messages_sender on public.private_messages(sender_id);
create index if not exists idx_reports_post on public.reports(post_id);
create index if not exists idx_user_roles_role on public.user_roles(role_id);
