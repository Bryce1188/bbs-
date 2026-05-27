-- BBS MySQL 全量脚本
-- 适用版本: MySQL 8.x

CREATE DATABASE IF NOT EXISTS `bbs_mysql` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `bbs_mysql`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS `view_public_profiles`;

DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `role_permissions`;
DROP TABLE IF EXISTS `permissions`;
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `checkins`;
DROP TABLE IF EXISTS `grades`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `private_messages`;
DROP TABLE IF EXISTS `friendships`;
DROP TABLE IF EXISTS `follows`;
DROP TABLE IF EXISTS `bookmarks`;
DROP TABLE IF EXISTS `post_reactions`;
DROP TABLE IF EXISTS `post_replies`;
DROP TABLE IF EXISTS `posts`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `boards`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `users_auth`;
DROP TABLE IF EXISTS `roles`;

CREATE TABLE `users_auth` (
  `id` char(36) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email_confirmed_at` datetime NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_auth_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(80) NOT NULL,
  `description` varchar(300) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `profiles` (
  `id` char(36) NOT NULL,
  `username` varchar(80) NOT NULL,
  `display_name` varchar(80) NOT NULL,
  `avatar_path` varchar(255) DEFAULT NULL,
  `role` enum('admin','moderator','member') NOT NULL DEFAULT 'member',
  `level_name` varchar(80) NOT NULL DEFAULT 'Lv.1 新人',
  `points` int NOT NULL DEFAULT 0,
  `signature` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profiles_username` (`username`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`id`) REFERENCES `users_auth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_permissions_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_permission` (`role_id`,`permission_id`),
  CONSTRAINT `fk_role_permissions_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `idx_user_roles_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `boards` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) NOT NULL,
  `name` varchar(80) NOT NULL,
  `group_name` varchar(80) NOT NULL,
  `description` varchar(400) NOT NULL DEFAULT '',
  `icon` varchar(80) NOT NULL DEFAULT 'PanelsTopLeft',
  `theme_color` varchar(40) NOT NULL DEFAULT 'teal',
  `post_count` int NOT NULL DEFAULT 0,
  `today_count` int NOT NULL DEFAULT 0,
  `sort_order` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_boards_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `posts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `board_id` bigint NOT NULL,
  `author_id` char(36) DEFAULT NULL,
  `title` varchar(120) NOT NULL,
  `excerpt` varchar(220) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  `tags` json NOT NULL,
  `status` enum('featured','pinned','normal') NOT NULL DEFAULT 'normal',
  `reply_count` int NOT NULL DEFAULT 0,
  `view_count` int NOT NULL DEFAULT 0,
  `like_count` int NOT NULL DEFAULT 0,
  `collect_count` int NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_posts_board_updated` (`board_id`,`updated_at` DESC),
  KEY `idx_posts_author` (`author_id`),
  CONSTRAINT `fk_posts_board` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_posts_author` FOREIGN KEY (`author_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `post_replies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `author_id` char(36) DEFAULT NULL,
  `content` text NOT NULL,
  `seat` int NOT NULL DEFAULT 1,
  `is_visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_replies_post_created` (`post_id`,`created_at`),
  KEY `idx_post_replies_author` (`author_id`),
  CONSTRAINT `fk_post_replies_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_replies_author` FOREIGN KEY (`author_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `post_reactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `post_id` bigint NOT NULL,
  `user_id` char(36) NOT NULL,
  `reaction` varchar(20) NOT NULL DEFAULT 'like',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_post_reaction` (`post_id`,`user_id`,`reaction`),
  KEY `idx_post_reactions_user` (`user_id`),
  CONSTRAINT `fk_post_reactions_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_post_reactions_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `bookmarks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `post_id` bigint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookmark` (`user_id`,`post_id`),
  KEY `idx_bookmarks_post` (`post_id`),
  CONSTRAINT `fk_bookmarks_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookmarks_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `follows` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `follower_id` char(36) NOT NULL,
  `following_id` char(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_follow_pair` (`follower_id`,`following_id`),
  KEY `idx_follows_following` (`following_id`),
  CONSTRAINT `fk_follows_follower` FOREIGN KEY (`follower_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_follows_following` FOREIGN KEY (`following_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `friendships` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `requester_id` char(36) NOT NULL,
  `addressee_id` char(36) NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_friendships_pair` (`requester_id`,`addressee_id`),
  KEY `idx_friendships_addressee` (`addressee_id`,`status`),
  CONSTRAINT `fk_friendships_requester` FOREIGN KEY (`requester_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_friendships_addressee` FOREIGN KEY (`addressee_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `private_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` char(36) NOT NULL,
  `receiver_id` char(36) NOT NULL,
  `content` text NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sender_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `receiver_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_private_messages_inbox` (`receiver_id`,`is_read`,`created_at` DESC),
  KEY `idx_private_messages_sender` (`sender_id`),
  CONSTRAINT `fk_private_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_private_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(36) DEFAULT NULL,
  `type` enum('reply','friend','system','report') NOT NULL,
  `title` varchar(120) NOT NULL,
  `description` varchar(400) NOT NULL DEFAULT '',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`,`is_read`,`created_at` DESC),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `reporter_id` char(36) DEFAULT NULL,
  `post_id` bigint DEFAULT NULL,
  `reason` varchar(400) NOT NULL,
  `status` enum('pending','resolved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reports_status` (`status`,`created_at` DESC),
  KEY `idx_reports_post` (`post_id`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_reports_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `notices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(120) NOT NULL,
  `content` text NOT NULL,
  `board_id` bigint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notices_board` (`board_id`),
  CONSTRAINT `fk_notices_board` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `checkins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` char(36) NOT NULL,
  `checkin_date` date NOT NULL DEFAULT (CURRENT_DATE),
  `award_points` int NOT NULL DEFAULT 5,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_checkin_user_date` (`user_id`,`checkin_date`),
  CONSTRAINT `fk_checkins_user` FOREIGN KEY (`user_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `min_points` int NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actor_id` char(36) DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `target_type` varchar(80) NOT NULL,
  `target_id` varchar(80) DEFAULT NULL,
  `ip` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_actor` (`actor_id`),
  CONSTRAINT `fk_audit_logs_actor` FOREIGN KEY (`actor_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_sessions` (
  `session_token` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_token`),
  KEY `idx_user_sessions_user` (`user_id`),
  KEY `idx_user_sessions_expire` (`expires_at`),
  CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `password_reset_tokens` (
  `token` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token`),
  KEY `idx_password_reset_user` (`user_id`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users_auth` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW `view_public_profiles` AS
SELECT
  `id`,
  `username`,
  `display_name`,
  `avatar_path`,
  `level_name`,
  `points`,
  `signature`,
  `created_at`
FROM `profiles`;

DELIMITER $$

DROP PROCEDURE IF EXISTS `sp_create_post`$$
CREATE PROCEDURE `sp_create_post`(
  IN `p_board_id` BIGINT,
  IN `p_author_id` CHAR(36),
  IN `p_title` VARCHAR(120),
  IN `p_content` TEXT,
  IN `p_tags` JSON
)
BEGIN
  DECLARE v_excerpt VARCHAR(220);
  DECLARE v_post_id BIGINT;
  SET v_excerpt = LEFT(REPLACE(REPLACE(REPLACE(p_content, '\n', ' '), '\r', ' '), '\t', ' '), 180);

  INSERT INTO posts (board_id, author_id, title, excerpt, content, tags, status)
  VALUES (p_board_id, p_author_id, p_title, v_excerpt, p_content, COALESCE(p_tags, JSON_ARRAY()), 'normal');

  SET v_post_id = LAST_INSERT_ID();
  UPDATE boards SET post_count = post_count + 1, today_count = today_count + 1 WHERE id = p_board_id;
  INSERT INTO audit_logs (actor_id, action, target_type, target_id) VALUES (p_author_id, 'create_post', 'post', CAST(v_post_id AS CHAR));

  SELECT v_post_id AS post_id;
END$$

DROP PROCEDURE IF EXISTS `sp_create_reply`$$
CREATE PROCEDURE `sp_create_reply`(
  IN `p_post_id` BIGINT,
  IN `p_author_id` CHAR(36),
  IN `p_content` TEXT
)
BEGIN
  DECLARE v_next_seat INT;
  DECLARE v_reply_id BIGINT;

  SELECT COALESCE(MAX(seat), 0) + 1 INTO v_next_seat FROM post_replies WHERE post_id = p_post_id;
  INSERT INTO post_replies (post_id, author_id, content, seat, is_visible) VALUES (p_post_id, p_author_id, p_content, v_next_seat, 1);
  SET v_reply_id = LAST_INSERT_ID();

  UPDATE posts SET reply_count = reply_count + 1, updated_at = NOW() WHERE id = p_post_id;
  INSERT INTO audit_logs (actor_id, action, target_type, target_id) VALUES (p_author_id, 'create_reply', 'reply', CAST(v_reply_id AS CHAR));

  SELECT v_reply_id AS reply_id;
END$$

DROP PROCEDURE IF EXISTS `sp_toggle_post_reaction`$$
CREATE PROCEDURE `sp_toggle_post_reaction`(
  IN `p_post_id` BIGINT,
  IN `p_user_id` CHAR(36)
)
BEGIN
  DECLARE v_exists BIGINT;
  SELECT id INTO v_exists FROM post_reactions WHERE post_id = p_post_id AND user_id = p_user_id AND reaction = 'like' LIMIT 1;
  IF v_exists IS NULL THEN
    INSERT INTO post_reactions (post_id, user_id, reaction) VALUES (p_post_id, p_user_id, 'like');
    UPDATE posts SET like_count = like_count + 1 WHERE id = p_post_id;
    SELECT 1 AS liked;
  ELSE
    DELETE FROM post_reactions WHERE id = v_exists;
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_post_id;
    SELECT 0 AS liked;
  END IF;
END$$

DROP PROCEDURE IF EXISTS `sp_toggle_bookmark`$$
CREATE PROCEDURE `sp_toggle_bookmark`(
  IN `p_post_id` BIGINT,
  IN `p_user_id` CHAR(36)
)
BEGIN
  DECLARE v_exists BIGINT;
  SELECT id INTO v_exists FROM bookmarks WHERE post_id = p_post_id AND user_id = p_user_id LIMIT 1;
  IF v_exists IS NULL THEN
    INSERT INTO bookmarks (post_id, user_id) VALUES (p_post_id, p_user_id);
    UPDATE posts SET collect_count = collect_count + 1 WHERE id = p_post_id;
    SELECT 1 AS bookmarked;
  ELSE
    DELETE FROM bookmarks WHERE id = v_exists;
    UPDATE posts SET collect_count = GREATEST(collect_count - 1, 0) WHERE id = p_post_id;
    SELECT 0 AS bookmarked;
  END IF;
END$$

DELIMITER ;

INSERT INTO `roles` (`id`,`code`,`name`,`description`) VALUES
  (1,'admin','超级管理员','后台全量权限'),
  (2,'moderator','板块管理员','帖子/评论/举报管理'),
  (3,'member','普通用户','发帖、回复、收藏、私信')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

INSERT INTO `permissions` (`code`,`name`,`description`) VALUES
  ('board.read','读取板块','可读取板块信息'),
  ('board.update','编辑板块','可编辑板块配置'),
  ('post.create','创建帖子','可发帖'),
  ('post.moderate','管理帖子','可改帖子状态'),
  ('reply.moderate','管理回复','可切换评论可见性'),
  ('report.review','审核举报','可处理举报'),
  ('notice.manage','管理公告','可发布公告'),
  ('role.manage','角色管理','可维护角色'),
  ('user.role.assign','用户角色分配','可分配用户角色')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'admin'
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'moderator' AND p.code IN ('board.read','post.create','post.moderate','reply.moderate','report.review','notice.manage')
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `role_permissions` (`role_id`,`permission_id`)
SELECT r.id, p.id FROM roles r JOIN permissions p
WHERE r.code = 'member' AND p.code IN ('board.read','post.create')
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `boards` (`id`,`slug`,`name`,`group_name`,`description`,`icon`,`theme_color`,`post_count`,`today_count`,`sort_order`) VALUES
  (1,'departments','部门交流','校园专区','班级、社团、小组协作与通知同步。','Network','teal',0,0,1),
  (2,'hobbies','特长爱好','校园专区','运动、音乐、摄影、手工和生活灵感。','Sparkles','amber',0,0,2),
  (3,'stories','坊间趣事','校园专区','轻松记录校园里有意思的小事。','MessagesSquare','sky',0,0,3),
  (4,'gaming','游戏交流','交流与讨论','组队、攻略、设备和游戏体验。','Gamepad2','violet',0,0,4),
  (5,'wall','告白墙','交流与讨论','公开表达、匿名心事和温柔回应。','Heart','rose',0,0,5),
  (6,'jobs','兼职','交流与讨论','兼职信息、避坑经验和岗位推荐。','Briefcase','emerald',0,0,6),
  (7,'resources','资源共享','交流与讨论','课程、工具、素材和学习路线。','FolderOpen','cyan',0,0,7),
  (8,'code','编程开发','交流与讨论','项目、Bug、框架和工程实践。','Code2','indigo',0,0,8),
  (9,'general','综合交流','交流与讨论','不设边界的日常交流区。','PanelsTopLeft','slate',0,0,9),
  (10,'qa','求助问答','交流与讨论','提问、解答、追问和问题归档。','CircleHelp','orange',0,0,10),
  (11,'lost-found','寻物启事','交流与讨论','失物招领、寻物和线索同步。','Search','lime',0,0,11),
  (12,'chat','休闲灌水','交流与讨论','灌水、接龙和轻量互动。','Coffee','fuchsia',0,0,12)
ON DUPLICATE KEY UPDATE
  `name`=VALUES(`name`),`group_name`=VALUES(`group_name`),`description`=VALUES(`description`),
  `icon`=VALUES(`icon`),`theme_color`=VALUES(`theme_color`),`sort_order`=VALUES(`sort_order`);

INSERT INTO `grades` (`id`,`name`,`min_points`,`image_path`) VALUES
  (1,'Lv.1 新人',0,'grade_img_01.png'),
  (2,'Lv.3 活跃成员',500,'grade_img_03.png'),
  (3,'Lv.5 深度水友',2000,'grade_img_05.png'),
  (4,'Lv.8 星河领航员',8000,'grade_img_08.png')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`),`min_points`=VALUES(`min_points`),`image_path`=VALUES(`image_path`);

-- 提示: password_hash 使用 bcryptjs 生成；你也可以用注册页自行创建账号。
INSERT INTO `users_auth` (`id`,`email`,`password_hash`,`email_confirmed_at`) VALUES
  ('00000000-0000-0000-0000-000000000001','xzr@example.com','$2b$10$b6GEzcKafGjcsN68F/aHWOoiK.uc2glKmQ17IRG7vlges1sMEzTU6',NOW()),
  ('00000000-0000-0000-0000-000000000002','lp@example.com','$2b$10$WD/Dl2Sx2/V3smouTz4Z5uCLZVn4jYrfRTiXe89T34pKFcC03dyGC',NOW()),
  ('00000000-0000-0000-0000-000000000003','ywt@example.com','$2b$10$eWZ7uklF9mXa6.1/ZthJmuBRmx2HTCsM5sGwL0ZHLQGKR1j02asJK',NOW()),
  ('00000000-0000-0000-0000-000000000004','lsw@example.com','$2b$10$rfMcHBTIXVnYcRahuLw4uOIG6/2r/mBl/6JAvLicKnp6FXdG5l0.a',NOW())
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`);

INSERT INTO `profiles` (`id`,`username`,`display_name`,`avatar_path`,`role`,`level_name`,`points`,`signature`) VALUES
  ('00000000-0000-0000-0000-000000000001','xzr','xzr','/avatars/admin.svg','admin','Lv.8 管理员',4820,'负责维护论坛秩序，也会整理学习资料。'),
  ('00000000-0000-0000-0000-000000000002','lp','lp','/avatars/member-a.svg','moderator','Lv.6 版主',3260,'喜欢把问题拆清楚再动手。'),
  ('00000000-0000-0000-0000-000000000003','ywt','ywt','/avatars/member-b.svg','member','Lv.5 活跃成员',2790,'最近在学前端和数据库。'),
  ('00000000-0000-0000-0000-000000000004','lsw','lsw','/avatars/placeholder-user.svg','member','Lv.4 认真回帖',2180,'有问题先搜索，再提问。')
ON DUPLICATE KEY UPDATE
  `display_name`=VALUES(`display_name`),`avatar_path`=VALUES(`avatar_path`),`role`=VALUES(`role`),
  `level_name`=VALUES(`level_name`),`points`=VALUES(`points`),`signature`=VALUES(`signature`);

INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT '00000000-0000-0000-0000-000000000001', id FROM roles WHERE code = 'admin'
ON DUPLICATE KEY UPDATE role_id = role_id;
INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT '00000000-0000-0000-0000-000000000002', id FROM roles WHERE code = 'moderator'
ON DUPLICATE KEY UPDATE role_id = role_id;
INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT '00000000-0000-0000-0000-000000000003', id FROM roles WHERE code = 'member'
ON DUPLICATE KEY UPDATE role_id = role_id;
INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT '00000000-0000-0000-0000-000000000004', id FROM roles WHERE code = 'member'
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `posts` (`id`,`board_id`,`author_id`,`title`,`excerpt`,`content`,`tags`,`status`,`reply_count`,`view_count`,`like_count`,`collect_count`,`created_at`,`updated_at`) VALUES
  (1001,8,'00000000-0000-0000-0000-000000000001','Next.js 项目本地运行时，环境变量应该怎么配？','整理了一下本地跑论坛项目时最容易漏掉的 .env.local、端口和数据库配置。','今天把论坛项目重新跑了一遍，发现最容易出问题的地方不是代码，而是环境变量。',JSON_ARRAY('Next.js','环境配置','本地运行'),'featured',0,86,4,2,'2026-05-27 09:20:00','2026-05-27 10:12:00'),
  (1002,7,'00000000-0000-0000-0000-000000000003','期末复习资料汇总：软件工程、数据库和前端','把最近几天大家发过的资料整理成一份清单，方便复习前直接找。','软件工程部分建议先看需求分析、用例图、类图和测试用例；数据库部分重点复习范式、SQL 查询、索引和事务。',JSON_ARRAY('复习','资料','期末'),'pinned',0,132,5,4,'2026-05-26 20:10:00','2026-05-27 08:16:00')
ON DUPLICATE KEY UPDATE
  `title`=VALUES(`title`),`excerpt`=VALUES(`excerpt`),`content`=VALUES(`content`),`tags`=VALUES(`tags`),`status`=VALUES(`status`);

-- 扩充用户（用户名为 3 个字母；默认密码规则为 用户名+123）
INSERT INTO `users_auth` (`id`,`email`,`password_hash`,`email_confirmed_at`) VALUES
  ('00000000-0000-0000-0000-000000000005','zrq@campus.local','$2b$10$CstI9V16KcAVDgrcDEgb1eC56M.xJKYA94PmnKf5LzORVT8VSzy22',NOW()),
  ('00000000-0000-0000-0000-000000000006','lwy@campus.local','$2b$10$P1HI1vYGqNpj6nVxfk/LYueSRCDLO9q5NC2YRQU14H9Xj7F6oKc3S',NOW()),
  ('00000000-0000-0000-0000-000000000007','cyj@campus.local','$2b$10$FM07Th4unYZfLc4Io6KxIOGWaXuHlvty5FMy12Y4/Q6ZF.Y11UBwq',NOW()),
  ('00000000-0000-0000-0000-000000000008','hxm@campus.local','$2b$10$cGKnYduOgR0ZbIDVRk7MzuNcVpopbni5EjRHu4VehEbQ5mmBZuShC',NOW()),
  ('00000000-0000-0000-0000-000000000009','qzy@campus.local','$2b$10$F6HWmB//RAv9yZUmTpGGhetzbrwUXzvFl3Kvr5Z3h3tGu3.Zg7Ho6',NOW()),
  ('00000000-0000-0000-0000-000000000010','txh@campus.local','$2b$10$1RW6GI/.K1QpkFEjyYnyF.MU1AFjQKF4zLXFBjHok0AKUtwSQNHnC',NOW()),
  ('00000000-0000-0000-0000-000000000011','mjk@campus.local','$2b$10$RQKJhKwuRpJNd73eBOoXR.x3bp7lOqFrsjW84Ftn8JfNu/y/tPevq',NOW()),
  ('00000000-0000-0000-0000-000000000012','syq@campus.local','$2b$10$I7rmKLy/cfiHtvdo/qPrkePS.NxkNa.FlLlubpD8MOgKN81O8Iz76',NOW()),
  ('00000000-0000-0000-0000-000000000013','dln@campus.local','$2b$10$SS8Wc0rdj2UQcd0UxHFO6.W9HB37aPY8GwH/NeolyA2eVCwsjRlRe',NOW()),
  ('00000000-0000-0000-0000-000000000014','wrx@campus.local','$2b$10$HgTzRo9/wYpOytOGez3VHeAvq9ZyfumzTttoh3xsp1LP3bLYOWO0q',NOW()),
  ('00000000-0000-0000-0000-000000000015','gjh@campus.local','$2b$10$QqsOuipmot5mTvKzhQkKleIhfbwr2ltYdyuc/z728I0OnminJbFpi',NOW()),
  ('00000000-0000-0000-0000-000000000016','ycx@campus.local','$2b$10$MAk1u/aj/w.TeW2YCtLDFO3gzofhtsOR/s07/LzDBtMPZjYv2vzKq',NOW()),
  ('00000000-0000-0000-0000-000000000017','pml@campus.local','$2b$10$Y3R71ezME0ODNfrM2bg.NOBrLEcqyY2xP68xlz2D.LNVL/PVUmsmu',NOW()),
  ('00000000-0000-0000-0000-000000000018','bqt@campus.local','$2b$10$/yll3J7Oi3VHuf5l4kQWI.7MRR1gRUIkqpX3bMA446eoNpKtQpdtO',NOW()),
  ('00000000-0000-0000-0000-000000000019','nzr@campus.local','$2b$10$6h8ZwRHUSjZSLUal87YG2ulKgY94VdnkkTHaLx6DvFB4EjHFGK5pC',NOW()),
  ('00000000-0000-0000-0000-000000000020','kyd@campus.local','$2b$10$//bE/062cBBTOCgZLaEHGO9OEPQChp9DuDVkhLk9Y0dhwAMMTqp0a',NOW()),
  ('00000000-0000-0000-0000-000000000021','fhw@campus.local','$2b$10$18knX8nR5Zwze/5DbIynM.CVaUMiysb4n320sL7pxE3VI2zqv1Pzy',NOW()),
  ('00000000-0000-0000-0000-000000000022','tjl@campus.local','$2b$10$seW5PzJLZg3oULwk6HwkB.9ge2bM2SJEa.KIzDXrpKph9Jg5sT/ia',NOW()),
  ('00000000-0000-0000-0000-000000000023','cwp@campus.local','$2b$10$av2qqRvceANaxiYxr.9H4ew96RddduDnGt6jBH7eLbK1BFkDKl0Q.',NOW()),
  ('00000000-0000-0000-0000-000000000024','lsx@campus.local','$2b$10$M1yPzeet7kPuiWZzf4wxDereDDQo9ztax.3I8p4IYTMmmJvjrYShq',NOW()),
  ('00000000-0000-0000-0000-000000000025','rjm@campus.local','$2b$10$U8yQ2J7W0MG32Y993/kiWOvU2DdIPGbEOXHWbnIeHCUAeMDGCMaqW',NOW()),
  ('00000000-0000-0000-0000-000000000026','vhn@campus.local','$2b$10$XXYsKJBiuBwIwIYD0Xa/fuCq36WibYF1fqQ8IhcXH/4zz1.t3TrAi',NOW()),
  ('00000000-0000-0000-0000-000000000027','ydk@campus.local','$2b$10$AqldusBkl4R5Mc8wViMlYOzCAC06eJO5z.2AyxPd5wyDK8/spsneO',NOW()),
  ('00000000-0000-0000-0000-000000000028','jqw@campus.local','$2b$10$26hp1l20VBccUAWuyf3QUOQzVIW4aqZ0/r3v8L4B7vDSsum8MMUmS',NOW()),
  ('00000000-0000-0000-0000-000000000029','mty@campus.local','$2b$10$uf1fjxDpA.51QlaphYtz8OV7Ex9Rvbj0q1gyJjhom83cy9XdZ1knG',NOW()),
  ('00000000-0000-0000-0000-000000000030','aqn@campus.local','$2b$10$f.57X7vTRkBVW9c2xWcQ9.TkwNdegLlNJL/GeDJ1otsoDvJ4ebTaS',NOW()),
  ('00000000-0000-0000-0000-000000000031','brx@campus.local','$2b$10$BCNQ4Xp1ns/R19FORb5l6OhfyyEkYSAapWnY1T6qENwdQ0EcWAId.',NOW()),
  ('00000000-0000-0000-0000-000000000032','ckm@campus.local','$2b$10$I7g42O2vWXwY0Jz3To8DZegkyTcBOVZOY1k/dyu6/Lwmav6m1NHtG',NOW()),
  ('00000000-0000-0000-0000-000000000033','dqy@campus.local','$2b$10$pfhxC0kS5NxMStc/7ZRKoe1IQKiEf3dAjEpgEHSYbxkKSiVozif0a',NOW()),
  ('00000000-0000-0000-0000-000000000034','ehl@campus.local','$2b$10$Ql3hFv0tJX8o2SpjMAXGEu.Q33ZBzViKLPO5U2guqEdfdPavOdcBO',NOW())
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`);

INSERT INTO `profiles` (`id`,`username`,`display_name`,`avatar_path`,`role`,`level_name`,`points`,`signature`) VALUES
  ('00000000-0000-0000-0000-000000000005','zrq','zrq','/avatars/placeholder-user.svg','member','Lv.1 新生',120,'在补数据结构，欢迎一起刷题。'),
  ('00000000-0000-0000-0000-000000000006','lwy','lwy','/avatars/placeholder-user.svg','member','Lv.1 新生',95,'主打一个有问必回。'),
  ('00000000-0000-0000-0000-000000000007','cyj','cyj','/avatars/placeholder-user.svg','member','Lv.1 新生',132,'最近在准备六级。'),
  ('00000000-0000-0000-0000-000000000008','hxm','hxm','/avatars/placeholder-user.svg','member','Lv.1 新生',166,'前端练习中，欢迎互相交流。'),
  ('00000000-0000-0000-0000-000000000009','qzy','qzy','/avatars/placeholder-user.svg','member','Lv.2 活跃',220,'竞赛党，常驻实验室。'),
  ('00000000-0000-0000-0000-000000000010','txh','txh','/avatars/placeholder-user.svg','member','Lv.2 活跃',214,'偏向后端和数据库。'),
  ('00000000-0000-0000-0000-000000000011','mjk','mjk','/avatars/placeholder-user.svg','member','Lv.1 新生',88,'经常在图书馆一楼。'),
  ('00000000-0000-0000-0000-000000000012','syq','syq','/avatars/placeholder-user.svg','member','Lv.1 新生',104,'喜欢把踩坑记录下来。'),
  ('00000000-0000-0000-0000-000000000013','dln','dln','/avatars/placeholder-user.svg','member','Lv.2 活跃',247,'在准备暑期实习。'),
  ('00000000-0000-0000-0000-000000000014','wrx','wrx','/avatars/placeholder-user.svg','member','Lv.1 新生',142,'作息在调整中。'),
  ('00000000-0000-0000-0000-000000000015','gjh','gjh','/avatars/placeholder-user.svg','member','Lv.1 新生',111,'小组作业常年组长。'),
  ('00000000-0000-0000-0000-000000000016','ycx','ycx','/avatars/placeholder-user.svg','member','Lv.2 活跃',228,'在学 MySQL 索引。'),
  ('00000000-0000-0000-0000-000000000017','pml','pml','/avatars/placeholder-user.svg','member','Lv.1 新生',97,'偏爱夜间学习。'),
  ('00000000-0000-0000-0000-000000000018','bqt','bqt','/avatars/placeholder-user.svg','member','Lv.1 新生',101,'热衷整理复习笔记。'),
  ('00000000-0000-0000-0000-000000000019','nzr','nzr','/avatars/placeholder-user.svg','member','Lv.2 活跃',203,'最近在写课程设计。'),
  ('00000000-0000-0000-0000-000000000020','kyd','kyd','/avatars/placeholder-user.svg','member','Lv.1 新生',93,'欢迎约自习搭子。'),
  ('00000000-0000-0000-0000-000000000021','fhw','fhw','/avatars/placeholder-user.svg','member','Lv.1 新生',119,'每周固定打羽毛球。'),
  ('00000000-0000-0000-0000-000000000022','tjl','tjl','/avatars/placeholder-user.svg','member','Lv.2 活跃',265,'考研数学进行时。'),
  ('00000000-0000-0000-0000-000000000023','cwp','cwp','/avatars/placeholder-user.svg','member','Lv.1 新生',124,'平时在做前端小项目。'),
  ('00000000-0000-0000-0000-000000000024','lsx','lsx','/avatars/placeholder-user.svg','member','Lv.1 新生',99,'消息可能回得慢一点。'),
  ('00000000-0000-0000-0000-000000000025','rjm','rjm','/avatars/placeholder-user.svg','member','Lv.1 新生',135,'喜欢复盘课程作业。'),
  ('00000000-0000-0000-0000-000000000026','vhn','vhn','/avatars/placeholder-user.svg','member','Lv.2 活跃',251,'准备保研材料中。'),
  ('00000000-0000-0000-0000-000000000027','ydk','ydk','/avatars/placeholder-user.svg','member','Lv.1 新生',117,'最近在学网络基础。'),
  ('00000000-0000-0000-0000-000000000028','jqw','jqw','/avatars/placeholder-user.svg','member','Lv.1 新生',109,'想找人一起做项目。'),
  ('00000000-0000-0000-0000-000000000029','mty','mty','/avatars/placeholder-user.svg','member','Lv.2 活跃',206,'冲刺雅思中。'),
  ('00000000-0000-0000-0000-000000000030','aqn','aqn','/avatars/placeholder-user.svg','member','Lv.1 新生',128,'最近在修图和剪视频。'),
  ('00000000-0000-0000-0000-000000000031','brx','brx','/avatars/placeholder-user.svg','member','Lv.2 活跃',241,'喜欢看硬件测评。'),
  ('00000000-0000-0000-0000-000000000032','ckm','ckm','/avatars/placeholder-user.svg','member','Lv.1 新生',84,'软件工程作业进行中。'),
  ('00000000-0000-0000-0000-000000000033','dqy','dqy','/avatars/placeholder-user.svg','member','Lv.1 新生',126,'爱在论坛潜水。'),
  ('00000000-0000-0000-0000-000000000034','ehl','ehl','/avatars/placeholder-user.svg','member','Lv.2 活跃',233,'在准备竞赛答辩。')
ON DUPLICATE KEY UPDATE
  `display_name`=VALUES(`display_name`),`avatar_path`=VALUES(`avatar_path`),`role`=VALUES(`role`),
  `level_name`=VALUES(`level_name`),`points`=VALUES(`points`),`signature`=VALUES(`signature`);

INSERT INTO `user_roles` (`user_id`,`role_id`)
SELECT u.user_id, r.id
FROM (
  SELECT '00000000-0000-0000-0000-000000000005' AS user_id UNION ALL
  SELECT '00000000-0000-0000-0000-000000000006' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000007' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000008' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000009' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000010' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000011' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000012' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000013' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000014' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000015' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000016' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000017' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000018' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000019' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000020' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000021' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000022' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000023' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000024' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000025' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000026' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000027' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000028' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000029' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000030' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000031' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000032' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000033' UNION ALL
  SELECT '00000000-0000-0000-0000-000000000034'
) u
JOIN roles r ON r.code = 'member'
ON DUPLICATE KEY UPDATE role_id = role_id;

INSERT INTO `posts` (`id`,`board_id`,`author_id`,`title`,`excerpt`,`content`,`tags`,`status`,`reply_count`,`view_count`,`like_count`,`collect_count`,`created_at`,`updated_at`) VALUES
  (2001,1,'00000000-0000-0000-0000-000000000005','课程大作业组员总是拖到最后一天，怎么推进比较有效？','组里两位同学经常临交前才回复，想问大家怎么安排里程碑和分工。','我们课程大作业是 4 人组，现在进度经常卡在沟通上。有没有同学分享一下你们怎么做每周分工、怎么催进度不伤和气？',JSON_ARRAY('小组作业','沟通','项目管理'),'featured',0,286,0,0,'2026-05-26 19:20:00','2026-05-27 22:58:00'),
  (2002,10,'00000000-0000-0000-0000-000000000022','毕设选题没有方向，想做 AI 相关但怕做不完怎么办？','老师让本周定题，我现在纠结做图像方向还是校园工具类应用。','我基础一般，怕选太难后期顶不住。有没有同学给个“能做完、又有亮点”的选题思路？',JSON_ARRAY('毕设','选题','AI'),'featured',0,251,0,0,'2026-05-26 21:10:00','2026-05-27 22:54:00'),
  (2003,8,'00000000-0000-0000-0000-000000000016','Next.js 登录状态在刷新后偶发丢失，大家怎么排查？','本地开发时刷新偶尔掉登录，怀疑是 cookie 配置和中间件路径问题。','我现在是 Session + HttpOnly Cookie，接口能拿到用户，但刷新页面偶发未登录。想问下大家排查顺序和常见坑。',JSON_ARRAY('Next.js','登录','Cookie'),'pinned',0,238,0,0,'2026-05-26 22:00:00','2026-05-27 22:50:00'),
  (2004,1,'00000000-0000-0000-0000-000000000015','班级展示汇报总超时，怎么把 20 分钟讲清楚？','每次都讲到后面来不及，想请教怎么控制节奏和内容取舍。','我们组做软件工程汇报，内容很多，老师只给 20 分钟。有没有模板可以兼顾背景、方案、演示和总结？',JSON_ARRAY('汇报','时间管理','课堂'),'normal',0,142,0,0,'2026-05-25 15:00:00','2026-05-27 21:32:00'),
  (2041,1,'00000000-0000-0000-0000-000000000006','班委换届想竞选学习委员，第一次上台怎么准备？','平时不太敢在很多人面前说话，想把竞选发言练得更自然。','想问下有竞选经验的同学，发言控制在几分钟比较合适？内容是偏“我做过什么”还是“我准备怎么做”更好？',JSON_ARRAY('班委','竞选','表达'),'normal',0,119,0,0,'2026-05-24 14:30:00','2026-05-27 21:05:00'),
  (2005,2,'00000000-0000-0000-0000-000000000021','羽毛球新手想买第一支拍，预算 300 左右怎么选？','每周打两次，主要双打，力量一般，怕买太硬的手腕受不了。','想问下有经验的同学，300 左右拍子怎么挑？需要先拉线吗，磅数建议多少？',JSON_ARRAY('羽毛球','运动','装备'),'normal',0,126,0,0,'2026-05-24 19:30:00','2026-05-27 20:40:00'),
  (2006,2,'00000000-0000-0000-0000-000000000030','摄影社活动想入门，人像和风景镜头先买哪个？','现在只有套机头，预算不多，想一步一步升级。','平时会拍同学和校园夜景，想问先买定焦还是长焦更实用？二手镜头要注意什么？',JSON_ARRAY('摄影','社团','器材'),'normal',0,118,0,0,'2026-05-24 20:20:00','2026-05-27 20:10:00'),
  (2007,2,'00000000-0000-0000-0000-000000000029','想学吉他但手指疼，大家前两周怎么坚持下来的？','每天练 20 分钟就开始疼，和弦按不实，总想放弃。','有没有新手练习顺序推荐？比如先爬格子还是先练简单弹唱，多久会好一些？',JSON_ARRAY('吉他','新手','坚持'),'normal',0,97,0,0,'2026-05-23 21:10:00','2026-05-27 19:45:00'),
  (2008,2,'00000000-0000-0000-0000-000000000024','夜跑想找搭子，学校北门那条路晚上安全吗？','一个人跑总觉得不太放心，想找固定时间的同学一起。','我一般 9 点后跑 4-5 公里，有没有同学也在这个时间段？顺便问下哪段路灯更亮。',JSON_ARRAY('夜跑','校园生活','搭子'),'normal',0,109,0,0,'2026-05-22 18:50:00','2026-05-27 18:32:00'),
  (2009,3,'00000000-0000-0000-0000-000000000018','图书馆抢位失败后你们都去哪儿学习？','最近图书馆一位难求，想找几个相对安静的备选地点。','期末周快到了，图书馆经常满座。大家还有哪些安静且有插座的学习点推荐？',JSON_ARRAY('图书馆','学习地点','期末'),'normal',0,138,0,0,'2026-05-25 09:20:00','2026-05-27 17:56:00'),
  (2010,3,'00000000-0000-0000-0000-000000000011','宿舍临时停电两个小时，大家会怎么安排这段时间？','昨晚停电后才发现手机和电脑都没电，计划全乱了。','有没有同学平时会准备应急方案，比如共享充电、离线资料、或者停电时适合做的学习任务？',JSON_ARRAY('宿舍','应急','效率'),'normal',0,91,0,0,'2026-05-24 22:40:00','2026-05-27 17:10:00'),
  (2011,3,'00000000-0000-0000-0000-000000000033','外卖送错楼层但最后找回来了，想问怎么备注最清楚？','最近两次都送错，骑手也挺着急，想减少沟通成本。','大家平时会怎么写地址备注？比如楼栋入口、宿舍门禁、联系电话格式，哪些最有用？',JSON_ARRAY('校园趣事','外卖','沟通'),'normal',0,84,0,0,'2026-05-23 12:30:00','2026-05-27 16:35:00'),
  (2012,4,'00000000-0000-0000-0000-000000000031','想固定周末五排上分，有没有主打晚上在线的同学？','我们宿舍三个人，缺打野和辅助，段位在星耀上下。','希望找心态稳定、能语音沟通的同学，输赢都行别吵架。有没有感兴趣的可以回帖。',JSON_ARRAY('游戏','组队','王者'),'normal',0,166,0,0,'2026-05-26 14:20:00','2026-05-27 16:12:00'),
  (2013,4,'00000000-0000-0000-0000-000000000014','原神新版本深渊总差一星，平民配队怎么调？','角色池不深，命座低，练度一般，卡在 11-3。','想问下平民玩家有没有稳定一点的配队思路，圣遗物优先刷哪套收益高？',JSON_ARRAY('原神','配队','深渊'),'normal',0,173,0,0,'2026-05-25 20:50:00','2026-05-27 15:48:00'),
  (2014,4,'00000000-0000-0000-0000-000000000026','RTX3050 笔记本跑 3A 游戏，画质和帧率怎么平衡？','想在宿舍玩地平线和赛博朋克，不知道该锁多少帧比较稳。','我现在 16G 内存，1080p 屏幕。有没有类似配置的同学分享一下你们的画质预设？',JSON_ARRAY('硬件','3A','帧率'),'normal',0,157,0,0,'2026-05-25 23:00:00','2026-05-27 15:05:00'),
  (2015,4,'00000000-0000-0000-0000-000000000028','Steam 家庭共享会影响彼此存档吗？','和室友互相共享库，担心存档冲突或被覆盖。','主要是一些单机游戏，想确认家庭共享下不同账号的云存档是否完全隔离。',JSON_ARRAY('Steam','共享','存档'),'normal',0,88,0,0,'2026-05-24 10:10:00','2026-05-27 14:32:00'),
  (2016,5,'00000000-0000-0000-0000-000000000006','想给同班女生送生日礼物，预算 150 左右求建议','平时交流还不错，不想太暧昧也不想太敷衍。','目前想到的是手账礼盒或者小香薰，怕踩雷。大家有没有更稳妥的选择？',JSON_ARRAY('告白墙','礼物','人际'),'normal',0,145,0,0,'2026-05-26 11:40:00','2026-05-27 14:00:00'),
  (2017,5,'00000000-0000-0000-0000-000000000027','失恋后一直睡不着，怎么把状态拉回来？','已经一周了，白天上课也提不起劲，想听听大家怎么走出来的。','知道需要时间，但想先把作息和学习节奏恢复。有没有实操一点的方法？',JSON_ARRAY('情绪','作息','调整'),'normal',0,133,0,0,'2026-05-25 09:10:00','2026-05-27 13:28:00'),
  (2018,5,'00000000-0000-0000-0000-000000000034','喜欢的人在准备考研，现在还适合频繁聊天吗？','怕打扰她复习，但也怕不联系就更远了。','想拿捏一下分寸：多久联系一次比较合适，什么话题不会造成压力？',JSON_ARRAY('关系','考研','沟通'),'normal',0,121,0,0,'2026-05-24 21:20:00','2026-05-27 12:50:00'),
  (2019,6,'00000000-0000-0000-0000-000000000013','周末家教兼职怎么找比较靠谱，如何避免中介坑？','看到很多群里发单，不知道哪些是真实需求。','第一次找家教兼职，担心被压价或拖欠。想问下大家一般通过什么渠道更稳。',JSON_ARRAY('兼职','家教','避坑'),'normal',0,176,0,0,'2026-05-26 16:00:00','2026-05-27 12:20:00'),
  (2020,6,'00000000-0000-0000-0000-000000000020','奶茶店晚班兼职会不会影响第二天上课状态？','排课比较满，怕晚上下班太晚第二天听课效率低。','做过餐饮兼职的同学能分享一下真实强度吗？一周做几天比较合适？',JSON_ARRAY('兼职','时间管理','校园生活'),'normal',0,154,0,0,'2026-05-25 17:50:00','2026-05-27 11:45:00'),
  (2021,6,'00000000-0000-0000-0000-000000000025','投实习时项目经历写课程作业会不会太弱？','我没有大厂实习经历，主要是课程项目和社团技术项目。','想问简历里课程项目怎么写得更像“真实业务问题”，避免看起来只是作业。',JSON_ARRAY('实习','简历','项目经历'),'normal',0,208,0,0,'2026-05-24 15:30:00','2026-05-27 11:10:00'),
  (2022,7,'00000000-0000-0000-0000-000000000003','有没有好用的数据结构可视化网站，适合期末突击？','图和动画比只看文字更好理解，想找几个口碑好的资源。','重点是链表、树、图和排序算法，希望有中文讲解或者操作演示。',JSON_ARRAY('资源','数据结构','复习'),'normal',0,193,0,0,'2026-05-26 09:00:00','2026-05-27 10:48:00'),
  (2023,7,'00000000-0000-0000-0000-000000000018','英语六级听力材料哪里下比较全，最好有分题型？','做真题时想按题型专项练，找不到整理好的合集。','我主要弱在长对话和讲座题，想问有没有同学分享过网盘或网站目录。',JSON_ARRAY('六级','听力','资源'),'normal',0,162,0,0,'2026-05-25 19:40:00','2026-05-27 10:05:00'),
  (2024,7,'00000000-0000-0000-0000-000000000032','软件工程课程答辩 PPT 有没有简洁一点的模板？','之前的模板太花，老师说重点不突出，想换成信息密度高的版本。','希望包含需求分析、架构设计、测试结果这几页，有同学愿意分享自己的模板吗？',JSON_ARRAY('软件工程','答辩','PPT'),'normal',0,144,0,0,'2026-05-24 18:45:00','2026-05-27 09:42:00'),
  (2025,7,'00000000-0000-0000-0000-000000000001','数学建模优秀论文从哪里看最有参考价值？','准备暑假打比赛，想先看获奖论文学习思路和写法。','除了官方论文集，大家还有推荐的渠道吗？我更想看“问题建模过程”写得清楚的版本。',JSON_ARRAY('数学建模','竞赛','论文'),'normal',0,171,0,0,'2026-05-24 09:30:00','2026-05-27 09:05:00'),
  (2026,8,'00000000-0000-0000-0000-000000000010','MySQL 联合索引总是没命中，explain 看着一头雾水','表里数据量上来后查询明显慢了，想搞清楚索引失效的具体原因。','where 条件里有范围查询和排序，我不确定是否破坏了最左前缀。有没有同学能帮我看排查步骤？',JSON_ARRAY('MySQL','索引','性能'),'normal',0,214,0,0,'2026-05-26 13:10:00','2026-05-27 08:40:00'),
  (2027,8,'00000000-0000-0000-0000-000000000008','Java 课程设计三层架构怎么拆，service 层职责总混乱','做着做着 controller 写了很多业务逻辑，代码越来越难维护。','想请教下你们课程设计时 controller/service/dao 各自边界怎么划分，便于答辩讲清楚。',JSON_ARRAY('Java','架构','课程设计'),'normal',0,168,0,0,'2026-05-25 16:20:00','2026-05-27 08:05:00'),
  (2028,8,'00000000-0000-0000-0000-000000000023','前端项目里状态管理选 Zustand 还是 Redux Toolkit？','项目中等规模，页面多，担心后面维护成本越来越高。','想听听大家在课程项目里的实际体验：哪种方案更快上手、调试更顺？',JSON_ARRAY('前端','状态管理','工程化'),'normal',0,149,0,0,'2026-05-24 20:00:00','2026-05-27 07:40:00'),
  (2029,9,'00000000-0000-0000-0000-000000000019','大三突然开始焦虑就业，应该先补技术还是先投简历？','看到同学都在实习，自己有点慌，怕两头都顾不好。','如果每天只有 3 小时可支配时间，你们会怎么分配在刷题、项目和投递之间？',JSON_ARRAY('就业','焦虑','规划'),'normal',0,187,0,0,'2026-05-26 08:15:00','2026-05-27 07:05:00'),
  (2030,9,'00000000-0000-0000-0000-000000000011','宿舍作息完全不同，晚上总被吵醒怎么沟通比较有效？','已经沟通过几次，短期有效，过几天又回到老样子。','想找一个不撕破脸的方法，把规则定下来并且能长期执行。有没有实操经验？',JSON_ARRAY('宿舍','作息','沟通'),'normal',0,143,0,0,'2026-05-25 12:10:00','2026-05-27 06:28:00'),
  (2031,9,'00000000-0000-0000-0000-000000000006','每天学到一半就刷手机，怎么把注意力拉回来？','番茄钟试过几次没坚持下来，想找更适合大学生的办法。','尤其是晚上自习时最容易分心。大家有没有可执行的环境布置和习惯设置建议？',JSON_ARRAY('学习方法','专注力','时间管理'),'normal',0,136,0,0,'2026-05-24 22:20:00','2026-05-27 05:54:00'),
  (2032,10,'00000000-0000-0000-0000-000000000026','保研夏令营套磁邮件怎么写，第一封要不要附简历？','第一次给老师写邮件，担心内容太模板化被忽略。','想知道邮件结构怎么写更合适：自我介绍、研究兴趣、成绩和项目该怎么排序？',JSON_ARRAY('保研','套磁','邮件'),'pinned',0,224,0,0,'2026-05-25 10:30:00','2026-05-27 05:20:00'),
  (2033,10,'00000000-0000-0000-0000-000000000017','编译原理看不懂语法分析，大家是怎么入门的？','老师讲得快，课后看书又觉得抽象，作业卡了好几天。','有没有同学推荐更直观的学习路径，比如先看视频再做哪类题？',JSON_ARRAY('编译原理','课程','求助'),'normal',0,129,0,0,'2026-05-24 17:40:00','2026-05-27 04:42:00'),
  (2034,10,'00000000-0000-0000-0000-000000000012','选课系统显示冲突但教务说可申请，流程具体怎么走？','两门课时间只重叠 20 分钟，老师同意了但系统提交失败。','想问有没有同学办过类似冲突申请，需不需要纸质签字，多久能审批下来？',JSON_ARRAY('选课','教务','流程'),'normal',0,112,0,0,'2026-05-23 15:30:00','2026-05-27 04:05:00'),
  (2035,11,'00000000-0000-0000-0000-000000000004','在一食堂捡到校园卡（软件学院 23 级），失主请联系','卡已交给一食堂服务台，也在这里发帖同步一下。','卡面姓名首字母是 L，同学如果看到请尽快去服务台认领，避免影响门禁和借书。',JSON_ARRAY('失物招领','校园卡'),'normal',0,104,0,0,'2026-05-26 12:20:00','2026-05-27 03:36:00'),
  (2036,11,'00000000-0000-0000-0000-000000000021','图书馆三楼靠窗位置有个黑色保温杯，像是遗落的','杯子外有贴纸，暂放在三楼服务台。','失主看到后可以私信我描述一下贴纸图案，我会帮忙确认是不是你的。',JSON_ARRAY('失物招领','图书馆','保温杯'),'normal',0,96,0,0,'2026-05-25 13:25:00','2026-05-27 03:02:00'),
  (2037,11,'00000000-0000-0000-0000-000000000024','体育馆疑似丢了蓝牙耳机，充电仓是透明壳','昨晚打球后发现不见了，沿路找了一圈没找到。','如果有人捡到可以留言，我可提供耳机壳划痕位置和蓝牙名称核对。谢谢大家。',JSON_ARRAY('寻物启事','耳机','体育馆'),'normal',0,121,0,0,'2026-05-24 11:50:00','2026-05-27 02:25:00'),
  (2038,12,'00000000-0000-0000-0000-000000000030','今天食堂新出的咖喱鸡饭大家觉得怎么样？','我觉得味道还可以但有点咸，想看看大家评价。','顺便问问有没有更推荐的窗口，最近想尝试一些性价比高的套餐。',JSON_ARRAY('闲聊','食堂','推荐'),'normal',0,117,0,0,'2026-05-26 18:10:00','2026-05-27 01:58:00'),
  (2039,12,'00000000-0000-0000-0000-000000000007','期末周作息接龙：你们一般几点睡几点起？','最近作息有点乱，想参考下大家的节奏。','希望能找到“既不熬太晚又能保证复习效率”的作息安排，欢迎晒时间表。',JSON_ARRAY('期末周','作息','交流'),'normal',0,131,0,0,'2026-05-25 23:20:00','2026-05-27 01:20:00'),
  (2040,12,'00000000-0000-0000-0000-000000000009','周末校内有什么活动适合放松一下？','复习压力有点大，想在周末抽半天换换脑子。','有音乐会、展览、讲座或者社团开放日都可以，想要轻松一点的活动。',JSON_ARRAY('周末','活动','放松'),'normal',0,108,0,0,'2026-05-24 16:00:00','2026-05-27 00:42:00')
ON DUPLICATE KEY UPDATE
  `title`=VALUES(`title`),`excerpt`=VALUES(`excerpt`),`content`=VALUES(`content`),`tags`=VALUES(`tags`),
  `status`=VALUES(`status`),`view_count`=VALUES(`view_count`),`updated_at`=VALUES(`updated_at`);

-- 随机回复：有的帖子无回复，有的帖子 1-4 条
INSERT INTO `post_replies` (`post_id`,`author_id`,`content`,`seat`,`is_visible`,`created_at`) VALUES
  (2001,'00000000-0000-0000-0000-000000000002','我们组是每周固定一次 15 分钟站会，任务拆成可验收的小块，拖延会明显减少。',1,1,'2026-05-27 09:12:00'),
  (2001,'00000000-0000-0000-0000-000000000016','可以把交付物写到共享文档里，谁没交就一眼看出来，催起来也更客观。',2,1,'2026-05-27 11:23:00'),
  (2002,'00000000-0000-0000-0000-000000000026','第一封邮件建议附简历和成绩单截图，正文控制在 300 字以内。',1,1,'2026-05-27 08:52:00'),
  (2002,'00000000-0000-0000-0000-000000000003','我去年是先写研究兴趣，再写项目亮点，最后再表达希望交流。回复率会高一些。',2,1,'2026-05-27 09:18:00'),
  (2002,'00000000-0000-0000-0000-000000000022','感谢！我今晚先按你们说的改一版模板试试。',3,1,'2026-05-27 10:05:00'),
  (2003,'00000000-0000-0000-0000-000000000001','先查 cookie 的 Path 和 SameSite，再查中间件 matcher 是否覆盖到目标路由。',1,1,'2026-05-27 09:40:00'),
  (2003,'00000000-0000-0000-0000-000000000010','我之前也是这个问题，最后是部署域名和本地域名不一致导致。',2,1,'2026-05-27 10:20:00'),
  (2004,'00000000-0000-0000-0000-000000000015','我们通常 1 分钟背景、8 分钟方案、6 分钟演示、3 分钟测试、2 分钟总结。',1,1,'2026-05-27 08:15:00'),
  (2005,'00000000-0000-0000-0000-000000000021','新手建议先选 4U 左右偏轻的拍子，拉线 24 磅比较友好。',1,1,'2026-05-27 08:25:00'),
  (2006,'00000000-0000-0000-0000-000000000030','先用套机头拍够 3 个月再决定，很多人一开始其实更需要构图练习。',1,1,'2026-05-27 07:55:00'),
  (2007,'00000000-0000-0000-0000-000000000024','我那会每天 15 分钟爬格子 + 15 分钟和弦转换，一周后就好很多。',1,1,'2026-05-27 07:48:00'),
  (2008,'00000000-0000-0000-0000-000000000014','北门到操场那段路灯最稳定，建议两人以上结伴。',1,1,'2026-05-27 07:12:00'),
  (2009,'00000000-0000-0000-0000-000000000013','教学楼 A 区晚上挺安静，插座也够，缺点是空调有点冷。',1,1,'2026-05-27 06:58:00'),
  (2010,'00000000-0000-0000-0000-000000000011','可以提前下载离线资料，停电时看纸质笔记或背单词，效率不会太差。',1,1,'2026-05-27 06:20:00'),
  (2012,'00000000-0000-0000-0000-000000000031','我们一般周五和周六 9 点后打，心态优先，吵架直接散队。',1,1,'2026-05-27 06:12:00'),
  (2012,'00000000-0000-0000-0000-000000000028','我主玩辅助可以补位，段位王者 12 星左右。',2,1,'2026-05-27 06:31:00'),
  (2013,'00000000-0000-0000-0000-000000000034','先别追极限词条，保证主词条正确 + 循环顺就能稳一点。',1,1,'2026-05-27 05:40:00'),
  (2014,'00000000-0000-0000-0000-000000000031','3050 可以先锁 60 帧，中高画质起步，再按温度和掉帧微调。',1,1,'2026-05-27 05:22:00'),
  (2016,'00000000-0000-0000-0000-000000000006','手账礼盒比较稳，颜色别太花，附一张手写卡片会加分。',1,1,'2026-05-27 05:10:00'),
  (2017,'00000000-0000-0000-0000-000000000027','先把睡前刷短视频停掉，固定 30 分钟散步，真的有帮助。',1,1,'2026-05-27 04:35:00'),
  (2018,'00000000-0000-0000-0000-000000000004','我当时是一周联系一次，主要分享日常，不聊情绪压力话题。',1,1,'2026-05-27 04:22:00'),
  (2019,'00000000-0000-0000-0000-000000000013','优先看学院官方群和学长学姐转介绍，陌生中介单要先确认结算方式。',1,1,'2026-05-27 04:05:00'),
  (2021,'00000000-0000-0000-0000-000000000025','课程项目可以强调“你解决了什么问题、用了什么指标验证”。',1,1,'2026-05-27 03:52:00'),
  (2022,'00000000-0000-0000-0000-000000000003','VisuAlgo 和 CS-Visualizer 都不错，先看动画再写代码会快很多。',1,1,'2026-05-27 03:36:00'),
  (2022,'00000000-0000-0000-0000-000000000018','我这边有整理过链接，晚点私信你。',2,1,'2026-05-27 03:40:00'),
  (2023,'00000000-0000-0000-0000-000000000029','听力我建议先做真题再分题型精听，别一上来就刷模拟题。',1,1,'2026-05-27 03:28:00'),
  (2024,'00000000-0000-0000-0000-000000000032','我有一个极简蓝灰模板，晚点发你云盘链接。',1,1,'2026-05-27 03:05:00'),
  (2025,'00000000-0000-0000-0000-000000000001','优先看国赛一等奖论文，重点学“问题假设与验证过程”的写法。',1,1,'2026-05-27 02:40:00'),
  (2026,'00000000-0000-0000-0000-000000000016','先把 where 条件按选择性排序，再看是否出现函数导致索引失效。',1,1,'2026-05-27 02:18:00'),
  (2026,'00000000-0000-0000-0000-000000000010','可以贴一下 explain 结果，看看是不是回表太多。',2,1,'2026-05-27 02:24:00'),
  (2027,'00000000-0000-0000-0000-000000000008','controller 只做参数校验，service 才放业务编排，这样后面好测。',1,1,'2026-05-27 02:05:00'),
  (2028,'00000000-0000-0000-0000-000000000023','课程项目我更推荐 Zustand，样板代码少，上手快。',1,1,'2026-05-27 01:52:00'),
  (2029,'00000000-0000-0000-0000-000000000019','先补技术再投会更稳，我当时是 6:3:1 分配给项目、刷题和投递。',1,1,'2026-05-27 01:35:00'),
  (2030,'00000000-0000-0000-0000-000000000002','可以开一次宿舍会议，把最晚熄灯和耳机规则写成共识，效果更持久。',1,1,'2026-05-27 01:26:00'),
  (2031,'00000000-0000-0000-0000-000000000006','我会把手机放到看不见的地方，再把待办写在纸上，注意力会好很多。',1,1,'2026-05-27 01:10:00'),
  (2032,'00000000-0000-0000-0000-000000000026','第一封邮件标题建议包含学校+年级+研究方向，老师更容易定位。',1,1,'2026-05-27 00:55:00'),
  (2033,'00000000-0000-0000-0000-000000000017','先把 LL(1) 的过程手推几遍，再看代码实现，理解会顺很多。',1,1,'2026-05-27 00:40:00'),
  (2034,'00000000-0000-0000-0000-000000000012','我们是先线上申请，再拿纸质审批表去教务盖章。',1,1,'2026-05-27 00:28:00'),
  (2035,'00000000-0000-0000-0000-000000000004','已和失主联系上，感谢大家帮顶。',1,1,'2026-05-27 00:10:00'),
  (2036,'00000000-0000-0000-0000-000000000021','补充一下：杯子是磨砂黑，盖子有一点掉漆。',1,1,'2026-05-26 23:52:00'),
  (2037,'00000000-0000-0000-0000-000000000024','找到了，在体育馆前台，谢谢大家。',1,1,'2026-05-26 23:36:00'),
  (2038,'00000000-0000-0000-0000-000000000030','我觉得 2 号窗口更稳，分量也更足。',1,1,'2026-05-26 23:25:00'),
  (2039,'00000000-0000-0000-0000-000000000007','我现在是 00:30 睡、07:30 起，下午会补 20 分钟午休。',1,1,'2026-05-26 23:08:00'),
  (2040,'00000000-0000-0000-0000-000000000009','周六晚上的草地音乐会还不错，时间短也不累。',1,1,'2026-05-26 22:54:00');

-- 点赞与收藏明细（用于生成真实计数）
INSERT INTO `post_reactions` (`post_id`,`user_id`,`reaction`,`created_at`) VALUES
  (2001,'00000000-0000-0000-0000-000000000001','like','2026-05-27 12:10:00'),
  (2001,'00000000-0000-0000-0000-000000000003','like','2026-05-27 12:16:00'),
  (2001,'00000000-0000-0000-0000-000000000009','like','2026-05-27 12:19:00'),
  (2001,'00000000-0000-0000-0000-000000000016','like','2026-05-27 12:21:00'),
  (2001,'00000000-0000-0000-0000-000000000022','like','2026-05-27 12:26:00'),
  (2002,'00000000-0000-0000-0000-000000000002','like','2026-05-27 11:50:00'),
  (2002,'00000000-0000-0000-0000-000000000004','like','2026-05-27 11:55:00'),
  (2002,'00000000-0000-0000-0000-000000000013','like','2026-05-27 11:58:00'),
  (2002,'00000000-0000-0000-0000-000000000019','like','2026-05-27 12:01:00'),
  (2003,'00000000-0000-0000-0000-000000000001','like','2026-05-27 11:12:00'),
  (2003,'00000000-0000-0000-0000-000000000010','like','2026-05-27 11:20:00'),
  (2003,'00000000-0000-0000-0000-000000000023','like','2026-05-27 11:22:00'),
  (2003,'00000000-0000-0000-0000-000000000031','like','2026-05-27 11:29:00'),
  (2012,'00000000-0000-0000-0000-000000000028','like','2026-05-27 10:30:00'),
  (2012,'00000000-0000-0000-0000-000000000031','like','2026-05-27 10:33:00'),
  (2013,'00000000-0000-0000-0000-000000000034','like','2026-05-27 10:10:00'),
  (2014,'00000000-0000-0000-0000-000000000026','like','2026-05-27 10:15:00'),
  (2019,'00000000-0000-0000-0000-000000000013','like','2026-05-27 09:50:00'),
  (2021,'00000000-0000-0000-0000-000000000025','like','2026-05-27 09:45:00'),
  (2022,'00000000-0000-0000-0000-000000000003','like','2026-05-27 09:20:00'),
  (2022,'00000000-0000-0000-0000-000000000018','like','2026-05-27 09:22:00'),
  (2023,'00000000-0000-0000-0000-000000000029','like','2026-05-27 09:10:00'),
  (2024,'00000000-0000-0000-0000-000000000032','like','2026-05-27 09:04:00'),
  (2025,'00000000-0000-0000-0000-000000000001','like','2026-05-27 08:50:00'),
  (2026,'00000000-0000-0000-0000-000000000016','like','2026-05-27 08:35:00'),
  (2026,'00000000-0000-0000-0000-000000000010','like','2026-05-27 08:37:00'),
  (2027,'00000000-0000-0000-0000-000000000008','like','2026-05-27 08:02:00'),
  (2029,'00000000-0000-0000-0000-000000000019','like','2026-05-27 07:02:00'),
  (2030,'00000000-0000-0000-0000-000000000002','like','2026-05-27 06:25:00'),
  (2032,'00000000-0000-0000-0000-000000000026','like','2026-05-27 05:15:00'),
  (2032,'00000000-0000-0000-0000-000000000022','like','2026-05-27 05:16:00'),
  (2032,'00000000-0000-0000-0000-000000000003','like','2026-05-27 05:18:00'),
  (2032,'00000000-0000-0000-0000-000000000013','like','2026-05-27 05:19:00'),
  (2035,'00000000-0000-0000-0000-000000000004','like','2026-05-27 03:30:00'),
  (2037,'00000000-0000-0000-0000-000000000024','like','2026-05-27 02:20:00'),
  (2038,'00000000-0000-0000-0000-000000000030','like','2026-05-27 01:48:00'),
  (2039,'00000000-0000-0000-0000-000000000007','like','2026-05-27 01:15:00'),
  (2040,'00000000-0000-0000-0000-000000000009','like','2026-05-27 00:35:00');

INSERT INTO `bookmarks` (`user_id`,`post_id`,`created_at`) VALUES
  ('00000000-0000-0000-0000-000000000003',2001,'2026-05-27 12:40:00'),
  ('00000000-0000-0000-0000-000000000010',2001,'2026-05-27 12:45:00'),
  ('00000000-0000-0000-0000-000000000022',2002,'2026-05-27 12:12:00'),
  ('00000000-0000-0000-0000-000000000016',2003,'2026-05-27 11:40:00'),
  ('00000000-0000-0000-0000-000000000031',2014,'2026-05-27 10:25:00'),
  ('00000000-0000-0000-0000-000000000013',2019,'2026-05-27 10:08:00'),
  ('00000000-0000-0000-0000-000000000025',2021,'2026-05-27 09:56:00'),
  ('00000000-0000-0000-0000-000000000003',2022,'2026-05-27 09:42:00'),
  ('00000000-0000-0000-0000-000000000001',2025,'2026-05-27 09:10:00'),
  ('00000000-0000-0000-0000-000000000026',2032,'2026-05-27 05:24:00'),
  ('00000000-0000-0000-0000-000000000022',2032,'2026-05-27 05:26:00'),
  ('00000000-0000-0000-0000-000000000007',2039,'2026-05-27 01:32:00');

UPDATE `posts` p
LEFT JOIN (
  SELECT post_id, COUNT(*) AS c
  FROM post_replies
  WHERE is_visible = 1
  GROUP BY post_id
) r ON r.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS c
  FROM post_reactions
  WHERE reaction = 'like'
  GROUP BY post_id
) l ON l.post_id = p.id
LEFT JOIN (
  SELECT post_id, COUNT(*) AS c
  FROM bookmarks
  GROUP BY post_id
) b ON b.post_id = p.id
SET
  p.reply_count = COALESCE(r.c, 0),
  p.like_count = COALESCE(l.c, 0),
  p.collect_count = COALESCE(b.c, 0)
WHERE p.id BETWEEN 2001 AND 2041;

UPDATE `boards` b
LEFT JOIN (
  SELECT
    board_id,
    COUNT(*) AS post_count,
    SUM(CASE WHEN DATE(created_at) = CURRENT_DATE() THEN 1 ELSE 0 END) AS today_count
  FROM posts
  GROUP BY board_id
) s ON s.board_id = b.id
SET
  b.post_count = COALESCE(s.post_count, 0),
  b.today_count = COALESCE(s.today_count, 0);

-- 固定热门帖排序，确保首页按 updated_at DESC 时优先显示
UPDATE `posts` SET `updated_at` = '2026-05-27 23:58:00' WHERE `id` = 2001;
UPDATE `posts` SET `updated_at` = '2026-05-27 23:57:00' WHERE `id` = 2002;
UPDATE `posts` SET `updated_at` = '2026-05-27 23:56:00' WHERE `id` = 2003;

INSERT INTO `private_messages` (`sender_id`,`receiver_id`,`content`,`is_read`,`created_at`) VALUES
  ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','xzr，首页数据我看过了，点赞数现在真实多了。',1,'2026-05-27 10:20:00'),
  ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','好，我再把帖子内容按板块补得自然一点。',1,'2026-05-27 10:24:00')
ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);

SET FOREIGN_KEY_CHECKS = 1;
