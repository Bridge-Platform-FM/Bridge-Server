-- Grants every seeded permission to the userType that has de facto access
-- today. userType (USER / ADMIN / SUPER_ADMIN — see USER_TYPES in
-- src/utils/constant.js) is a fixed, small app-level enum, not stored in
-- any roles table, so this uses literal VALUES rather than a join.
-- ADMIN_ prefixed permission modules go to ADMIN + SUPER_ADMIN (identical
-- grants for both); every other module goes to USER.

-- USER-scoped permissions -> the USER userType
INSERT INTO public.role_permission_map (user_type, permission_id, created_by, created_at)
SELECT 'USER', pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
WHERE pm.permission_key NOT LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false;

-- ADMIN-scoped permissions -> the ADMIN and SUPER_ADMIN userTypes
INSERT INTO public.role_permission_map (user_type, permission_id, created_by, created_at)
SELECT ut.user_type, pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
CROSS JOIN (VALUES ('ADMIN'), ('SUPER_ADMIN')) AS ut(user_type)
WHERE pm.permission_key LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false;
