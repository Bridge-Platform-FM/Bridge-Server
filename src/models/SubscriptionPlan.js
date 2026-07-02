'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const SubscriptionPlan = sequelize.define('SubscriptionPlan', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        plan_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        price_monthly: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        price_yearly: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },

        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'INR'
        },

        duration_days: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        applicable_roles: {
            type: DataTypes.JSONB,
            allowNull: true
        },

        features: {
            type: DataTypes.JSONB,
            allowNull: true
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }

    }, {
        tableName: 'subscription_plan',
        timestamps: true,
        initialAutoIncrement: 1,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    SubscriptionPlan.associate = (models) => {

        SubscriptionPlan.hasMany(models.SubscriptionPlanPriceHistory, {
            foreignKey: 'plan_id',
            as: 'price_history'
        });

        SubscriptionPlan.hasMany(models.UserSubscription, {
            foreignKey: 'plan_id',
            as: 'subscriptions'
        });

        SubscriptionPlan.hasMany(models.SubscriptionPaymentTransaction, {
            foreignKey: 'plan_id',
            as: 'payment_transactions'
        });

    };

    return SubscriptionPlan;
};
