-- Grants every seeded permission to the roles that already have de facto
-- access today (ROLES.USER for non-admin modules, ROLES.ADMIN for ADMIN_
-- prefixed modules — see PERMISSIONS in src/utils/constant.js).

-- USER-scoped permissions -> STARTUP, INVESTOR, B2B
INSERT INTO public.role_permission_map (role_code, role_scope, permission_id, created_by, created_at)
SELECT roles.role_code, 'USER', pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
CROSS JOIN (VALUES ('STARTUP'), ('INVESTOR'), ('B2B')) AS roles(role_code)
WHERE pm.permission_key NOT LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false;

-- ADMIN-scoped permissions -> ADMIN, SUPER_ADMIN
INSERT INTO public.role_permission_map (role_code, role_scope, permission_id, created_by, created_at)
SELECT roles.role_code, 'ADMIN', pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
CROSS JOIN (VALUES ('ADMIN'), ('SUPER_ADMIN')) AS roles(role_code)
WHERE pm.permission_key LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false;
