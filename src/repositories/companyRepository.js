'use strict';
const { Company, CompanyRole, CompanyRoleMaster } = require('../models');

class CompanyRepository {
    async findByEmail(email) {
        return await Company.findOne({
            where: { company_email: email }
        });
    }

    async findByPhoneNumber(phoneNumber) {
        return await Company.findOne({
            where: { mobile_number: phoneNumber }
        });
    }

    async findRoleMasterByCode(roleCode) {
        return await CompanyRoleMaster.findOne({
            where: { role_code: roleCode.toUpperCase() }
        });
    }

    async createCompany(companyData, { transaction }) {
        return await Company.create(companyData, { transaction });
    }

    async createCompanyRole(companyRoleData, { transaction }) {
        return await CompanyRole.create(companyRoleData, { transaction });
    }
}

module.exports = new CompanyRepository();
