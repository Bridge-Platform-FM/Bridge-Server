INSERT INTO public.admin_permission
(admin_id, permission_key, is_allowed, created_at, created_by)
VALUES((select id from admin where "role" = 'SUPER_ADMIN'), 'FAQ_MANAGEMENT', true, '2026-08-19 14:09:50.050', (select id from admin where "role" = 'SUPER_ADMIN'));
INSERT INTO public.admin_permission
(admin_id, permission_key, is_allowed, created_at, created_by)
VALUES((select id from admin where "role" = 'SUPER_ADMIN'), 'KYC_REVIEW', true, '2026-08-19 14:09:50.050', (select id from admin where "role" = 'SUPER_ADMIN'));
INSERT INTO public.admin_permission
(admin_id, permission_key, is_allowed, created_at, created_by)
VALUES((select id from admin where "role" = 'SUPER_ADMIN'), 'USER_MANAGEMENT', true, '2026-08-19 14:09:50.050', (select id from admin where "role" = 'SUPER_ADMIN'));