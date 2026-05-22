INSERT INTO public.company_role_master
(role_name, role_code, role_description, created_by)
VALUES('Startup', 'STARTUP', 'Startup Role', (select id from "admin" a where a.email = 'admin@test.com'));
INSERT INTO public.company_role_master
(role_name, role_code, role_description, created_by)
VALUES('INVESTOR', 'INVESTOR', 'Investor Role', (select id from "admin" a where a.email = 'admin@test.com'));
INSERT INTO public.company_role_master
(role_name, role_code, role_description, created_by)
VALUES('B2B', 'B2B', 'B2B Role', (select id from "admin" a where a.email = 'admin@test.com'));