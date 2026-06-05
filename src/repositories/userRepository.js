'use strict';
const { User, CompanyRole, CompanyRoleMaster, UserCompany } = require('../models');

const findByEmail = async (email) => {
    return await User.findOne({ where: { company_email: email, is_deleted: false } });
};

const findCompanyRoleByCompanyAndRole = async (companyId, roleName) => {
    return await CompanyRole.findOne({
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
    findCompanyRoleByCompanyAndRole,
    createUser,
    createUserCompany
};
