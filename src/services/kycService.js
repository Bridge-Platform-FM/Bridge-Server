'use strict';
const { sequelize } = require('../models');
const kycInfoRepository = require('../repositories/kycInfoRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');

const createKycInfo = async (records) => {
    const transaction = await sequelize.transaction();
    try {
        if (!Array.isArray(records) || records.length === 0) {
            return ServiceResponse.error({ message: 'records must be a non-empty array.', statusCode: 400 });
        }

        const now = new Date();
        const normalized = records.map(r => ({
            ...r,
            status: r.status ?? 'pending',
            created_at: r.created_at ?? now
        }));

        const created = await kycInfoRepository.bulkCreateKycRecords(normalized, { transaction });
        await transaction.commit();
        return ServiceResponse.success({
            message: 'KYC documents created successfully.',
            data: { records: created },
            statusCode: 201
        });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: 'Failed to create KYC documents.', statusCode: 500 });
    }
};

module.exports = { createKycInfo };
