const findSubRoleMasterByCodeCompanyRoleCode = async ({sub_role_code, company_role_id}, transaction) => {
    return await SubRoleMaster.findOne({
        where: { sub_role_code: sub_role_code.toUpperCase(), company_role_id: company_role_id }
    });
};

module.exports = {
    findSubRoleMasterByCodeCompanyRoleCode
};
