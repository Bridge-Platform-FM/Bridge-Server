'use strict';

const Joi = require('joi');
const HttpResponse = require('../utils/HttpResponse');

const createMeetingSchema = Joi.object({
    dealRoomId: Joi.string().guid().required().messages({
        'string.guid': 'dealRoomId must be a valid UUID',
        'any.required': 'dealRoomId is required'
    }),
    recipientUserId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.base': 'recipientUserId must be a string',
        'string.guid': 'recipientUserId must be a valid UUID',
        'any.required': 'recipientUserId is required'
    }),
    title: Joi.string().min(3).max(255).required().messages({
        'string.min': 'title must be at least 3 characters long',
        'string.max': 'title must not exceed 255 characters',
        'any.required': 'title is required'
    }),
    agenda: Joi.string().max(1000).optional().allow(null, '').messages({
        'string.max': 'agenda must not exceed 1000 characters'
    }),
    duration: Joi.string().max(100).required().messages({
        'string.max': 'duration must not exceed 100 characters',
        'any.required': 'duration is required'
    }),
    meetingLink: Joi.string().uri().max(500).required().messages({
        'string.uri': 'meetingLink must be a valid URL (include https://)',
        'string.max': 'meetingLink must not exceed 500 characters',
        'any.required': 'meetingLink is required'
    }),
    scheduledAt: Joi.date().iso().greater('now').required().messages({
        'date.base': 'scheduledAt must be a valid date',
        'date.format': 'scheduledAt must be a valid ISO 8601 date string',
        'date.greater': 'scheduledAt must be a future date and time',
        'any.required': 'scheduledAt is required'
    })
});

const updateMeetingSchema = Joi.object({
    title: Joi.string().min(3).max(255).optional().messages({
        'string.min': 'title must be at least 3 characters long',
        'string.max': 'title must not exceed 255 characters'
    }),
    agenda: Joi.string().max(1000).optional().allow(null, '').messages({
        'string.max': 'agenda must not exceed 1000 characters'
    }),
    duration: Joi.string().max(100).optional().messages({
        'string.max': 'duration must not exceed 100 characters'
    }),
    meetingLink: Joi.string().uri().max(500).optional().messages({
        'string.uri': 'meetingLink must be a valid URL (include https://)',
        'string.max': 'meetingLink must not exceed 500 characters'
    }),
    scheduledAt: Joi.date().iso().greater('now').optional().messages({
        'date.base': 'scheduledAt must be a valid date',
        'date.format': 'scheduledAt must be a valid ISO 8601 date string',
        'date.greater': 'scheduledAt must be a future date and time'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided to update'
});

/**
 * Higher-order middleware to run Joi validation.
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message.replace(/['"]/g, '')
        }));
        return HttpResponse.error(res, { message: 'Validation failed', data: errors, statusCode: 400 });
    }
    next();
};

module.exports = { createMeetingSchema, updateMeetingSchema, validate };