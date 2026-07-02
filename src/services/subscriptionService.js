const subscriptoinRepository = require("../repositories/subscriptoinRepository")
const { errorLogger } = require("../configs/logger");
const ServiceResponse = require("../utils/ServiceResponse");
const { SUBSCRIPTION_MESSAGES } = require("../utils/constant");

findActivePrememiumSubscription = async (companyId, userId) => {
    try {
        const userPremiumSubscription = await subscriptoinRepository.findActivePrememiumSubscription(companyId, userId);
        return ServiceResponse.success({ data: userPremiumSubscription, message: SUBSCRIPTION_MESSAGES.SUBSCRIPTION_FETCH_SUCCESS, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: SUBSCRIPTION_MESSAGES.SUBSCRIPTION_FETCH_FAILED, statusCode: 500 });
    }
};

module.exports = {
    findActivePrememiumSubscription
}