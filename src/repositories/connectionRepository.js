'use strict';

const { Op } = require('sequelize');
const { UserConnection, CompanyUserRole, CompanyRoleMaster } = require('../models');

const findExistingConnection = async (requesterUserId, requesterRoleId, recipientUserId, recipientRoleId) => {
    return await UserConnection.findOne({
        where: {
            requester_user_id: requesterUserId,
            requester_role_id: requesterRoleId,
            recipient_user_id: recipientUserId,
            recipient_role_id: recipientRoleId,
            is_deleted: false
        }
    });
};

const findRecipientCompanyUserRole = async (userId, roleId) => {
    return await CompanyUserRole.findOne({
        where: { user_id: userId, role_id: roleId, is_deleted: false },
        include: [{ model: CompanyRoleMaster, as: 'role' }]
    });
};

const create = async (data, { transaction } = {}) => {
    return await UserConnection.create(data, { transaction });
};

const findById = async (connectionId) => {
    return await UserConnection.findOne({
        where: { id: connectionId, is_deleted: false }
    });
};

const updateStatus = async (connectionId, status, { transaction } = {}) => {
    const [, [updated]] = await UserConnection.update(
        { status, updated_at: new Date() },
        { where: { id: connectionId }, returning: true, transaction }
    );
    return updated;
};

const countRequestsInWindow = async (userId, windowStart, windowEnd) => {
    return await UserConnection.count({
        where: {
            requester_user_id: userId,
            is_deleted: false,
            created_at: {
                [Op.gte]: windowStart,
                [Op.lt]: windowEnd
            }
        }
    });
};

module.exports = {
    findExistingConnection,
    findRecipientCompanyUserRole,
    create,
    findById,
    updateStatus,
    countRequestsInWindow
};
