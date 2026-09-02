-- Incremental seed for the profile columns added by
-- migrations/20260902000000_addMissingProfileFields.js.
--
-- `UserProfileFieldMaster.sql` is the full-install seed; running it again on an existing
-- database would duplicate every row. Run THIS file once instead, AFTER the migration.
-- The NOT EXISTS guard makes it safe to run twice.

INSERT INTO public.user_profile_field_master
    (role_id, source_table, field_name, display_name, is_editable, is_required, type, created_at)
SELECT r.role_id, v.source_table, v.field_name, v.display_name, v.is_editable, v.is_required, v.type, now()
FROM (
    VALUES
        -- ── STARTUP ──
        ('STARTUP', 'user', 'founders', 'Founders & LinkedIn', false, true, 'array'),

        -- ── INVESTOR ──
        ('INVESTOR', 'user', 'ticket_currency', 'Ticket Currency', true, false, 'string'),
        ('INVESTOR', 'user', 'investment_thesis', 'Investment Thesis', true, false, 'string'),
        ('INVESTOR', 'user', 'geographic_investment_preference_continent', 'Geographic Investment Preference (Continents)', true, false, 'array'),
        ('INVESTOR', 'user', 'address', 'Registered Office / Residential Address', true, true, 'string'),

        -- ── B2B ──
        ('B2B', 'user', 'business_type', 'Business Type', true, true, 'string'),
        ('B2B', 'user', 'b2b_geography_country', 'Geographies (Countries)', true, true, 'array'),
        ('B2B', 'user', 'b2b_geography_continent', 'Geographies (Continents)', true, false, 'array'),
        ('B2B', 'user', 'address', 'Registered Office / Residential Address', true, true, 'string')
) AS v(role_code, source_table, field_name, display_name, is_editable, is_required, type)
JOIN LATERAL (
    SELECT id AS role_id FROM public.company_role_master WHERE role_code = v.role_code
) r ON true
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profile_field_master m
    WHERE m.role_id = r.role_id AND m.field_name = v.field_name
);
