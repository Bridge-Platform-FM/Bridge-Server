INSERT INTO public.sub_role_master (sub_role_name, sub_role_code, company_role_id, created_by, created_at, updated_at, is_deleted) VALUES
    ('User Admin', 'USER_ADMIN', (SELECT id FROM public.company_role_master WHERE role_code = 'STARTUP'), '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('User Admin', 'USER_ADMIN', (SELECT id FROM public.company_role_master WHERE role_code = 'INVESTOR'), '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('User Admin', 'USER_ADMIN', (SELECT id FROM public.company_role_master WHERE role_code = 'B2B'), '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);
