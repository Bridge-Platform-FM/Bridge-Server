'use strict';
const { KycInfo } = require('../models');

const findKycRecord = async ({ userId, companyId, roleId, documentType }) => {
    return await KycInfo.findOne({
        where: {
            user_id: userId ?? null,
            company_id: companyId ?? null,
            role_id: roleId ?? null,
            document_type: documentType,
            is_deleted: false
        }
    });
};

const createKycRecord = async (data, options = {}) => {
    return await KycInfo.create(data, options);
};

const updateKycRecord = async (id, data, options = {}) => {
    const [updatedCount, updatedRows] = await KycInfo.update(
        { ...data, updated_at: new Date() },
        {
            where: { id, is_deleted: false },
            returning: true,
            ...options
        }
    );

    if (updatedCount === 0) {
        throw new Error(`KycInfo record not found with id ${id}`);
    }

    return updatedRows[0];
};

const bulkCreateKycRecords = async (records, options = {}) => {
    return await KycInfo.bulkCreate(records, { returning: true, ...options });
};


module.exports = { findKycRecord, createKycRecord, updateKycRecord, bulkCreateKycRecords };
