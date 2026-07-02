'use strict';

const Joi = require('joi');
const HttpResponse = require('../utils/HttpResponse');

const sendConnectionRequestSchema = Joi.object({
    recipientUserId: Joi.number().integer().positive().required().messages({
        'number.base': 'recipientUserId must be a number',
        'number.integer': 'recipientUserId must be an integer',
        'number.positive': 'recipientUserId must be a positive number',
        'any.required': 'recipientUserId is required'
    }),
    recipientRoleId: Joi.number().integer().positive().required().messages({
        'number.base': 'recipientRoleId must be a number',
        'number.integer': 'recipientRoleId must be an integer',
        'number.positive': 'recipientRoleId must be a positive number',
        'any.required': 'recipientRoleId is required'
    }),
    message: Joi.string().max(500).optional().allow(null, '').messages({
        'string.max': 'message must not exceed 500 characters'
    })
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message);
        return HttpResponse.error(res, { message: messages, statusCode: 400 });
    }
    next();
};

const changeStatusSchema = Joi.object({
    connectionId: Joi.number().integer().positive().required().messages({
        'number.base': 'connectionId must be a number',
        'number.integer': 'connectionId must be an integer',
        'number.positive': 'connectionId must be a positive number',
        'any.required': 'connectionId is required'
    }),
    status: Joi.string().valid('Viewed', 'Accepted', 'Declined', 'Deferred', 'Withdrawn').required().messages({
        'any.only': 'status must be one of: Viewed, Accepted, Declined, Deferred, Withdrawn',
        'any.required': 'status is required'
    })
});

module.exports = { sendConnectionRequestSchema, changeStatusSchema, validate };
