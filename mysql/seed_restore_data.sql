USE `bbs_mysql`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `user_sessions`;
TRUNCATE TABLE `password_reset_tokens`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `checkins`;
TRUNCATE TABLE `reports`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `private_messages`;
TRUNCATE TABLE `friendships`;
TRUNCATE TABLE `follows`;
TRUNCATE TABLE `bookmarks`;
TRUNCATE TABLE `post_reactions`;
TRUNCATE TABLE `post_replies`;
TRUNCATE TABLE `posts`;
TRUNCATE TABLE `notices`;
TRUNCATE TABLE `user_roles`;
TRUNCATE TABLE `profiles`;
TRUNCATE TABLE `users_auth`;
TRUNCATE TABLE `role_permissions`;
TRUNCATE TABLE `permissions`;
TRUNCATE TABLE `roles`;
TRUNCATE TABLE `boards`;
TRUNCATE TABLE `grades`;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `roles` (`id`,`code`,`name`,`description`) VALUES
  (1,'admin','超级管理员','后台全部权限'),
  (2,'moderator','版主','板块与内容管理'),
  (3,'member','普通用户','发帖评论与互动')
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `description`=VALUES(`description`);

INSERT INTO `permissions` (`code`,`name`,`description`) VALUES
  ('board.read','查看板块','读取板块信息'),
  ('board.update','管理板块','新增编辑板块'),
  ('post.create','发布帖子','创建帖子'),
  ('post.moderate','管理帖子','置顶加精隐藏删除'),
  ('reply.moderate','管理评论','处理评论可见性'),
  ('report.review','审核举报','处理举报工单'),
  ('notice.manage','管理公告','发布和下线公告'),
  ('role.manage','角色管理','管理角色与权限'),
  ('user.role.assign','分配角色','给用户分配身份')
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `description`=VALUES(`description`);

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'admin'
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'moderator' AND p.code IN ('board.read','board.update','post.create','post.moderate','reply.moderate','report.review','notice.manage')
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'member' AND p.code IN ('board.read','post.create')
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `grades` (`id`,`name`,`min_points`,`image_path`) VALUES
  (1,'Lv.1 新生',0,'grade_img_01.png'),
  (2,'Lv.3 活跃成员',500,'grade_img_03.png'),
  (3,'Lv.5 深度水友',2000,'grade_img_05.png'),
  (4,'Lv.8 校园达人',8000,'grade_img_08.png')
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `min_points`=VALUES(`min_points`),
  `image_path`=VALUES(`image_path`);

INSERT INTO `boards` (`id`,`slug`,`name`,`group_name`,`description`,`icon`,`theme_color`,`post_count`,`today_count`,`sort_order`) VALUES
  (1,'departments','院系交流','校园专区','课程安排、院系通知、班级讨论。','Network','teal',0,0,1),
  (2,'hobbies','特长爱好','校园专区','运动、音乐、摄影、手工爱好。','Sparkles','amber',0,0,2),
  (3,'stories','校园见闻','校园专区','校园趣事、生活记录、暖心瞬间。','MessagesSquare','sky',0,0,3),
  (4,'gaming','游戏交流','互动讨论','组队开黑、攻略心得、设备交流。','Gamepad2','violet',0,0,4),
  (5,'wall','心情墙','互动讨论','匿名树洞、情感表达、互相打气。','Heart','rose',0,0,5),
  (6,'jobs','兼职实习','互动讨论','校内兼职、面试经验、避坑提醒。','Briefcase','emerald',0,0,6),
  (7,'resources','资源共享','学习提升','课程笔记、复习资料、工具推荐。','FolderOpen','cyan',0,0,7),
  (8,'code','编程开发','学习提升','项目开发、Bug 排查、技术问答。','Code2','indigo',0,0,8),
  (9,'general','综合交流','互动讨论','日常闲聊、学习节奏、校园生活。','PanelsTopLeft','slate',0,0,9),
  (10,'qa','求助问答','学习提升','问题求助、经验解答、互助答疑。','CircleHelp','orange',0,0,10),
  (11,'lost-found','寻物启事','校园服务','失物招领、线索同步、快速寻回。','Search','lime',0,0,11),
  (12,'chat','休闲灌水','互动讨论','轻松聊天、电影音乐、周末活动。','Coffee','fuchsia',0,0,12)
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),
  `group_name`=VALUES(`group_name`),
  `description`=VALUES(`description`),
  `icon`=VALUES(`icon`),
  `theme_color`=VALUES(`theme_color`),
  `sort_order`=VALUES(`sort_order`);

