const { errorLogger } = require('../configs/logger');

const testService = async (body) => {

    try {
        if (!body.name) {
            throw new Error('Name is required');
        }
        return {
            success: true,
            message: 'User created successfully'
        };
    } catch (error) {
        errorLogger.error(
            `TEST SERVICE ERROR - ` +
            `${error.message} - ` +
            `STACK: ${error.stack}`
        );
        throw error;
    }

};

module.exports = {
    testService
};