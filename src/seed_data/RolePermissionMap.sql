INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(1, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'AUTH.VERIFY_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(2, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'AUTH.RESEND_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(3, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'AUTH.MFA_TRIGGER_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(4, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'AUTH.MFA_VERIFY_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(5, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'AUTH.MFA_RESEND_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(6, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'USER.BUILD_PROFILE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(7, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'USER.VIEW_PROFILE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(8, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'USER.UPDATE_PROFILE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(9, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'USER.SEARCH'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(10, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'USER.VIEW_ROLE_DETAILS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(11, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FILE.SCAN_IMAGE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(12, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FILE.SCAN_DOCUMENT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(13, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FILE.SAVE_KYC_INFO'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(14, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FILE.PREVIEW'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(15, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FILE.GET_KYC_DOCS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(16, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MATCHING.VIEW_PROFILES'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(17, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CONNECTION.SEND_REQUEST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(18, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CONNECTION.CHANGE_STATUS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(19, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CONNECTION.VIEW_SENT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(20, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CONNECTION.VIEW_RECEIVED'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(21, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.VIEW_ACTIVE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(22, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.VIEW_LIMIT_STATUS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(23, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.LOGOUT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(24, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.LOGOUT_ALL'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(25, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.REVOKE_SELECTED'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(26, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.REVOKE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(27, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MEETING.CREATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(28, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MEETING.VIEW_UPCOMING'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(29, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MEETING.VIEW_DETAIL'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(30, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MEETING.VIEW_LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(31, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'MEETING.UPDATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(32, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CHAT.VIEW_MESSAGES'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(33, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CHAT.MARK_READ'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(34, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CHAT.UPLOAD_MEDIA'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(35, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CHAT.VIEW_SHARED_FILES'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(36, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'CHAT.VIEW_MEDIA'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(37, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'FAQ.VIEW'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(38, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.VIEW_LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(39, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.CLOSE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(40, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.ARCHIVE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(41, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.UNARCHIVE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(42, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.VIEW_PENDING_STAGE_REQUEST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(43, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM.EXPORT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(44, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_TERM_SHEET.VIEW_CURRENT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(45, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_TERM_SHEET.VIEW_HISTORY'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(46, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_OFFER.VIEW_THREAD'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(47, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_OFFER.VIEW_ALL'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(48, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_OFFER.VIEW_CURRENT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(49, 'USER', (SELECT id FROM permission_master WHERE permission_key = 'DEAL_ROOM_OFFER.VIEW_DRAFT'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(50, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_TRIGGER_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(51, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_TRIGGER_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(52, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_VERIFY_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(53, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_VERIFY_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(54, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_RESEND_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(55, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_AUTH.MFA_RESEND_OTP'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(56, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER.LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(57, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER.LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(58, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER.VIEW_KYC_DOCS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(59, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER.VIEW_KYC_DOCS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(60, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_KYC.DOCUMENT_ACTION'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(61, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_KYC.DOCUMENT_ACTION'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(62, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_KYC.REVIEW_ACTION'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(63, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_KYC.REVIEW_ACTION'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(64, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER_LIMIT.VIEW'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(65, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER_LIMIT.VIEW'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(66, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER_LIMIT.UPDATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(67, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_USER_LIMIT.UPDATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(68, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(69, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.LIST'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(70, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.CREATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(71, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.CREATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(72, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.UPDATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(73, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'ADMIN_FAQ.UPDATE'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(74, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.LOGOUT'), '2026-07-27 15:07:25.398', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(75, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.VIEW_LIMIT_STATUS'), '2026-07-27 15:07:25.398', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(76, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.LOGOUT'), '2026-07-27 15:07:25.398', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(77, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'SESSION.VIEW_LIMIT_STATUS'), '2026-07-27 15:07:25.398', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(78, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'FILE.PREVIEW'), '2026-07-27 15:20:41.177', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(79, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'FILE.PREVIEW'), '2026-07-27 15:20:41.177', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(80, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'USER.SEARCH'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(81, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'USER.SEARCH'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(82, 'ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'USER.VIEW_ROLE_DETAILS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
INSERT INTO role_permission_map
(id, user_type, permission_id, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by)
VALUES(83, 'SUPER_ADMIN', (SELECT id FROM permission_master WHERE permission_key = 'USER.VIEW_ROLE_DETAILS'), '2026-07-27 14:10:40.426', 1, NULL, NULL, false, NULL, NULL);
