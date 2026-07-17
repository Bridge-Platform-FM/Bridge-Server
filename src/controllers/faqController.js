'use strict';

const { errorLogger } = require('../configs/logger');
const faqService = require('../services/faqService');
const { FAQ_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

const getFaqs = async (req, res, next) => {
    try {
        const faqsResponse = await faqService.getFaqs();
        if (!faqsResponse.success) {
            return HttpResponse.error(res, {
                message: faqsResponse.message,
                data: faqsResponse.data,
                statusCode: faqsResponse.statusCode
            });
        }

        return HttpResponse.success(res, {
            message: faqsResponse.message,
            data: faqsResponse.data,
            statusCode: faqsResponse.statusCode
        });
    } catch (error) {
        console.error(error);
        errorLogger.error(error);
        return HttpResponse.error(res, {
            message: FAQ_MESSAGES.FETCH_FAILED,
            statusCode: 500
        });
    }
};

module.exports = { getFaqs };