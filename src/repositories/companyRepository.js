'use strict';
const { Company, CompanyUserRole, CompanyRoleMaster, User } = require('../models');

const findByEmail = async (email) => {
    return await Company.findOne({
        where: { company_email: email }
    });
};

const findCompanyWithRoleByEmail = async (email) => {
    return await Company.findOne({
        where: { company_email: email, is_deleted: false },
        include: [{
            model: CompanyUserRole,
            as: 'companyUserRoles',
            include: [
                { model: CompanyRoleMaster, as: 'role' },
                { model: User, as: 'user' }
            ]
        }]
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

const updateKycStatus = async (companyId, { isKycVerified, status, rejectionReason }, { transaction } = {}) => {
    const [, [updatedCompany]] = await Company.update(
        { is_kyc_verified: isKycVerified, kyc_status: status, kyc_rejection_reason: rejectionReason ?? null, is_kyc_verified: status === 'Approved' },
        { where: { id: companyId }, transaction, returning: true }
    );
    return updatedCompany;
};

const getCompanyById = async (companyId) => {
    return await Company.findOne({
        where: { id: companyId, is_deleted: false }
    });
};

const updatePasswordByEmail = async (email, hashedPassword, { transaction } = {}) => {
    const [, [updatedCompany]] = await Company.update(
        { password: hashedPassword },
        { where: { company_email: email, is_deleted: false }, transaction, returning: true }
    );
    return updatedCompany;
};

module.exports = {
    findByEmail,
    findCompanyWithRoleByEmail,
    findRoleMasterByCode,
    createCompany,
    createCompanyUserRole,
    updateEmailVerifiedStatus,
    updatePhoneVerifiedStatus,
    updateKycStatus,
    getCompanyById,
    updatePasswordByEmail
};
