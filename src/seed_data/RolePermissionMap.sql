-- Grants every seeded permission to the roles that already have de facto
-- access today. Role codes are pulled from company_role_master (not
-- hardcoded) so this stays correct as roles are added/removed there;
-- ADMIN_ prefixed permission modules go to the ADMIN/SUPER_ADMIN roles,
-- every other module goes to the remaining (non-admin) roles.

-- USER-scoped permissions -> every non-admin role in company_role_master (STARTUP, INVESTOR, B2B)
INSERT INTO public.role_permission_map (role_code, role_scope, permission_id, created_by, created_at)
SELECT crm.role_code, 'USER', pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
CROSS JOIN public.company_role_master crm
WHERE pm.permission_key NOT LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false
  AND crm.is_deleted = false
  AND crm.role_code NOT IN ('ADMIN', 'SUPER_ADMIN');

-- ADMIN-scoped permissions -> the ADMIN/SUPER_ADMIN roles in company_role_master
INSERT INTO public.role_permission_map (role_code, role_scope, permission_id, created_by, created_at)
SELECT crm.role_code, 'ADMIN', pm.id, (select id from "admin" a where a.email = 'admin@test.com'), now()
FROM public.permission_master pm
CROSS JOIN public.company_role_master crm
WHERE pm.permission_key LIKE 'ADMIN\_%' ESCAPE '\'
  AND pm.is_deleted = false
  AND crm.is_deleted = false
  AND crm.role_code IN ('ADMIN', 'SUPER_ADMIN');
