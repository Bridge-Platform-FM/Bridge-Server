'use strict';
const { User, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

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

const findByEmail = async (email) => {
    return await User.findOne({
        where: { company_email: email }
    });
} 


const getCompanyUser_role = async (userId, companyId) => {
    return await sequelize.query(
        `select crm.id, crm.role_name, crm.role_code, crm.role_description
        from company_user_role cur join company_role_master crm on cur.role_id = crm.id
        where cur.company_id = :companyId and cur.user_id = :userId and cur.is_default_role is True`,
        {
            replacements: { userId, companyId },
            type: QueryTypes.SELECT
        }
    );
};

module.exports = {
    createUser,
    updateUser,
    findByEmail,
    getCompanyUser_role
};
