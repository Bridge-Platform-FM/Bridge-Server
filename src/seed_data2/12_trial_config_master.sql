INSERT INTO public.trial_config_master (lookup, value, default_value, data_type, unit, description, created_by, created_at, updated_at, is_deleted) VALUES
    ('free_trial_day', '7', '7', 'integer', 'day', 'Number of free trial days granted to a new user', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('free_trial_connection_limit', '3', '3', 'integer', 'number', 'Connection requests allowed per billing window on the free tier', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('premium_connection_limit', '50', '50', 'integer', 'number', 'Connection requests allowed per billing window with an active subscription', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('manual_extension', 'true', 'true', 'boolean', 'flag', 'Allows support to extend active trials', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('auto_downgrade', 'true', 'true', 'boolean', 'flag', 'Move to free tier on expiry', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE),
    ('expiry_notification', 'true', 'true', 'boolean', 'flag', 'Email alerts 48h before trial end', '1147afd6-facc-4ad7-ad73-259cf0fdb347', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE);
