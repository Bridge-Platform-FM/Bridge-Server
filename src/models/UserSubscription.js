'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

    const UserSubscription = sequelize.define('UserSubscription', {

        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'user',
                key: 'id'
            }
        },

        company_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'company',
                key: 'id'
            }
        },

        plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subscription_plan',
                key: 'id'
            }
        },

        locked_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },

        locked_currency: {
            type: DataTypes.STRING(10),
            allowNull: false
        },

        billing_cycle: {
            type: DataTypes.ENUM('monthly', 'yearly'),
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending'
        },

        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },

        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },

        auto_renew: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },

        cancelled_at: {
            type: DataTypes.DATE,
            allowNull: true
        },

        cancellation_reason: {
            type: DataTypes.TEXT,
            allowNull: true
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
        tableName: 'user_subscription',
        timestamps: true,
        initialAutoIncrement: 1,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    UserSubscription.associate = (models) => {

        UserSubscription.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        UserSubscription.belongsTo(models.Company, {
            foreignKey: 'company_id',
            as: 'company'
        });

        UserSubscription.belongsTo(models.SubscriptionPlan, {
            foreignKey: 'plan_id',
            as: 'plan'
        });

        UserSubscription.hasMany(models.SubscriptionPaymentTransaction, {
            foreignKey: 'user_subscription_id',
            as: 'payment_transactions'
        });

    };

    return UserSubscription;
};
