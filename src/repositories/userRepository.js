'use strict';
const { User, CompanyUserRole, CompanyRoleMaster, UserCompany } = require('../models');

const findByEmail = async (email) => {
    return await User.findOne({ where: { company_email: email, is_deleted: false } });
};

const findCompanyUserRoleByCompanyAndRole = async (companyId, roleName) => {
    return await CompanyUserRole.findOne({
        where: { company_id: companyId, is_deleted: false },
        include: [{
            model: CompanyRoleMaster,
            as: 'role',
            where: { role_code: roleName }
        }]
    });
};

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

const createUserCompany = async (data, transaction) => {
    return await UserCompany.create(data, transaction);
};

module.exports = {
    findByEmail,
    findCompanyUserRoleByCompanyAndRole,
    createUser,
    createUserCompany,
    updateUser
};
