'use strict';
const { Admin, AdminActivityLog, AdminPermission } = require('../models');
const { Op } = require('sequelize');

/**
 * Fetch a single admin by id regardless of deletion state.
 * Service layer decides how to handle is_deleted.
 */
const findAdminById = async (adminId) => {
    return await Admin.findOne({
        where: { id: adminId },
        attributes: { exclude: ['password'] }
    });
};

const findAdminByEmail = async (email, excludeId = null) => {
    const where = { email };
    if (excludeId) {
        where.id = { [Op.ne]: excludeId };
    }
    return await Admin.findOne({ where });
};

/**
 * Paginated list of ADMIN-role accounts (excludes SUPER_ADMIN and soft-deleted).
 * Supports optional status and case-insensitive name/email search.
 */
const getAllAdmins = async ({ page = 1, limit = 10, status, search } = {}) => {
    const offset = (page - 1) * limit;

    const where = {
        is_deleted: false,
        role: 'ADMIN'
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Admin.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });

    return { count, rows };
};

const createAdmin = async (data, options = {}) => {
    return await Admin.create(data, options);
};

const updateAdmin = async (adminId, data, options = {}) => {
    await Admin.update(data, {
        where: { id: adminId },
        ...options
    });
    return await Admin.findOne({
        where: { id: adminId },
        attributes: { exclude: ['password'] },
        transaction: options.transaction || null
    });
};

const logAdminActivity = async (data, options = {}) => {
    return await AdminActivityLog.create(data, options);
};

const getAdminActivityLogs = async (adminId) => {
    return await AdminActivityLog.findAll({
        where: { admin_id: adminId },
        order: [['created_at', 'DESC']],
        include: [
            {
                model: Admin,
                as: 'performedByAdmin',
                attributes: ['id', 'name', 'email', 'role']
            }
        ]
    });
};

// ── Admin Permission operations ───────────────────────────────────────────────

const getAdminPermissions = async (adminId) => {
    return await AdminPermission.findAll({
        where: { admin_id: adminId, is_deleted: false },
        attributes: ['id', 'permission_key', 'is_allowed'],
        order: [['created_at', 'ASC']]
    });
};

/**
 * Full-replace upsert: soft-deletes all current active permission rows for the
 * admin, then bulk-inserts the new set — all inside the caller's transaction.
 */
const replaceAdminPermissions = async (adminId, permissions, performedBy, options = {}) => {
    await AdminPermission.update(
        {
            is_deleted: true,
            deleted_at: new Date(),
            deleted_by: performedBy
        },
        {
            where: { admin_id: adminId, is_deleted: false },
            transaction: options.transaction || null
        }
    );

    if (permissions.length === 0) return [];

    return await AdminPermission.bulkCreate(
        permissions.map(p => ({
            admin_id: adminId,
            permission_key: p.permission_key,
            is_allowed: p.is_allowed,
            created_by: performedBy
        })),
        { transaction: options.transaction || null }
    );
};

module.exports = {
    findAdminById,
    findAdminByEmail,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    logAdminActivity,
    getAdminActivityLogs,
    getAdminPermissions,
    replaceAdminPermissions
};