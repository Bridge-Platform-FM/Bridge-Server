'use strict';
const { User, sequelize } = require('../models');
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


const getCompanyUser_role = async (userId, companyId) => {
    return await sequelize.query(
        `select crm.id, crm.role_name, crm.role_code, crm.role_description
        from company_user_role cur join company_role_master crm on cur.role_id = crm.id
        where cur.company_id = :companyId and cur.user_id = :userId and cur.is_default_role is True`,
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
        ORDER BY u.id, k.created_at`,
        {
            type: QueryTypes.SELECT
        }
    );
};


module.exports = {
    createUser,
    updateUser,
    findByEmail,
    getCompanyUser_role,
    getUserList,
    getUserKycDocs
};
