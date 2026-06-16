'use strict';
const { sequelize } = require('../models');
const userRepository = require('../repositories/userRepository');
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
                    uid: row.uid,
                    cid: row.cid,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    company_email: row.company_email,
                    company_name: row.company_name,
                    country_code: row.country_code,
                    mobile_number: row.mobile_number,
                    is_email_verified: row.is_email_verified,
                    is_mobile_number_verified: row.is_mobile_number_verified,
                    is_kyc_verified: row.is_kyc_verified,
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

module.exports = { createUserProfile, getUserList, getUserKycDocs };
