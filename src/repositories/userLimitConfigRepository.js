'use strict';
const { UserLimitConfig } = require('../models');

const findByUserId = async (userId) => {
    return await UserLimitConfig.findOne({
        where: { user_id: userId, is_deleted: false }
    });
};

const upsertUserLimitConfig = async (userId, data, adminId, { transaction } = {}) => {
    const existing = await UserLimitConfig.findOne({
        where: { user_id: userId, is_deleted: false },
        transaction
    });

    if (existing) {
        const [, [updated]] = await UserLimitConfig.update(
            {
                ...data,
                updated_by: adminId,
                updated_at: new Date()
            },
            {
                where: { user_id: userId, is_deleted: false },
                returning: true,
                transaction
            }
        );
        return updated;
    }

    return await UserLimitConfig.create(
        {
            user_id: userId,
            ...data,
            created_by: adminId
        },
        { transaction }
    );
};

module.exports = { findByUserId, upsertUserLimitConfig };