'use strict';
const { User, UserProfileFieldMaster, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const createUser = async (userData, transaction) => {
    return await User.create(userData, transaction);
};

const updateUser = async (userData, userId, { transaction } = {}) => {
    // company_email is the verified account identity set at registration (OTP-verified,
    // unique-constrained) — never writable through a profile update. Without this,
    // a stray company_email in the payload (the client always includes it as a locked/
    // read-only field) can collide with another row's email and fail the whole update
    // with a SequelizeUniqueConstraintError, rolling back every other field in the same
    // request even though none of them were the actual problem.
    //
    // Copy only real `user` columns so JSONB fields like `founders` are written when
    // present, and unknown body keys are never forwarded to SQL.
    const attributes = User.rawAttributes || {};
    const skip = new Set(['company_email', 'id', 'password', 'created_at', 'deleted_at', 'deleted_by', 'is_deleted']);
    const safeUserData = {};
    for (const [key, value] of Object.entries(userData || {})) {
        if (skip.has(key) || !attributes[key]) continue;
        safeUserData[key] = value;
    }
    const [updatedCount, updatedRows] = await User.update(
        {
            ...safeUserData,
            updated_at: new Date()
        },
        {
            where: {
                id: userId,
                is_deleted: false
            },
            fields: [...Object.keys(safeUserData), 'updated_at'],
            returning: true, // PostgreSQL only
            transaction
        }
    );

    if (updatedCount === 0) {
        throw new Error(`User not found with id ${userId}`);
    }

    return updatedRows[0];
};

const findByEmail = async (email) => {
    return await User.findOne({
        where: { company_email: email }
    });
} 


const getCompanyUser_role = async (companyId, userId) => {
    return await sequelize.query(
        `select crm.id, crm.role_name, crm.role_code, crm.role_description
        from company_user_role cur
        join company_role_master crm on cur.role_id = crm.id
        where cur.company_id = :companyId
        and cur.user_id = :userId`,
        {
            replacements: { userId, companyId },
            type: QueryTypes.SELECT
        }
    );
};

const getUserList = async () => {
    return await sequelize.query(
        `select 
            u.id as user_id,
            u.first_name, 
            u.last_name, 
            u.profile_photo,
            c.id as company_id,
            c.company_email, 
            c.company_name, 
            c.country_code, 
            c.mobile_number, 
            c.is_email_verified, 
            c.is_mobile_number_verified, 
            c.kyc_status,
            u.is_active,
            u.is_user_suspended,
            (select crm.role_code from company_role_master crm where id = cur.role_id) as role
        from "user" u 
        join company c on u.company_email = c.company_email 
        join company_user_role cur on cur.company_id = c.id and cur.user_id = u.id
        where u.is_deleted is not true and c.is_deleted is not true and cur.is_default_role is true`,
        {
            type: QueryTypes.SELECT
        }
    );
};

// Users with more than one active company_user_role row have used the
// switch-role flow (allocateUserCompanyRole) to add a role beyond their
// original default one.
const getUsersWithSwitchedRoles = async () => {
    return await sequelize.query(
        `SELECT user_id, first_name, last_name, profile_photo, company_id, company_email, company_name,
            company_user_role_id, role_id, role_code, role_name, is_default_role,
            status, is_profile_completed, rejection_reason, switched_at, approved_at
        FROM (
            SELECT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                u.profile_photo,
                c.id AS company_id,
                c.company_email,
                c.company_name,
                cur.id AS company_user_role_id,
                crm.id AS role_id,
                crm.role_code,
                crm.role_name,
                cur.is_default_role,
                cur.status,
                cur.is_profile_completed,
                cur.rejection_reason,
                cur.created_at AS switched_at,
                cur.approved_at,
                COUNT(*) OVER (PARTITION BY u.id) AS role_count
            FROM "user" u
            JOIN company c ON c.company_email = u.company_email
            JOIN company_user_role cur ON cur.company_id = c.id AND cur.user_id = u.id AND cur.is_deleted IS NOT TRUE
            JOIN company_role_master crm ON crm.id = cur.role_id
            WHERE u.is_deleted IS NOT TRUE AND c.is_deleted IS NOT TRUE
        ) sub
        WHERE role_count > 1
        ORDER BY user_id, switched_at`,
        {
            type: QueryTypes.SELECT
        }
    );
};

const getSuspendedUsersWithRoleAndCompany = async () => {
    return await sequelize.query(
        `SELECT
            u.id AS "userId",
            c.id AS "companyId",
            cur.role_id AS "roleId",
            crm.role_code AS "role",
            h.suspension_reason AS "reason",
            h.created_at AS "suspendedAt"
        FROM "user" u
        JOIN company_user_role cur ON cur.user_id = u.id AND cur.is_default_role IS TRUE AND cur.is_deleted IS NOT TRUE
        JOIN company_role_master crm ON crm.id = cur.role_id
        JOIN company c ON c.id = cur.company_id
        LEFT JOIN LATERAL (
            SELECT suspension_reason, created_at
            FROM user_suspension_history
            WHERE user_id = u.id
            ORDER BY created_at DESC
            LIMIT 1
        ) h ON true
        WHERE u.is_user_suspended IS TRUE AND u.is_deleted IS NOT TRUE`,
        {
            type: QueryTypes.SELECT
        }
    );
};

const getUserKycDocs = async () => {
    return await sequelize.query(
        `SELECT
            u.id AS uid,
            c.id AS cid,
            u.first_name,
            u.last_name,
            u.profile_photo,
            c.company_email,
            c.company_name,
            c.country_code,
            c.mobile_number,
            c.is_email_verified,
            c.is_mobile_number_verified,
            c.kyc_status,
            k.id AS kyc_id,
            k.document_type,
            k.document_number,
            k.document_number_iv,
            k.document_number_auth_tag,
            k.front_s3_key,
            k.front_file_name,
            k.back_s3_key,
            k.back_file_name,
            k.status AS kyc_status,
            k.rejection_reason,
            k.verified_at,
            k.created_at AS kyc_uploaded_at
        FROM "user" u
        JOIN company c ON u.company_email = c.company_email
        LEFT JOIN kyc_info k ON k.user_id = u.id AND k.is_deleted IS NOT TRUE
        WHERE u.is_deleted IS NOT TRUE
        ORDER BY k.created_at DESC`,
        {
            type: QueryTypes.SELECT
        }
    );
};

const searchUsers = async (searchQuery, searchableRoles = []) => {
    const words = [...new Set(searchQuery.trim().split(/\s+/).filter(Boolean))];

    const replacements = {};
    const wordConditions = words.map((word, index) => {
        const key = `word${index}`;
        replacements[key] = `%${word.replace(/[%_\\]/g, '\\$&')}%`;
        return `(c.company_email ILIKE :${key} ESCAPE '\\' OR u.first_name ILIKE :${key} ESCAPE '\\' OR u.last_name ILIKE :${key} ESCAPE '\\' OR c.company_name ILIKE :${key} ESCAPE '\\')`;
    }).join(' OR ');

    let roleFilter = '';
    if (Array.isArray(searchableRoles) && searchableRoles.length > 0) {
        replacements.searchableRoles = searchableRoles;
        roleFilter = 'AND crm.role_code IN (:searchableRoles)';
    }

    return await sequelize.query(
        `SELECT
            u.id AS user_id,
            cur.role_id,
            c.id AS company_id,
            u.first_name,
            u.last_name,
            u.profile_photo,
            c.company_name,
            c.company_email AS email,
            c.mobile_number,
            u.country,
            u.continent
        FROM "user" u
        JOIN company c ON u.company_email = c.company_email
        JOIN company_user_role cur ON cur.company_id = c.id AND cur.user_id = u.id AND cur.is_default_role IS TRUE
        JOIN company_role_master crm ON crm.id = cur.role_id
        WHERE u.is_deleted IS NOT TRUE
            AND c.is_deleted IS NOT TRUE
            AND cur.is_deleted IS NOT TRUE
            AND (${wordConditions})
            ${roleFilter}
        ORDER BY u.first_name ASC`,
        {
            replacements,
            type: QueryTypes.SELECT
        }
    );
};

const getUserById = async (userId) => {
    return await User.findOne({
        where: { id: userId, is_deleted: false }
    });
};

const getUserCompanyRole = async (userId, companyId, roleId) => {
    const rows = await sequelize.query(
        `SELECT cur.role_id, cur.company_id, crm.role_name, crm.role_code
        FROM company_user_role cur
        JOIN company_role_master crm ON crm.id = cur.role_id
        WHERE cur.user_id = :userId
            AND cur.company_id = :companyId
            AND cur.role_id = :roleId
            AND cur.is_deleted IS NOT TRUE
        LIMIT 1`,
        {
            replacements: { userId, companyId, roleId },
            type: QueryTypes.SELECT
        }
    );
    return rows[0] || null;
};

const getUserCompanyRoleByCode = async (userId, companyId, roleCode) => {
    const rows = await sequelize.query(
        `SELECT cur.id AS company_user_role_id, cur.role_id, cur.company_id, cur.status,
            cur.rejection_reason, cur.is_profile_completed, crm.role_name, crm.role_code
        FROM company_user_role cur
        JOIN company_role_master crm ON crm.id = cur.role_id
        WHERE cur.user_id = :userId
            AND cur.company_id = :companyId
            AND crm.role_code = :roleCode
            AND cur.is_deleted IS NOT TRUE
        LIMIT 1`,
        {
            replacements: { userId, companyId, roleCode },
            type: QueryTypes.SELECT
        }
    );
    return rows[0] || null;
};

const updatePasswordByEmail = async (email, hashedPassword, { transaction } = {}) => {
    const [, [updatedUser]] = await User.update(
        { password: hashedPassword },
        { where: { company_email: email, is_deleted: false }, transaction, returning: true }
    );
    return updatedUser;
};

const getUserProfileFieldsConfig = async (roleId) => {
    return await UserProfileFieldMaster.findAll({
        where: { role_id: roleId, is_deleted: false },
        order: [['display_order', 'ASC'], ['field_name', 'ASC']]
    });
};

module.exports = {
    createUser,
    updateUser,
    findByEmail,
    getCompanyUser_role,
    getUserList,
    getUsersWithSwitchedRoles,
    getSuspendedUsersWithRoleAndCompany,
    getUserKycDocs,
    searchUsers,
    getUserById,
    getUserCompanyRole,
    getUserCompanyRoleByCode,
    getUserProfileFieldsConfig,
    updatePasswordByEmail
};
