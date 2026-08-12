// 'use strict';
const Joi = require('joi');
const { OTP_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

const companyRegistrationSchema = Joi.object({
    companyName: Joi.string().min(3).max(100).required().messages({
        'string.min': 'companyName must be at least 3 characters long',
        'string.max': 'companyName must not exceed 100 characters',
        'any.required': 'companyName is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'email must be a valid email address',
        'any.required': 'email is required'
    }),
    countryCode: Joi.string().length(3).required().messages({
        'string.length': 'countryCode must be 3 characters long',
        'any.required': 'countryCode is required'
    }),
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
        'string.pattern.base': 'phoneNumber must be a valid 10-digit Indian phone number',
        'any.required': 'phoneNumber is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'string.min': 'password must be at least 8 characters long',
        'string.pattern.base': 'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'password is required'
    }),
    role: Joi.string().valid('INVESTOR', 'B2B', 'STARTUP').required().messages({
        'any.only': 'role must be one of: INVESTOR, B2B, STARTUP',
        'any.required': 'role is required'
    }),
    termsAccepted: Joi.boolean().valid(true).required().messages({
        'any.only': 'termsAccepted must be true',
        'any.required': 'termsAccepted is required'
    }),
    gstNumber: Joi.string().when('role', {
        is: 'B2B',
        then: Joi.required().messages({ 'any.required': 'gstNumber is required for B2B role' }),
        otherwise: Joi.optional().allow(null, '')
    }),
    cinNumber: Joi.string().when('role', {
        is: 'B2B',
        then: Joi.required().messages({ 'any.required': 'cinNumber is required for B2B role' }),
        otherwise: Joi.optional().allow(null, '')
    })
});

const verifyOtpSchema = Joi.object({
    channel: Joi.string().valid('EMAIL', 'PHONE').required().messages({
        'any.only': 'channel must be EMAIL or PHONE',
        'any.required': 'channel is required'
    }),
    otp: Joi.string().length(4).pattern(/^\d+$/).required().messages({
        'string.length': 'otp must be exactly 4 characters',
        'string.pattern.base': 'otp must contain only digits',
        'any.required': 'otp is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).when('channel', {
        is: 'EMAIL',
        then: Joi.required().messages({ 'any.required': OTP_MESSAGES.EMAIL_VALIDATION_FAILED }),
        otherwise: Joi.optional().allow(null, '')
    }),
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).when('channel', {
        is: 'PHONE',
        then: Joi.required().messages({ 'any.required': OTP_MESSAGES.PHONE_NUMBER_VALIDATION_FAILED }),
        otherwise: Joi.optional().allow(null, '')
    })
});

const resendOtpSchema = Joi.object({
    channel: Joi.string().valid('EMAIL', 'PHONE').required().messages({
        'any.only': 'channel must be EMAIL or PHONE',
        'any.required': 'channel is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).when('channel', {
        is: 'EMAIL',
        then: Joi.required().messages({ 'any.required': 'email is required when channel is EMAIL' }),
        otherwise: Joi.optional().allow(null, '')
    }),
    phoneNumber: Joi.string().pattern(/^[6-9]\d{9}$/).when('channel', {
        is: 'PHONE',
        then: Joi.required().messages({ 'any.required': 'phoneNumber is required when channel is PHONE' }),
        otherwise: Joi.optional().allow(null, '')
    })
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'any.required': 'refreshToken is required'
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'email must be a valid email address',
        'any.required': 'email is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'string.min': 'password must be at least 8 characters long',
        'string.pattern.base': 'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'password is required'
    })
});

/**
 * Higher-order middleware to run Joi validation.
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message.replace(/['"]/g, '')
            }));
            const err = new Error('Validation failed');
            err.status = 400;
            err.errors = errors;
            return HttpResponse.error(res, {
                message: err.message,
                data: errors,
                statusCode: 400
            });
        }
        next();
    };
};

const switchRoleSchema = Joi.object({
    roleCode: Joi.string().valid('INVESTOR', 'B2B', 'STARTUP').required().messages({
        'any.only': 'roleCode must be one of: INVESTOR, B2B, STARTUP',
        'any.required': 'roleCode is required'
    })
});

const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'string.min': 'newPassword must be at least 8 characters long',
        'string.pattern.base': 'newPassword must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'newPassword is required'
    })
});

module.exports = {
    validate,
    companyRegistrationSchema,
    verifyOtpSchema,
    resendOtpSchema,
    refreshTokenSchema,
    loginSchema,
    resetPasswordSchema,
    switchRoleSchema
};
