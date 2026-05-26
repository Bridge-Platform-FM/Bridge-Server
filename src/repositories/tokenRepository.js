'use strict';
const { RefreshToken } = require('../models');
const { Op } = require('sequelize');

class TokenRepository {
    async saveRefreshToken({ companyId, token, expiresAt }, { transaction } = {}) {
        return await RefreshToken.create({
            company_id: companyId,
            token,
            expires_at: expiresAt,
            is_revoked: false
        }, { transaction });
    }

    async findActiveTokensByCompanyId(companyId) {
        return await RefreshToken.findAll({
            where: {
                company_id: companyId,
                is_revoked: false,
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        });
    }

    async revokeToken(id) {
        return await RefreshToken.update({ is_revoked: true }, {
            where: { id }
        });
    }

    async revokeAllForCompany(companyId) {
        return await RefreshToken.update({ is_revoked: true }, {
            where: { company_id: companyId }
        });
    }
}

module.exports = new TokenRepository();
