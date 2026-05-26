insert into public.roles (code, name, description)
values
  ('admin', '超级管理员', '拥有全部后台权限'),
  ('moderator', '板块管理员', '管理分配板块内的帖子、评论与举报'),
  ('member', '系统用户', '基础社区互动权限')
on conflict (code) do nothing;

insert into public.boards (id, slug, name, group_name, description, icon, theme_color, post_count, today_count, sort_order)
values
  (1, 'departments', '部门交融', '企业专区', '跨部门协作、流程沟通与经验交换。', 'Network', 'teal', 128, 12, 1),
  (2, 'hobbies', '特长爱好', '企业专区', '运动、音乐、摄影、手作和生活灵感。', 'Sparkles', 'amber', 96, 9, 2),
  (3, 'stories', '坊间趣事', '企业专区', '轻松讨论和社区见闻。', 'MessagesSquare', 'sky', 82, 7, 3),
  (4, 'gaming', '游戏交流', '交流与讨论', '组队、攻略、硬件和游戏体验。', 'Gamepad2', 'violet', 76, 8, 4),
  (5, 'wall', '告白墙', '交流与讨论', '公开表达、匿名心事和温柔回应。', 'Heart', 'rose', 54, 5, 5),
  (6, 'jobs', '兼职', '交流与讨论', '兼职信息、避坑经验和岗位推荐。', 'Briefcase', 'emerald', 61, 4, 6),
  (7, 'resources', '资源共享', '交流与讨论', '课程、工具、素材和学习路线。', 'FolderOpen', 'cyan', 145, 13, 7),
  (8, 'code', '编程开发', '交流与讨论', '项目、Bug、框架和工程实践。', 'Code2', 'indigo', 172, 16, 8),
  (9, 'general', '综合交流', '交流与讨论', '不设边界的日常交流区。', 'PanelsTopLeft', 'slate', 119, 10, 9),
  (10, 'qa', '求助问答', '交流与讨论', '提问、解答、追问和问题归档。', 'CircleHelp', 'orange', 91, 6, 10),
  (11, 'lost-found', '寻物启事', '交流与讨论', '失物招领、寻物和线索同步。', 'Search', 'lime', 38, 3, 11),
  (12, 'chat', '休闲灌水', '交流与讨论', '灌水、接龙和轻量互动。', 'Coffee', 'fuchsia', 188, 19, 12)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  group_name = excluded.group_name,
  description = excluded.description,
  icon = excluded.icon,
  theme_color = excluded.theme_color,
  post_count = excluded.post_count,
  today_count = excluded.today_count,
  sort_order = excluded.sort_order;

insert into public.grades (name, min_points, image_path)
values
  ('Lv.1 新人', 0, 'grade_img_01.png'),
  ('Lv.3 活跃成员', 500, 'grade_img_03.png'),
  ('Lv.5 深度水友', 2000, 'grade_img_05.png'),
  ('Lv.8 星河领航员', 8000, 'grade_img_08.png');

select setval('public.boards_id_seq', (select max(id) from public.boards));
