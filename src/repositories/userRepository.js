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

const createUserCompany = async (data, transaction) => {
    return await UserCompany.create(data, transaction);
};

module.exports = {
    findByEmail,
    findCompanyUserRoleByCompanyAndRole,
    createUser,
    createUserCompany
};
