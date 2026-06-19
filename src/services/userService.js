'use strict';
const { sequelize } = require('../models');
const userRepository = require('../repositories/userRepository');
const companyRepository = require('../repositories/companyRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { USER_MESSAGES, KYC_MESSAGES } = require('../utils/constant');
const { decrypt } = require('../utils/encryption');

const createUserProfile = async ({ userData, companyId, userId, roleId }) => {
    const transaction = await sequelize.transaction();
    try {

        const user = await userRepository.updateUser(userData, userId, { transaction });


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

const getUserList = async () => {
    try {
        const users = await userRepository.getUserList();
        return ServiceResponse.success({ message: USER_MESSAGES.USER_LISTING_SUCCESS, data: users, statusCode: 200 });
    } catch (error) {
        return ServiceResponse.error({ message: USER_MESSAGES.USER_LISTING_FAILURE, data: [], statusCode: 500 });
    }
}

const getUserKycDocs = async () => {
    try {
        const rows = await userRepository.getUserKycDocs();

        const userMap = new Map();

        for (const row of rows) {
            if (!userMap.has(row.uid)) {
                userMap.set(row.uid, {
                    user_id: row.uid,
                    company_id: row.cid,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    company_email: row.company_email,
                    company_name: row.company_name,
                    country_code: row.country_code,
                    mobile_number: row.mobile_number,
                    is_email_verified: row.is_email_verified,
                    is_mobile_number_verified: row.is_mobile_number_verified,
                    kyc_status: row.kyc_status,
                    kyc_documents: []
                });
            }

            if (row.kyc_id) {
                let document_number = null;
                if (row.document_number && row.document_number_iv && row.document_number_auth_tag) {
                    document_number = decrypt(row.document_number, row.document_number_iv, row.document_number_auth_tag);
                }

                userMap.get(row.uid).kyc_documents.push({
                    kyc_id: row.kyc_id,
                    document_type: row.document_type,
                    document_number,
                    front_s3_key: row.front_s3_key,
                    front_file_name: row.front_file_name,
                    back_s3_key: row.back_s3_key,
                    back_file_name: row.back_file_name,
                    kyc_status: row.kyc_status,
                    rejection_reason: row.rejection_reason,
                    verified_at: row.verified_at,
                    kyc_uploaded_at: row.kyc_uploaded_at
                });
            }
        }

        const data = Array.from(userMap.values());
        return ServiceResponse.success({ message: KYC_MESSAGES.KYC_LISTING_SUCCESS, data, statusCode: 200 });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: KYC_MESSAGES.KYC_LISTING_FAILED, data: [], statusCode: 500 });
    }
}

const getUserProfile = async ({ companyId, userId, roleId }) => {
    try {
        if (!userId || !roleId || !companyId) {
            return ServiceResponse.error({
                message: `Missing required token fields: userId=${userId}, roleId=${roleId}, companyId=${companyId}. Please log in again to get a fresh token.`,
                statusCode: 400
            });
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            return ServiceResponse.error({ message: 'User not found.', statusCode: 404 });
        }

        const company = await companyRepository.getCompanyById(companyId);
        if (!company) {
            return ServiceResponse.error({ message: 'Company not found.', statusCode: 404 });
        }

        const fieldsConfig = await userRepository.getUserProfileFieldsConfig(roleId);

        const data = fieldsConfig.map(config => {
            let value = '';
            if (config.source_table === 'user') {
                value = user[config.field_name];
            } else if (config.source_table === 'company') {
                value = company[config.field_name];
            }

            if (value === null || value === undefined) {
                value = '';
            }

            return {
                label: config.display_name,
                columnName: config.field_name,
                value: value,
                isEditable: config.is_editable,
                type: config.type
            };
        });

        return ServiceResponse.success({
            message: 'User profile retrieved successfully.',
            data: data,
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        console.error('[getUserProfile ERROR]', error.message, error.stack);
        return ServiceResponse.error({ message: error.message || 'Error retrieving user profile.', statusCode: 500 });
    }
};

module.exports = { createUserProfile, getUserList, getUserKycDocs, getUserProfile };