-- 核心账号:
-- xzr@example.com / xzr
-- lp@example.com / lp
-- ywt@example.com / ywt
-- lsw@example.com / lsw
-- admin@example.com / admin
-- 2063621186@qq.com / bryce123
-- 其余三字母账号密码规则: 用户名 + 123
INSERT INTO `users_auth` (`id`,`email`,`password_hash`,`email_confirmed_at`) VALUES
  ('00000000-0000-0000-0000-000000000001','xzr@example.com','$2b$10$b6GEzcKafGjcsN68F/aHWOoiK.uc2glKmQ17IRG7vlges1sMEzTU6',NOW()),
  ('00000000-0000-0000-0000-000000000002','lp@example.com','$2b$10$WD/Dl2Sx2/V3smouTz4Z5uCLZVn4jYrfRTiXe89T34pKFcC03dyGC',NOW()),
  ('00000000-0000-0000-0000-000000000003','ywt@example.com','$2b$10$eWZ7uklF9mXa6.1/ZthJmuBRmx2HTCsM5sGwL0ZHLQGKR1j02asJK',NOW()),
  ('00000000-0000-0000-0000-000000000004','lsw@example.com','$2b$10$rfMcHBTIXVnYcRahuLw4uOIG6/2r/mBl/6JAvLicKnp6FXdG5l0.a',NOW()),
  ('00000000-0000-0000-0000-000000000050','2063621186@qq.com','$2b$10$Y/KzhZ8Fc2IlOk3zeIGXse5Guy1aoFesTtIONMA4e.rXyhVJKJ.FW',NOW()),
  ('00000000-0000-0000-0000-000000000099','admin@example.com','$2b$10$eZ4heuw/fH2qWqv9WHRVd.LpLIDWCskL3t6iNCanfqVa28HRP7jBa',NOW()),
  ('00000000-0000-0000-0000-000000000101','zrq@example.com','$2b$10$4osUgVdCo1oWznBAVnpLAO459i76f4g5k.y0yaIcAKAjjRPemXghW',NOW()),
  ('00000000-0000-0000-0000-000000000102','lwy@example.com','$2b$10$vw4kWHuFkcPwaEaF1TUrbO3VwAltmT2OLLpnLgS4CUvAP8cFvOagK',NOW()),
  ('00000000-0000-0000-0000-000000000103','cyj@example.com','$2b$10$UGdCPFv0tZnM2nQyBQDvIOCNSE.G0siaRH9aUqlE6a/RhWAxrvPVy',NOW()),
  ('00000000-0000-0000-0000-000000000104','hxm@example.com','$2b$10$ekTrN9k5wp1vwivacP4D9.ghLNw7xyV5VreigR4it9FFFEvvUDdSu',NOW()),
  ('00000000-0000-0000-0000-000000000105','qzy@example.com','$2b$10$rjYCgbxcFDp1c1a46mpOQ.Qfhr0HvXYq18B7YlDc/DvRzLOpxhZPC',NOW()),
  ('00000000-0000-0000-0000-000000000106','txh@example.com','$2b$10$ussM9u4VeC5lfaZyXDD40eK5gyuE1iGqkwbgReK3C6Je0sQ9MoA3O',NOW()),
  ('00000000-0000-0000-0000-000000000107','mjk@example.com','$2b$10$sM7XTqhlxfAVL21tW6Qizu4es.XeuBo.RmARl1j3qMLnzv2dtZEMu',NOW()),
  ('00000000-0000-0000-0000-000000000108','syq@example.com','$2b$10$ThJ162JjMySWqsK4I2Knp.EGywSnNwBzKajxK7enY9424Fi4ADv.O',NOW()),
  ('00000000-0000-0000-0000-000000000109','dln@example.com','$2b$10$UTlxJ3cVlEfQF06fqc6Rj.K.dv/I55q9VhaTjg9uP4XhlOSxTIY66',NOW()),
  ('00000000-0000-0000-0000-000000000110','wrx@example.com','$2b$10$vjCgLZuoa/OfACKWFZYAhew4Ll3cGT25gqmDQELPKR9gAswlxrc.e',NOW()),
  ('00000000-0000-0000-0000-000000000111','gjh@example.com','$2b$10$V5CKx/yE7zLjCN9r3wJY0OWdH0qLh/r2RxYZ2kXok6Xcx0pTbPwmu',NOW()),
  ('00000000-0000-0000-0000-000000000112','pyt@example.com','$2b$10$Dp2v2WBtNry6QmFgYypY4eGDs2V721SDBSmN7Q3kNTiq5YtIT7/kC',NOW()),
  ('00000000-0000-0000-0000-000000000113','lkf@example.com','$2b$10$VqKsDYkcrJ0p1qTSMASA9Oa.4CLpkbcLMsy5fWPCorIMlsl.5fVFe',NOW()),
  ('00000000-0000-0000-0000-000000000114','ncm@example.com','$2b$10$EGRKAcZOmYFJKorGiRTYluKw2aTq/lYPtMgfy3AnYOQOsHjg2JjSG',NOW()),
  ('00000000-0000-0000-0000-000000000115','yjh@example.com','$2b$10$.MPnH6zoZ4Kg3JjAKkU7suPUvO.ipmme/ZjWc9YQ2.X0L2K2bUOkC',NOW()),
  ('00000000-0000-0000-0000-000000000116','rzm@example.com','$2b$10$3PhPzkJwAwUbLxJ98V5ZdufBk2z/qbEE0aZ0MQVB/i4LXqNrHc5BO',NOW()),
  ('00000000-0000-0000-0000-000000000117','qwf@example.com','$2b$10$ygQyVL0pyXZLDIx/347oaOZi8KVScifWrf8FD/WuMEr/4wRD6fFt2',NOW()),
  ('00000000-0000-0000-0000-000000000118','bxt@example.com','$2b$10$KRrEsED5wd1xwHV6OHL/WeMKOojLoOn7/K0Em2DYI4PcbhGPoyUTe',NOW()),
  ('00000000-0000-0000-0000-000000000119','cdh@example.com','$2b$10$QloIXXWOOAwbLYDApC6zV.RQtNoXsl8lpJ3Ue8uqL0bqLUnK327tG',NOW()),
  ('00000000-0000-0000-0000-000000000120','hzy@example.com','$2b$10$dvMQ9ORumv8cTdtlguEMwOAIH6hmspkU7noQU3A9b6ixGDpO1lN7a',NOW()),
  ('00000000-0000-0000-0000-000000000121','jrx@example.com','$2b$10$u8iKNrKqKhwwE8eLL5snPOiiQE8jSXlXxEC.bxoBvnp0Ov8bSYeCW',NOW()),
  ('00000000-0000-0000-0000-000000000122','mqy@example.com','$2b$10$q/7yuw00XeSQSiZ05mgH8uR223GBJBCEqTxxX73nMcDHKD2/2Ld7G',NOW()),
  ('00000000-0000-0000-0000-000000000123','tyn@example.com','$2b$10$qupSNANK/AfqNyNlJrIXz.utZqrq5TF2V2RWUpwP3P3559/Dnk706',NOW()),
  ('00000000-0000-0000-0000-000000000124','wjl@example.com','$2b$10$D/MRiaUaaINPvD7zTXqMMeO4Cp19vD5Q1naakYG28Q1t9uC.aQvKa',NOW()),
  ('00000000-0000-0000-0000-000000000125','xkd@example.com','$2b$10$eYxsqrlQkOHeJK7ko2TzWuACeLOHOKuRpNBGfwqLfeusS9XbCf1je',NOW()),
  ('00000000-0000-0000-0000-000000000126','fqs@example.com','$2b$10$ADUxRWln.BdCReSmHQpTk.m/i0HAlslS9crpN2B1N.aH1vMwEJFue',NOW()),
  ('00000000-0000-0000-0000-000000000127','nry@example.com','$2b$10$YHHLp0bhjU3IrVasjrrzNe4PbUYlP8e0214Rbu3cCG1/gpcoNJCJm',NOW()),
  ('00000000-0000-0000-0000-000000000128','vhj@example.com','$2b$10$ZSfKp/BBMPclm9VOqoKSz.wmuvaCmG/R7UrjVHznqgT0nIrfM07L.',NOW()),
  ('00000000-0000-0000-0000-000000000129','plm@example.com','$2b$10$/t/Zkkghqhtrl81WREvpbOnwnsm2oMYHMNlzehunv.zFOha734k1q',NOW()),
  ('00000000-0000-0000-0000-000000000130','kzt@example.com','$2b$10$qw1zYFJ08pQ/85UVjCx01.wJEHvQE.L9VOtybjDX53GzG1AasN2IK',NOW())
