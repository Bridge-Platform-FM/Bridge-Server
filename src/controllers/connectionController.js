'use strict';

const { errorLogger } = require('../configs/logger');
const connectionService = require('../services/connectionService');
const subscriptionService = require('../services/subscriptionService');
const { CONNECTION_MESSAGES } = require('../utils/constant');
const HttpResponse = require('../utils/HttpResponse');

const sendConnectionRequest = async (req, res, next) => {
    try {
        const { recipientUserId, recipientRoleId, recipientCompanyId, message } = req.body;
        const { userId, roleId, companyId, role } = req;

        // 1. Find whether user has an active subscription
        const subscriptionResult = await subscriptionService.findActivePrememiumSubscription(companyId, userId);
        if (!subscriptionResult.success) {
            return HttpResponse.error(res, { message: subscriptionResult.message, statusCode: subscriptionResult.statusCode });
        }

        userSubscriptions = subscriptionResult.data; // userSubscriptions

        // 2. Find the billing window for connection requests
        const windowResult = await connectionService.getConnectionBillingWindow(userId);
        if (!windowResult.success) {
            return HttpResponse.error(res, { message: windowResult.message, statusCode: windowResult.statusCode });
        }

        // 3. Find all connection requests sent by the user in the billing window
        const { windowStart, windowEnd } = windowResult.data;
        const countResult = await connectionService.getConnectionRequestsInWindow(userId, windowStart, windowEnd);
        if (!countResult.success) {
            return HttpResponse.error(res, { message: countResult.message, statusCode: countResult.statusCode });
        }

        const requestCount = countResult.data.count

        // 4. Validate the limit — return message if exceeded
        const hasActiveSubscription =  userSubscriptions? true : false;

        const limit = hasActiveSubscription ? CONNECTION_REQUEST_LIMITS.PREMIUM : CONNECTION_REQUEST_LIMITS.FREE;

        if (requestCount >= limit) {
            return HttpResponse.error({ message: CONNECTION_MESSAGES.CONNECTION_LIMIT_REACHED, statusCode: 403 });
        }

        // const limitResult = connectionService.validateConnectionLimit(requestCount, hasActiveSubscription);
        // if (!limitResult.success) {
        //     return HttpResponse.error(res, { message: limitResult.message, statusCode: limitResult.statusCode });
        // }

        // 5. Send the connection request
        const result = await connectionService.sendRequest({
            requesterUserId: userId,
            requesterRoleId: roleId,
            requesterCompanyId: companyId,
            requesterRoleCode: role,
            recipientUserId,
            recipientRoleId,
            recipientCompanyId,
            message
        });
        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { data: result.data, message: result.message, statusCode: result.statusCode });

    } catch (error) {
        errorLogger.error(error);
        next(error);
    }
};

const changeConnectionStatus = async (req, res, next) => {
    try {
        const { connectionId, status } = req.body;
        const { userId } = req;

        const result = await connectionService.changeStatus({ connectionId, status, userId });

        if (!result.success) {
            return HttpResponse.error(res, { message: result.message, statusCode: result.statusCode });
        }

        return HttpResponse.success(res, { data: result.data, message: result.message, statusCode: result.statusCode });

    } catch (error) {
        errorLogger.error(error);
        next(error);
    }
};

module.exports = { sendConnectionRequest, changeConnectionStatus };
