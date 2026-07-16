'use strict';
const { User, UserProfileFieldMaster, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

const createUser = async (userData, transaction) => {
    return await User.create(userData, transaction);
};

const updateUser = async (userData, userId, { transaction } = {}) => {
    const [updatedCount, updatedRows] = await User.update(
        {
            ...userData,
            updated_at: new Date()
        },
        {
            where: {
                id: userId,
                is_deleted: false
            },
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
            u.first_name, 
            u.last_name, 
            c.company_email, 
            c.company_name, 
            c.country_code, 
            c.mobile_number, 
            c.is_email_verified, 
            c.is_mobile_number_verified, 
            c.kyc_status,
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

const getUserKycDocs = async () => {
    return await sequelize.query(
        `SELECT
            u.id AS uid,
            c.id AS cid,
            u.first_name,
            u.last_name,
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
        order: [['id', 'ASC']]
    });
};

module.exports = {
    createUser,
    updateUser,
    findByEmail,
    getCompanyUser_role,
    getUserList,
    getUserKycDocs,
    searchUsers,
    getUserById,
    getUserCompanyRole,
    getUserProfileFieldsConfig,
    updatePasswordByEmail
};
