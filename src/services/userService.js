'use strict';
const { sequelize } = require('../models');
const userRepository = require('../repositories/userRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { USER_MESSAGES } = require('../utils/constant');

const createUserProfile = async ({ userData, companyId, role }) => {
    const transaction = await sequelize.transaction();
    try {
        const companyRole = await userRepository.findCompanyUserRoleByCompanyAndRole(companyId, role);
        if (!companyRole) {
            await transaction.rollback();
            return ServiceResponse.error({ message: USER_MESSAGES.ROLE_NOT_FOUND, statusCode: 400 });
        }

        const user = await userRepository.createUser(userData, { transaction });

        // await userRepository.createUserCompany(
        //     { user_id: user.id, company_role_id: companyRole.id },
        //     { transaction }
        // );

        await transaction.commit();
        return ServiceResponse.success({
            message: USER_MESSAGES.CREATE_SUCCESS,
            data: { id: user.id },
            statusCode: 201
        });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: USER_MESSAGES.CREATE_FAILED, statusCode: 500 });
    }
};

module.exports = { createUserProfile };