ON DUPLICATE KEY UPDATE
  `password_hash`=VALUES(`password_hash`);

INSERT INTO `profiles` (`id`,`username`,`display_name`,`avatar_path`,`role`,`level_name`,`points`,`signature`) VALUES
  ('00000000-0000-0000-0000-000000000001','xzr','xzr','/avatars/admin.svg','admin','Lv.8 校园达人',4820,'论坛维护中，有问题可以私信我。'),
  ('00000000-0000-0000-0000-000000000002','lp','lp','/avatars/member-a.svg','moderator','Lv.6 热心版主',3260,'欢迎认真提问，我会尽量帮你解答。'),
  ('00000000-0000-0000-0000-000000000003','ywt','ywt','/avatars/member-b.svg','member','Lv.5 深度水友',2790,'前端和数据库都在学，互相交流。'),
  ('00000000-0000-0000-0000-000000000004','lsw','lsw','/avatars/placeholder-user.svg','member','Lv.4 活跃同学',2180,'先搜再问，问题会更快解决。'),
  ('00000000-0000-0000-0000-000000000050','u2063621186','Bryce','/avatars/member-c.svg','member','Lv.4 活跃同学',1880,'软件工程课设冲刺中。'),
  ('00000000-0000-0000-0000-000000000099','admin','admin','/avatars/admin.svg','admin','Lv.8 校园达人',9000,'系统管理员账号。'),
  ('00000000-0000-0000-0000-000000000101','zrq','zrq','/avatars/member-a.svg','member','Lv.2 新人进阶',120,'我在准备高数补考。'),
  ('00000000-0000-0000-0000-000000000102','lwy','lwy','/avatars/member-b.svg','member','Lv.2 新人进阶',95,'想找靠谱的学习搭子。'),
  ('00000000-0000-0000-0000-000000000103','cyj','cyj','/avatars/member-c.svg','member','Lv.2 新人进阶',132,'正在学 SQL 设计。'),
  ('00000000-0000-0000-0000-000000000104','hxm','hxm','/avatars/member-d.svg','member','Lv.2 新人进阶',166,'喜欢摄影和剪辑。'),
  ('00000000-0000-0000-0000-000000000105','qzy','qzy','/avatars/member-a.svg','member','Lv.2 新人进阶',220,'期末周每天泡图书馆。'),
  ('00000000-0000-0000-0000-000000000106','txh','txh','/avatars/member-b.svg','member','Lv.2 新人进阶',214,'想练好英语口语。'),
  ('00000000-0000-0000-0000-000000000107','mjk','mjk','/avatars/member-c.svg','member','Lv.2 新人进阶',88,'正在赶实验报告。'),
  ('00000000-0000-0000-0000-000000000108','syq','syq','/avatars/member-d.svg','member','Lv.2 新人进阶',104,'新手求带，感谢大家。'),
  ('00000000-0000-0000-0000-000000000109','dln','dln','/avatars/member-a.svg','member','Lv.2 新人进阶',247,'算法题总卡在边界条件。'),
  ('00000000-0000-0000-0000-000000000110','wrx','wrx','/avatars/member-b.svg','member','Lv.2 新人进阶',142,'最近在找实习方向。'),
  ('00000000-0000-0000-0000-000000000111','gjh','gjh','/avatars/member-c.svg','member','Lv.2 新人进阶',111,'喜欢羽毛球。'),
  ('00000000-0000-0000-0000-000000000112','pyt','pyt','/avatars/member-d.svg','member','Lv.2 新人进阶',178,'四六级冲刺中。'),
  ('00000000-0000-0000-0000-000000000113','lkf','lkf','/avatars/member-a.svg','member','Lv.2 新人进阶',164,'准备参加数学建模。'),
  ('00000000-0000-0000-0000-000000000114','ncm','ncm','/avatars/member-b.svg','member','Lv.2 新人进阶',97,'想多认识同专业同学。'),
  ('00000000-0000-0000-0000-000000000115','yjh','yjh','/avatars/member-c.svg','member','Lv.2 新人进阶',189,'刚学 Next.js。'),
  ('00000000-0000-0000-0000-000000000116','rzm','rzm','/avatars/member-d.svg','member','Lv.2 新人进阶',156,'宿舍网络总是掉线。'),
  ('00000000-0000-0000-0000-000000000117','qwf','qwf','/avatars/member-a.svg','member','Lv.2 新人进阶',230,'会计考试太难了。'),
  ('00000000-0000-0000-0000-000000000118','bxt','bxt','/avatars/member-b.svg','member','Lv.2 新人进阶',173,'想把作息调回来。'),
  ('00000000-0000-0000-0000-000000000119','cdh','cdh','/avatars/member-c.svg','member','Lv.2 新人进阶',146,'等一个 Java 组队。'),
  ('00000000-0000-0000-0000-000000000120','hzy','hzy','/avatars/member-d.svg','member','Lv.2 新人进阶',201,'喜欢拍校园夜景。'),
  ('00000000-0000-0000-0000-000000000121','jrx','jrx','/avatars/member-a.svg','member','Lv.2 新人进阶',252,'最近在改简历。'),
  ('00000000-0000-0000-0000-000000000122','mqy','mqy','/avatars/member-b.svg','member','Lv.2 新人进阶',139,'实验课器材不好借。'),
  ('00000000-0000-0000-0000-000000000123','tyn','tyn','/avatars/member-c.svg','member','Lv.2 新人进阶',127,'求推荐高效记单词方法。'),
  ('00000000-0000-0000-0000-000000000124','wjl','wjl','/avatars/member-d.svg','member','Lv.2 新人进阶',211,'想练习公开表达。'),
  ('00000000-0000-0000-0000-000000000125','xkd','xkd','/avatars/member-a.svg','member','Lv.2 新人进阶',165,'正在准备答辩演示。'),
  ('00000000-0000-0000-0000-000000000126','fqs','fqs','/avatars/member-b.svg','member','Lv.2 新人进阶',134,'希望找到课设队友。'),
  ('00000000-0000-0000-0000-000000000127','nry','nry','/avatars/member-c.svg','member','Lv.2 新人进阶',118,'晚上效率比白天高。'),
  ('00000000-0000-0000-0000-000000000128','vhj','vhj','/avatars/member-d.svg','member','Lv.2 新人进阶',224,'想问问保研流程。'),
  ('00000000-0000-0000-0000-000000000129','plm','plm','/avatars/member-a.svg','member','Lv.2 新人进阶',153,'每周都在赶 ddl。'),
  ('00000000-0000-0000-0000-000000000130','kzt','kzt','/avatars/member-b.svg','member','Lv.2 新人进阶',196,'求推荐便宜打印店。');

INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT p.id,
  CASE
    WHEN p.id IN ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000099') THEN (SELECT id FROM roles WHERE code='admin' LIMIT 1)
    WHEN p.id = '00000000-0000-0000-0000-000000000002' THEN (SELECT id FROM roles WHERE code='moderator' LIMIT 1)
    ELSE (SELECT id FROM roles WHERE code='member' LIMIT 1)
  END AS role_id
FROM profiles p;

INSERT INTO `posts` (`board_id`,`author_id`,`title`,`excerpt`,`content`,`tags`,`status`,`reply_count`,`view_count`,`like_count`,`collect_count`,`created_at`,`updated_at`) VALUES
  (1,'00000000-0000-0000-0000-000000000003','大一下选修课怎么搭配更轻松','想避开同周大作业扎堆。','我这学期专业课和公选课撞在一起了，想请问大家下学期怎么搭配课程比较合理，既能保绩点又不至于太累。',JSON_ARRAY('选课','绩点'),'featured',0,968,86,37,DATE_SUB(NOW(), INTERVAL 72 HOUR),DATE_SUB(NOW(), INTERVAL 70 HOUR)),
  (1,'00000000-0000-0000-0000-000000000110','跨院选课老师会卡名额吗','系统一直显示候补。','我想跨院修一门数据可视化，结果一直是候补状态，有没有同学知道这种课后期会不会放名额。',JSON_ARRAY('跨院','选课'),'normal',0,412,31,12,DATE_SUB(NOW(), INTERVAL 68 HOUR),DATE_SUB(NOW(), INTERVAL 67 HOUR)),
  (1,'00000000-0000-0000-0000-000000000121','班委通知总在深夜发怎么办','大家都在吐槽。','最近班级通知总是凌晨才发，很多同学第二天早上才看到，想问大家有没有更好的通知协同方式。',JSON_ARRAY('班级','通知'),'normal',0,356,25,9,DATE_SUB(NOW(), INTERVAL 64 HOUR),DATE_SUB(NOW(), INTERVAL 63 HOUR)),
  (2,'00000000-0000-0000-0000-000000000111','羽毛球新手怎么练发力','每次后场球都很短。','我刚开始打羽毛球，后场高远球老是打不到位，想请教有没有适合新手的一周训练计划。',JSON_ARRAY('羽毛球','训练'),'normal',0,438,39,14,DATE_SUB(NOW(), INTERVAL 62 HOUR),DATE_SUB(NOW(), INTERVAL 61 HOUR)),
  (2,'00000000-0000-0000-0000-000000000120','校园摄影机位求推荐','想拍毕业季人像。','这周想给同学拍毕业照，求推荐光线比较好的机位，最好是傍晚也好出片的地方。',JSON_ARRAY('摄影','毕业季'),'featured',0,790,74,29,DATE_SUB(NOW(), INTERVAL 58 HOUR),DATE_SUB(NOW(), INTERVAL 57 HOUR)),
  (2,'00000000-0000-0000-0000-000000000104','吉他社团新生面试难吗','零基础有机会吗。','我完全零基础，但是很想加入吉他社，请问面试会不会卡技巧，还是更看学习态度。',JSON_ARRAY('社团','音乐'),'normal',0,276,18,7,DATE_SUB(NOW(), INTERVAL 56 HOUR),DATE_SUB(NOW(), INTERVAL 55 HOUR)),
  (3,'00000000-0000-0000-0000-000000000002','食堂阿姨记住我了有点感动','连续三天都提醒我带勺子。','这周在二食堂打饭，阿姨每次都提醒我别忘了勺子，虽然是小事但真的很暖，想听听大家的校园暖心瞬间。',JSON_ARRAY('食堂','校园故事'),'pinned',0,1210,112,46,DATE_SUB(NOW(), INTERVAL 53 HOUR),DATE_SUB(NOW(), INTERVAL 51 HOUR)),
  (3,'00000000-0000-0000-0000-000000000109','图书馆占座现象怎么解决','晚去根本找不到位置。','最近图书馆占座越来越夸张，很多位置放着书包人却不在，大家觉得有什么比较公平的办法。',JSON_ARRAY('图书馆','学习'),'normal',0,515,44,20,DATE_SUB(NOW(), INTERVAL 50 HOUR),DATE_SUB(NOW(), INTERVAL 49 HOUR)),
  (3,'00000000-0000-0000-0000-000000000128','运动会志愿者体验分享','累但很值得。','第一次做运动会志愿者，虽然站了一天腿很酸，但是看大家拼尽全力真的很有感染力。',JSON_ARRAY('志愿者','运动会'),'normal',0,322,26,11,DATE_SUB(NOW(), INTERVAL 48 HOUR),DATE_SUB(NOW(), INTERVAL 47 HOUR)),
  (4,'00000000-0000-0000-0000-000000000001','今晚峡谷五排差一位辅助','九点半准时开。','我们固定队今晚九点半开，段位钻石到星耀都行，心态稳定优先，输赢都不甩锅。',JSON_ARRAY('开黑','组队'),'featured',0,882,95,33,DATE_SUB(NOW(), INTERVAL 46 HOUR),DATE_SUB(NOW(), INTERVAL 45 HOUR)),
  (4,'00000000-0000-0000-0000-000000000117','LOL 新版本打野路线讨论','前期节奏太快。','新版本野区改动后，我总感觉三分钟就开始崩盘，大家现在都怎么规划第一轮路线。',JSON_ARRAY('LOL','打野'),'normal',0,449,35,16,DATE_SUB(NOW(), INTERVAL 44 HOUR),DATE_SUB(NOW(), INTERVAL 43 HOUR)),
  (4,'00000000-0000-0000-0000-000000000115','电竞椅有必要买吗','宿舍久坐腰疼。','最近写代码和打游戏时间都很长，普通椅子坐久了不舒服，大家有性价比高的电竞椅推荐吗。',JSON_ARRAY('设备','宿舍'),'normal',0,309,21,8,DATE_SUB(NOW(), INTERVAL 42 HOUR),DATE_SUB(NOW(), INTERVAL 41 HOUR)),
  (5,'00000000-0000-0000-0000-000000000050','室友作息完全相反怎么沟通','我晚睡他早睡。','我们宿舍现在最大矛盾是作息冲突，我晚上写代码，他早上六点起床背书，怎么沟通比较不伤和气。',JSON_ARRAY('宿舍','沟通'),'featured',0,1024,97,40,DATE_SUB(NOW(), INTERVAL 40 HOUR),DATE_SUB(NOW(), INTERVAL 39 HOUR)),
  (5,'00000000-0000-0000-0000-000000000123','考前焦虑到失眠怎么办','白天效率也下降。','下周连着三门考试，晚上总在想最坏结果，睡不着导致白天更焦虑，有没有有效的缓解方法。',JSON_ARRAY('焦虑','期末'),'normal',0,587,52,19,DATE_SUB(NOW(), INTERVAL 38 HOUR),DATE_SUB(NOW(), INTERVAL 37 HOUR)),
  (5,'00000000-0000-0000-0000-000000000118','想表白但怕影响朋友关系','犹豫了很久。','喜欢同班同学一年了，我们现在关系还不错，但我担心说破后连朋友都做不成，大家怎么看。',JSON_ARRAY('表白','情感'),'normal',0,466,41,15,DATE_SUB(NOW(), INTERVAL 36 HOUR),DATE_SUB(NOW(), INTERVAL 35 HOUR)),
  (6,'00000000-0000-0000-0000-000000000121','家教兼职第一次试讲注意啥','担心控场不住。','周末要去做第一次家教试讲，学生是初二，想问下大家一般会怎么准备开场和互动。',JSON_ARRAY('兼职','家教'),'pinned',0,734,68,27,DATE_SUB(NOW(), INTERVAL 34 HOUR),DATE_SUB(NOW(), INTERVAL 33 HOUR)),
  (6,'00000000-0000-0000-0000-000000000107','校内勤工助学岗位怎么申请','官网信息太散。','想在图书馆或者实验室做勤工助学，但是各学院通知不统一，求一个比较清晰的申请路径。',JSON_ARRAY('勤工助学','申请'),'normal',0,418,33,12,DATE_SUB(NOW(), INTERVAL 32 HOUR),DATE_SUB(NOW(), INTERVAL 31 HOUR)),
  (6,'00000000-0000-0000-0000-000000000129','实习面试被问项目深度咋答','总感觉回答太浅。','我投前端实习时总被追问项目细节，尤其是性能优化和工程化部分，应该怎么组织回答更有说服力。',JSON_ARRAY('实习','面试'),'featured',0,908,84,36,DATE_SUB(NOW(), INTERVAL 30 HOUR),DATE_SUB(NOW(), INTERVAL 29 HOUR)),
  (7,'00000000-0000-0000-0000-000000000113','高数期末复习资料互助帖','把重点题型汇总下。','大家把自己整理的高数题型和易错点贴在下面吧，我来做一个总索引方便大家冲刺。',JSON_ARRAY('高数','复习'),'pinned',0,1126,109,48,DATE_SUB(NOW(), INTERVAL 28 HOUR),DATE_SUB(NOW(), INTERVAL 27 HOUR)),
  (7,'00000000-0000-0000-0000-000000000112','四六级听力素材推荐','想找真实语速。','刷题软件的音频有点机械，求推荐一些接近真题语速的听力素材或播客资源。',JSON_ARRAY('英语','四六级'),'normal',0,402,30,10,DATE_SUB(NOW(), INTERVAL 26 HOUR),DATE_SUB(NOW(), INTERVAL 25 HOUR)),
  (7,'00000000-0000-0000-0000-000000000116','考研数学网课怎么选','基础一般怕跟不上。','想提前准备考研数学，基础不算好，求推荐讲得细一点的老师和配套刷题节奏。',JSON_ARRAY('考研','数学'),'normal',0,365,28,11,DATE_SUB(NOW(), INTERVAL 24 HOUR),DATE_SUB(NOW(), INTERVAL 23 HOUR)),
  (8,'00000000-0000-0000-0000-000000000001','Next.js 接 MySQL 会话过期排查总结','给同样踩坑的同学。','最近把论坛从 Supabase 改到 MySQL，会话偶发失效，整理了一份排查步骤和注意点，欢迎补充。',JSON_ARRAY('Next.js','MySQL'),'featured',0,1560,138,61,DATE_SUB(NOW(), INTERVAL 22 HOUR),DATE_SUB(NOW(), INTERVAL 21 HOUR)),
  (8,'00000000-0000-0000-0000-000000000115','前端项目里状态管理怎么选','zustand 还是 redux。','课程项目规模中等，页面不少但逻辑不算复杂，大家会更推荐 zustand 还是 redux toolkit。',JSON_ARRAY('前端','状态管理'),'normal',0,479,36,14,DATE_SUB(NOW(), INTERVAL 20 HOUR),DATE_SUB(NOW(), INTERVAL 19 HOUR)),
  (8,'00000000-0000-0000-0000-000000000126','SQL 外键总报错求救','删父表数据时失败。','我在做实验时删主表记录经常被外键拦住，想系统理解一遍 cascade 和 set null 的区别。',JSON_ARRAY('SQL','外键'),'normal',0,532,47,18,DATE_SUB(NOW(), INTERVAL 18 HOUR),DATE_SUB(NOW(), INTERVAL 17 HOUR)),
  (9,'00000000-0000-0000-0000-000000000114','期末周作息打卡贴','互相监督早睡早起。','今天开始每天打卡学习时长和睡眠时间，欢迎一起坚持，看看谁能稳住节奏。',JSON_ARRAY('打卡','作息'),'normal',0,348,22,9,DATE_SUB(NOW(), INTERVAL 16 HOUR),DATE_SUB(NOW(), INTERVAL 15 HOUR)),
  (9,'00000000-0000-0000-0000-000000000127','宿舍空调费怎么均摊更合理','有人怕冷有人怕热。','我们宿舍开空调频率差异很大，月底电费总有争议，想听听其他宿舍是怎么分摊的。',JSON_ARRAY('宿舍','空调'),'normal',0,291,19,7,DATE_SUB(NOW(), INTERVAL 14 HOUR),DATE_SUB(NOW(), INTERVAL 13 HOUR)),
  (9,'00000000-0000-0000-0000-000000000108','想练演讲但上台紧张','有没有训练方法。','我平时表达还行，但一上台声音就发抖，大家有没有亲测有效的克服紧张方法。',JSON_ARRAY('演讲','表达'),'normal',0,263,17,6,DATE_SUB(NOW(), INTERVAL 12 HOUR),DATE_SUB(NOW(), INTERVAL 11 HOUR)),
  (10,'00000000-0000-0000-0000-000000000050','软工答辩 PPT 怎么做更像项目实战','怕被老师追问细节。','现在在做论坛项目答辩，想知道 PPT 应该怎么安排页面，才能体现需求分析、设计和测试。',JSON_ARRAY('答辩','PPT'),'featured',0,1328,121,53,DATE_SUB(NOW(), INTERVAL 10 HOUR),DATE_SUB(NOW(), INTERVAL 9 HOUR)),
  (10,'00000000-0000-0000-0000-000000000103','ER 图主外键太多容易乱怎么办','画图总是交叉。','数据库表一多，ER 图连线就很乱，大家一般会按什么方式拆图，才能清晰又不漏关系。',JSON_ARRAY('ER图','数据库'),'normal',0,396,31,12,DATE_SUB(NOW(), INTERVAL 8 HOUR),DATE_SUB(NOW(), INTERVAL 7 HOUR)),
  (10,'00000000-0000-0000-0000-000000000122','简历上的项目描述写几条合适','怕写太多太空。','前端实习简历里项目经历一般写几条最合适？每条要不要带数据指标。',JSON_ARRAY('简历','求职'),'normal',0,337,24,8,DATE_SUB(NOW(), INTERVAL 7 HOUR),DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (11,'00000000-0000-0000-0000-000000000124','东门丢了校园卡求线索','卡套是蓝色的。','今天下午在东门到教学楼这条路上丢了校园卡，姓名缩写 WJL，捡到请联系我。',JSON_ARRAY('失物','校园卡'),'normal',0,221,14,5,DATE_SUB(NOW(), INTERVAL 6 HOUR),DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  (11,'00000000-0000-0000-0000-000000000125','谁在操场看台捡到白色耳机盒','里面有一只耳机。','昨晚跑步后发现耳机盒不见了，应该落在操场看台，麻烦有线索的同学私信。',JSON_ARRAY('耳机','寻物'),'normal',0,204,13,4,DATE_SUB(NOW(), INTERVAL 5 HOUR),DATE_SUB(NOW(), INTERVAL 4 HOUR)),
  (11,'00000000-0000-0000-0000-000000000130','图书馆三楼黑伞有人误拿吗','伞柄有银色胶带。','今晚离开图书馆时发现伞不见了，可能被误拿，伞柄缠了银色胶带，求归还。',JSON_ARRAY('雨伞','寻回'),'normal',0,187,11,4,DATE_SUB(NOW(), INTERVAL 4 HOUR),DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (12,'00000000-0000-0000-0000-000000000102','周末南京周边一日游推荐','预算 200 左右。','期末前想放松一下，有没有交通方便、预算不高的一日游路线推荐。',JSON_ARRAY('周末','出游'),'normal',0,281,20,8,DATE_SUB(NOW(), INTERVAL 3 HOUR),DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  (12,'00000000-0000-0000-0000-000000000105','最近有什么高分电影值得看','偏剧情片。','这两周压力有点大，想找几部节奏不拖沓、剧情有深度的电影，求安利。',JSON_ARRAY('电影','放松'),'normal',0,318,27,10,DATE_SUB(NOW(), INTERVAL 2 HOUR),DATE_SUB(NOW(), INTERVAL 1 HOUR)),
  (12,'00000000-0000-0000-0000-000000000106','晚安打卡第 1 天','希望这次能坚持一个月。','从今天开始早睡计划，23:30 前关手机，欢迎大家一起打卡互相监督。',JSON_ARRAY('晚安','打卡'),'normal',0,246,18,6,DATE_SUB(NOW(), INTERVAL 1 HOUR),NOW());

INSERT INTO `post_replies` (`post_id`,`author_id`,`content`,`seat`,`is_visible`,`created_at`) VALUES
  (1,'00000000-0000-0000-0000-000000000002','我一般会把硬核课错开，专业课最多同学期两门。',1,1,DATE_SUB(NOW(), INTERVAL 69 HOUR)),
  (1,'00000000-0000-0000-0000-000000000121','可以先看往年任务量，再决定选课组合。',2,1,DATE_SUB(NOW(), INTERVAL 68 HOUR)),
  (5,'00000000-0000-0000-0000-000000000111','北操南侧看台傍晚逆光很好，拍人像很出片。',1,1,DATE_SUB(NOW(), INTERVAL 57 HOUR)),
  (7,'00000000-0000-0000-0000-000000000004','我也遇到过，和管理员反馈后有试行离座计时。',1,1,DATE_SUB(NOW(), INTERVAL 49 HOUR)),
  (10,'00000000-0000-0000-0000-000000000105','我补位辅助，主玩软辅和开团辅都行。',1,1,DATE_SUB(NOW(), INTERVAL 45 HOUR)),
  (13,'00000000-0000-0000-0000-000000000002','先定一个安静时段，再用耳塞和台灯分区。',1,1,DATE_SUB(NOW(), INTERVAL 39 HOUR)),
  (14,'00000000-0000-0000-0000-000000000118','睡前别刷短视频，做十分钟呼吸训练会好很多。',1,1,DATE_SUB(NOW(), INTERVAL 37 HOUR)),
  (16,'00000000-0000-0000-0000-000000000004','第一节别讲太满，先诊断学生基础再推进。',1,1,DATE_SUB(NOW(), INTERVAL 33 HOUR)),
  (18,'00000000-0000-0000-0000-000000000001','可以按项目背景-职责-难点-结果四段来讲。',1,1,DATE_SUB(NOW(), INTERVAL 29 HOUR)),
  (19,'00000000-0000-0000-0000-000000000109','我整理了洛必达和定积分题型，晚点上传。',1,1,DATE_SUB(NOW(), INTERVAL 27 HOUR)),
  (22,'00000000-0000-0000-0000-000000000003','cookie 过期时间和服务端 session ttl 要一致。',1,1,DATE_SUB(NOW(), INTERVAL 21 HOUR)),
  (24,'00000000-0000-0000-0000-000000000115','先画主外键关系图，再补索引设计会清晰很多。',1,1,DATE_SUB(NOW(), INTERVAL 17 HOUR)),
  (28,'00000000-0000-0000-0000-000000000102','我用演讲提纲卡片法，先练开场三句话很有效。',1,1,DATE_SUB(NOW(), INTERVAL 11 HOUR)),
  (29,'00000000-0000-0000-0000-000000000001','建议讲清楚需求-架构-数据库-测试四条主线。',1,1,DATE_SUB(NOW(), INTERVAL 9 HOUR)),
  (29,'00000000-0000-0000-0000-000000000050','好的，我会把时序图和泳道图都补上。',2,1,DATE_SUB(NOW(), INTERVAL 8 HOUR)),
  (31,'00000000-0000-0000-0000-000000000121','每个模块单独一张小图，最后再放总 ER 图。',1,1,DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  (34,'00000000-0000-0000-0000-000000000124','如果有人捡到可以先放宿管阿姨那边。',1,1,DATE_SUB(NOW(), INTERVAL 3 HOUR)),
  (36,'00000000-0000-0000-0000-000000000114','我也加入，今晚 23:20 来打卡。',1,1,DATE_SUB(NOW(), INTERVAL 1 HOUR));

UPDATE `posts` p
SET `reply_count` = (
  SELECT COUNT(*)
  FROM `post_replies` r
  WHERE r.post_id = p.id AND r.is_visible = 1
);

UPDATE `boards` b
SET `post_count` = (
      SELECT COUNT(*)
      FROM `posts` p
      WHERE p.board_id = b.id
    ),
    `today_count` = (
      SELECT COUNT(*)
      FROM `posts` p
      WHERE p.board_id = b.id AND DATE(p.created_at) = CURRENT_DATE()
    );

INSERT INTO `private_messages` (`sender_id`,`receiver_id`,`content`,`is_read`,`created_at`) VALUES
  ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000050','Bryce，我把答辩模板发你邮箱了。',1,DATE_SUB(NOW(), INTERVAL 6 HOUR)),
  ('00000000-0000-0000-0000-000000000050','00000000-0000-0000-0000-000000000003','收到了，谢谢！我晚点把修改版给你看。',0,DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000004','你那篇选课帖我帮你置顶了一会儿，方便大家看到。',1,DATE_SUB(NOW(), INTERVAL 4 HOUR)),
  ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000002','太感谢了，互动明显上来了。',0,DATE_SUB(NOW(), INTERVAL 3 HOUR));

INSERT INTO `notifications` (`user_id`,`type`,`title`,`description`,`is_read`,`created_at`) VALUES
  ('00000000-0000-0000-0000-000000000050','reply','你的帖子有新回复','软工答辩 PPT 的帖子收到 2 条新建议。',0,DATE_SUB(NOW(), INTERVAL 8 HOUR)),
  ('00000000-0000-0000-0000-000000000003','system','数据库种子已恢复','已切回全中文帖子和扩展用户版本。',0,DATE_SUB(NOW(), INTERVAL 2 HOUR)),
  ('00000000-0000-0000-0000-000000000121','friend','收到新的私信','你有一条来自同学的未读消息。',0,DATE_SUB(NOW(), INTERVAL 1 HOUR));

INSERT INTO `notices` (`title`,`content`,`board_id`,`is_active`,`created_at`) VALUES
  ('期末周发帖规范','请大家在标题中说明问题场景，便于同学快速定位并回答。',10,1,DATE_SUB(NOW(), INTERVAL 12 HOUR)),
  ('失物招领提醒','发布寻物帖请尽量写清时间地点和物品特征，捡到同学可私信联系。',11,1,DATE_SUB(NOW(), INTERVAL 6 HOUR));

INSERT INTO `audit_logs` (`actor_id`,`action`,`target_type`,`target_id`,`created_at`) VALUES
  ('00000000-0000-0000-0000-000000000001','seed_restore','system','seed_restore_data.sql',NOW());

