'use strict';
const { RefreshToken } = require('../models');
const { Op } = require('sequelize');

const saveRefreshToken = async ({ companyId, token, expiresAt }, { transaction } = {}) => {
    return await RefreshToken.create({
        company_id: companyId,
        token,
        expires_at: expiresAt,
        is_revoked: false
    }, { transaction });
};

const findActiveTokensByCompanyId = async (companyId) => {
    return await RefreshToken.findAll({
        where: {
            company_id: companyId,
            is_revoked: false,
            expires_at: {
                [Op.gt]: new Date()
            }
        }
    });
};

const revokeToken = async (id) => {
    return await RefreshToken.update({ is_revoked: true }, {
        where: { id }
    });
};

const revokeAllForCompany = async (companyId) => {
    return await RefreshToken.update({ is_revoked: true }, {
        where: { company_id: companyId }
    });
};

module.exports = {
    saveRefreshToken,
    findActiveTokensByCompanyId,
    revokeToken,
    revokeAllForCompany
};
