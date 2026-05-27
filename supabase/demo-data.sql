-- Demo data for local Supabase.
-- Accounts:
-- xzr@example.com / xzr123456
-- lp@example.com / lp123456
-- ywt@example.com / ywt123456
-- lsw@example.com / lsw123456
-- zxy@example.com / zxy123456
-- hzy@example.com / hzy123456
-- wxy@example.com / wxy123456
-- cjy@example.com / cjy123456

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'xzr@example.com', crypt('xzr123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"xzr","display_name":"xzr"}', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lp@example.com', crypt('lp123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"lp","display_name":"lp"}', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ywt@example.com', crypt('ywt123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"ywt","display_name":"ywt"}', now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lsw@example.com', crypt('lsw123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"lsw","display_name":"lsw"}', now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zxy@example.com', crypt('zxy123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"zxy","display_name":"zxy"}', now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hzy@example.com', crypt('hzy123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"hzy","display_name":"hzy"}', now(), now()),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'wxy@example.com', crypt('wxy123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"wxy","display_name":"wxy"}', now(), now()),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cjy@example.com', crypt('cjy123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"username":"cjy","display_name":"cjy"}', now(), now())
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.profiles (id, username, display_name, avatar_path, role, level_name, points, signature)
values
  ('00000000-0000-0000-0000-000000000001', 'xzr', 'xzr', '/avatars/admin.svg', 'admin', 'Lv.8 管理员', 4820, '负责维护论坛秩序，也会整理学习资料。'),
  ('00000000-0000-0000-0000-000000000002', 'lp', 'lp', '/avatars/member-a.svg', 'moderator', 'Lv.6 版主', 3260, '喜欢把问题拆清楚再动手。'),
  ('00000000-0000-0000-0000-000000000003', 'ywt', 'ywt', '/avatars/member-b.svg', 'member', 'Lv.5 活跃成员', 2790, '最近在学前端和数据库。'),
  ('00000000-0000-0000-0000-000000000004', 'lsw', 'lsw', '/avatars/placeholder-user.svg', 'member', 'Lv.4 认真回帖', 2180, '有问题先搜索，再提问。'),
  ('00000000-0000-0000-0000-000000000005', 'zxy', 'zxy', '/avatars/member-a.svg', 'member', 'Lv.3 分享达人', 1560, '爱分享工具、模板和避坑经验。'),
  ('00000000-0000-0000-0000-000000000006', 'hzy', 'hzy', '/avatars/member-b.svg', 'member', 'Lv.3 游戏同好', 1420, '晚上常在线，组队可以叫我。'),
  ('00000000-0000-0000-0000-000000000007', 'wxy', 'wxy', '/avatars/placeholder-user.svg', 'member', 'Lv.2 新朋友', 860, '喜欢摄影和校园日常记录。'),
  ('00000000-0000-0000-0000-000000000008', 'cjy', 'cjy', '/avatars/member-a.svg', 'member', 'Lv.2 热心路人', 740, '看到求助贴会尽量帮一把。')
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  avatar_path = excluded.avatar_path,
  role = excluded.role,
  level_name = excluded.level_name,
  points = excluded.points,
  signature = excluded.signature,
  updated_at = now();

insert into public.posts (id, board_id, author_id, title, excerpt, content, tags, status, reply_count, view_count, like_count, collect_count, created_at, updated_at)
values
  (1001, 8, '00000000-0000-0000-0000-000000000001', 'Next.js 项目本地运行时，环境变量应该怎么配？', '整理了一下本地跑论坛项目时最容易漏掉的 .env.local、端口和 Supabase 配置。', '今天把论坛项目重新跑了一遍，发现最容易出问题的地方不是代码，而是环境变量。没有接 Supabase 的时候，NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 要留空，这样页面会走 mock 数据。', array['Next.js','环境配置','本地运行'], 'featured', 3, 86, 4, 2, '2026-05-27 09:20:00+08', '2026-05-27 10:12:00+08'),
  (1002, 7, '00000000-0000-0000-0000-000000000005', '期末复习资料汇总：软件工程、数据库和前端', '把最近几天大家发过的资料整理成一份清单，方便复习前直接找。', '软件工程部分建议先看需求分析、用例图、类图和测试用例；数据库部分重点复习范式、SQL 查询、索引和事务；前端部分可以按 HTML/CSS、React 状态、路由和接口请求来整理。', array['复习','资料','期末'], 'pinned', 4, 132, 5, 4, '2026-05-26 20:10:00+08', '2026-05-27 08:16:00+08'),
  (1003, 10, '00000000-0000-0000-0000-000000000004', '登录页提交后没有反应，应该先排查哪里？', '按钮能点，页面不跳转，也没有明显报错，想问一下排查顺序。', '我现在遇到的问题是登录表单提交后页面没有变化。浏览器控制台没有看到红色报错，终端也没有明显异常。', array['求助','登录','排查'], 'normal', 3, 64, 2, 1, '2026-05-27 11:00:00+08', '2026-05-27 11:28:00+08')
on conflict (id) do update set
  board_id = excluded.board_id,
  author_id = excluded.author_id,
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  tags = excluded.tags,
  status = excluded.status,
  reply_count = excluded.reply_count,
  view_count = excluded.view_count,
  like_count = excluded.like_count,
  collect_count = excluded.collect_count,
  updated_at = excluded.updated_at;

insert into public.post_reactions (post_id, user_id, reaction)
values
  (1001, '00000000-0000-0000-0000-000000000002', 'like'),
  (1001, '00000000-0000-0000-0000-000000000003', 'like'),
  (1001, '00000000-0000-0000-0000-000000000004', 'like'),
  (1001, '00000000-0000-0000-0000-000000000005', 'like'),
  (1002, '00000000-0000-0000-0000-000000000001', 'like'),
  (1002, '00000000-0000-0000-0000-000000000002', 'like'),
  (1002, '00000000-0000-0000-0000-000000000003', 'like'),
  (1002, '00000000-0000-0000-0000-000000000004', 'like'),
  (1002, '00000000-0000-0000-0000-000000000008', 'like'),
  (1003, '00000000-0000-0000-0000-000000000001', 'like'),
  (1003, '00000000-0000-0000-0000-000000000002', 'like')
on conflict do nothing;

insert into public.private_messages (sender_id, receiver_id, content, is_read, created_at)
values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'xzr，首页数据我看过了，点赞数现在真实多了。', true, '2026-05-27 10:20:00+08'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '好，我再把帖子内容按板块补得自然一点。', true, '2026-05-27 10:24:00+08'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '登录页如果没接 Supabase，是不是只能看展示数据？', false, '2026-05-27 11:18:00+08'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '对，mock 模式先看页面；等 Docker 配好再用真实账号登录。', true, '2026-05-27 11:23:00+08')
on conflict do nothing;

select setval('public.posts_id_seq', greatest((select max(id) from public.posts), 1003));
