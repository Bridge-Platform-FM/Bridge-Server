'use strict';

const ServiceResponse = require("../utils/ServiceResponse");
const { USER_MESSAGES } = require("../utils/constant");

const validateFieldsAgainstMetadata = (fields, metadataList) => {
    const errors = [];

    for (const meta of metadataList) {
        const {
            field_name, datatype, is_required,
            min_length, max_length, min_value, max_value,
            regex_pattern, allowed_values, display_name
        } = meta;

        const value = fields[field_name];
        const isEmpty = value === undefined || value === null || value === '';

        if (is_required && isEmpty) {
            errors.push({ field: field_name, message: `${display_name} is required` });
            continue;
        }

        if (isEmpty) continue;

        switch (datatype) {
            case 'string': {
                if (typeof value !== 'string') {
                    errors.push({ field: field_name, message: `${display_name} must be a string` });
                    break;
                }
                if (min_length != null && value.length < min_length)
                    errors.push({ field: field_name, message: `${display_name} must be at least ${min_length} characters` });
                if (max_length != null && value.length > max_length)
                    errors.push({ field: field_name, message: `${display_name} must not exceed ${max_length} characters` });
                if (regex_pattern && !new RegExp(regex_pattern).test(value))
                    errors.push({ field: field_name, message: `${display_name} format is invalid` });
                break;
            }
            case 'integer': {
                const intVal = Number(value);
                if (!Number.isInteger(intVal)) {
                    errors.push({ field: field_name, message: `${display_name} must be an integer` });
                    break;
                }
                if (min_value != null && intVal < Number(min_value))
                    errors.push({ field: field_name, message: `${display_name} must be at least ${min_value}` });
                if (max_value != null && intVal > Number(max_value))
                    errors.push({ field: field_name, message: `${display_name} must not exceed ${max_value}` });
                break;
            }
            case 'decimal': {
                const decVal = parseFloat(value);
                if (isNaN(decVal)) {
                    errors.push({ field: field_name, message: `${display_name} must be a number` });
                    break;
                }
                if (min_value != null && decVal < Number(min_value))
                    errors.push({ field: field_name, message: `${display_name} must be at least ${min_value}` });
                if (max_value != null && decVal > Number(max_value))
                    errors.push({ field: field_name, message: `${display_name} must not exceed ${max_value}` });
                break;
            }
            case 'boolean':
                if (typeof value !== 'boolean' && value !== 'true' && value !== 'false')
                    errors.push({ field: field_name, message: `${display_name} must be a boolean` });
                break;
            case 'date':
            case 'datetime':
                if (isNaN(Date.parse(value)))
                    errors.push({ field: field_name, message: `${display_name} must be a valid ${datatype}` });
                break;
            case 'json':
                if (typeof value !== 'object' || Array.isArray(value))
                    errors.push({ field: field_name, message: `${display_name} must be a valid JSON object` });
                break;
            case 'file':
                // file upload validation is handled at the multipart layer
                break;
        }

        if (Array.isArray(allowed_values) && allowed_values.length > 0 && !allowed_values.includes(value)) {
            errors.push({ field: field_name, message: `${display_name} must be one of: ${allowed_values.join(', ')}` });
        }
    }

    if (errors.length > 0) {
        return ServiceResponse.error({ message: USER_MESSAGES.VALIDATION_FAILED, data: errors, statusCode: 400 });
    }
    ServiceResponse.success();
};

module.exports = { validateFieldsAgainstMetadata };
