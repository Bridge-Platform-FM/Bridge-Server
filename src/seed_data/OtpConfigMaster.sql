
INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_EXPIRY_MINUTES', '2', '2', 'integer', 'minute', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_RESEND_COOLDOWN_SECONDS', '5', '5', 'integer', 'second', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_MAX_RESEND_PER_HOUR', '10', '10', 'integer', 'number', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_MAX_VERIFY_ATTEMPTS', '3', '3', 'integer', 'number', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_BLOCK_DURATION_MINUTES', '1', '1', 'integer', 'minute', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('OTP_TTL', '300', '300', 'integer', 'second', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('RESEND_TTL', '120', '120', 'integer', 'second', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('MAX_ATTEMPTS', '3', '3', 'integer', 'number', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('MAX_RESEND', '10', '10', 'integer', 'number', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('RESEND_COUNT_TTL', '3600', '3600', 'integer', 'second', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

INSERT INTO public.otp_config_master
(lookup, value, default_value, data_type, unit, created_by, created_at)
VALUES('BLOCK_TTL', '3600', '3600', 'integer', 'second', (select id from "admin" a where a.email = 'superadmin@test.com'), now());

