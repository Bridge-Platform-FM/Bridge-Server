'use strict';
const { Company, CompanyRole, CompanyRoleMaster } = require('../models');

const findByEmail = async (email) => {
    return await Company.findOne({
        where: { company_email: email }
    });
};

const findByPhoneNumber = async (phoneNumber) => {
    return await Company.findOne({
        where: { mobile_number: phoneNumber }
    });
};

const findRoleMasterByCode = async (roleCode) => {
    return await CompanyRoleMaster.findOne({
        where: { role_code: roleCode.toUpperCase() }
    });
};

const createCompany = async (companyData, { transaction }) => {
    return await Company.create(companyData, { transaction });
};

const createCompanyRole = async (companyRoleData, { transaction }) => {
    return await CompanyRole.create(companyRoleData, { transaction });
};

module.exports = {
    findByEmail,
    findByPhoneNumber,
    findRoleMasterByCode,
    createCompany,
    createCompanyRole
};
