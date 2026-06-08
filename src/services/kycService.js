'use strict';
const { sequelize } = require('../models');
const kycInfoRepository = require('../repositories/kycInfoRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');

const upsertKycDocument = async ({ userId, companyId, roleId, documentType, side, s3Key, fileName, fileSize, mimeType }) => {
    const transaction = await sequelize.transaction();
    try {
        if (!userId && !companyId) {
            return ServiceResponse.error({ message: 'Either userId or companyId is required.', statusCode: 400 });
        }

        if (side !== 'front' && side !== 'back') {
            return ServiceResponse.error({ message: 'side must be front or back.', statusCode: 400 });
        }

        const sidePayload = side === 'front'
            ? { front_s3_key: s3Key, front_file_name: fileName, front_file_size: fileSize, front_mime_type: mimeType }
            : { back_s3_key: s3Key, back_file_name: fileName, back_file_size: fileSize, back_mime_type: mimeType };

        const existing = await kycInfoRepository.findKycRecord({ userId, companyId, roleId, documentType });

        let record;
        if (existing) {
            record = await kycInfoRepository.updateKycRecord(
                existing.id,
                {
                    ...sidePayload,
                    status: 'pending',
                    verified_at: null,
                    verified_by: null,
                    rejection_reason: null,
                    updated_by: userId ?? null
                },
                { transaction }
            );
        } else {
            record = await kycInfoRepository.createKycRecord(
                {
                    user_id: userId ?? null,
                    company_id: companyId ?? null,
                    role_id: roleId ?? null,
                    document_type: documentType,
                    ...sidePayload,
                    status: 'pending',
                    created_by: userId ?? null,
                    created_at: new Date()
                },
                { transaction }
            );
        }

        await transaction.commit();
        return ServiceResponse.success({ message: 'KYC document saved successfully.', data: { id: record.id }, statusCode: 200 });
    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({ message: 'Failed to save KYC document.', statusCode: 500 });
    }
};

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

module.exports = { upsertKycDocument, createKycInfo };
