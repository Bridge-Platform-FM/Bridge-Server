'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OtpVerification = sequelize.define('OtpVerification', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
            field: 'id'
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'email'
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'phone_number'
        },
        email_otp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'email_otp'
        },
        mobile_otp: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'mobile_otp'
        },
        email_otp_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'email_otp_expiry'
        },
        mobile_otp_expiry: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'mobile_otp_expiry'
        },
        email_resend_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'email_resend_count'
        },
        mobile_resend_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'mobile_resend_count'
        },
        email_last_sent_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'email_last_sent_at'
        },
        mobile_last_sent_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'mobile_last_sent_at'
        },
        email_verify_attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'email_verify_attempts'
        },
        mobile_verify_attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'mobile_verify_attempts'
        },
        email_blocked_until: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'email_blocked_until'
        },
        mobile_blocked_until: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'mobile_blocked_until'
        },
        is_email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_email_verified'
        },
        is_mobile_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_mobile_verified'
        },
        registration_payload: {
            type: DataTypes.JSON,
            allowNull: true,
            field: 'registration_payload'
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_deleted'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        }
    }, {
        tableName: 'otp_verification',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return OtpVerification;
};
