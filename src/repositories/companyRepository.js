'use strict';
const { Company, CompanyUserRole, CompanyRoleMaster } = require('../models');

const findByEmail = async (email) => {
    return await Company.findOne({
        where: { company_email: email }
    });
};

// const findByPhoneNumber = async (phoneNumber) => {
//     return await Company.findOne({
//         where: { mobile_number: phoneNumber }
//     });
// };

const findRoleMasterByCode = async (roleCode) => {
    return await CompanyRoleMaster.findOne({
        where: { role_code: roleCode.toUpperCase() }
    });
};

const createCompany = async (companyData, { transaction }) => {
    return await Company.create(companyData, { transaction });
};

const createCompanyUserRole = async (companyUserRoleData, { transaction }) => {
    return await CompanyUserRole.create(companyUserRoleData, { transaction });
};

const updateEmailVerifiedStatus = async (company_id, status, { transaction }) => {
    const [, [updatedCompany]] = await Company.update(
        { is_email_verified: status },
        { where: { id: company_id }, transaction, returning: true }
    );
    return updatedCompany;
};

const updatePhoneVerifiedStatus = async (company_id, status, { transaction }) => {
    const [, [updatedCompany]] = await Company.update(
        { is_mobile_number_verified: status },
        { where: { id: company_id }, transaction, returning: true }
    );
    return updatedCompany;
};

module.exports = {
    findByEmail,
    // findByPhoneNumber,
    findRoleMasterByCode,
    createCompany,
    createCompanyUserRole,
    updateEmailVerifiedStatus,
    updatePhoneVerifiedStatus
};
