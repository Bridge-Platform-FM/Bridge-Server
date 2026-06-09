'use strict';
const { User } = require('../models');


const createUser = async (userData, transaction) => {
    return await User.create(userData, transaction);
};

const updateUser = async (userData, userId, { transaction } = {}) => {
    const [updatedCount, updatedRows] = await User.update(
        {
            ...userData,
            updated_at: new Date()
        },
        {
            where: {
                id: userId,
                is_deleted: false
            },
            returning: true, // PostgreSQL only
            transaction
        }
    );

    if (updatedCount === 0) {
        throw new Error(`User not found with id ${userId}`);
    }

    return updatedRows[0];
};


module.exports = {
    createUser,
    updateUser
};
