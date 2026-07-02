'use strict';

const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Fetches a user profile with their assigned role (via company_user_role join).
 * Returns the full user row plus role_code from company_role_master.
 */
const getProfileWithRole = async (userId) => {
    const results = await sequelize.query(
        `SELECT
            u.*,
            crm.role_code,
            crm.role_name,
            c.company_name
        FROM "user" u
        JOIN company_user_role cur ON cur.user_id = u.id
        JOIN company_role_master crm ON crm.id = cur.role_id
        JOIN company c ON c.id = cur.company_id
        WHERE u.id = :userId
          AND u.is_deleted IS NOT TRUE
          AND cur.is_default_role IS TRUE
          AND c.is_deleted IS NOT TRUE
        LIMIT 1`,
        {
            replacements: { userId },
            type: QueryTypes.SELECT
        }
    );
    return results.length > 0 ? results[0] : null;
};

/**
 * Fetches all active, non-deleted user profiles with their roles,
 * excluding the given userId (the source profile).
 */
const getCandidateProfiles = async (excludeUserId) => {
    return await sequelize.query(
        `SELECT
            u.*,
            cur.role_id,
            crm.role_code,
            crm.role_name,
            c.company_name,
            c.id AS company_id
        FROM "user" u
        JOIN company_user_role cur ON cur.user_id = u.id
        JOIN company_role_master crm ON crm.id = cur.role_id
        JOIN company c ON c.id = cur.company_id
        WHERE u.id != :excludeUserId
          AND u.is_deleted IS NOT TRUE
          AND u.is_active IS TRUE
          AND cur.is_default_role IS TRUE
          AND c.is_deleted IS NOT TRUE`,
        {
            replacements: { excludeUserId },
            type: QueryTypes.SELECT
        }
    );
};

module.exports = {
    getProfileWithRole,
    getCandidateProfiles
};
