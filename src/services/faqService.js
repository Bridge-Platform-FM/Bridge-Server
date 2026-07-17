'use strict';

const faqRepository = require('../repositories/faqRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { FAQ_MESSAGES } = require('../utils/constant');

const getFaqs = async () => {
    try {
        const faqs = await faqRepository.getActiveFaqs();
        return ServiceResponse.success({
            message: FAQ_MESSAGES.FETCH_SUCCESS,
            data: faqs,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: FAQ_MESSAGES.FETCH_FAILED,
            data: [],
            statusCode: 500
        });
    }
};

module.exports = { getFaqs };