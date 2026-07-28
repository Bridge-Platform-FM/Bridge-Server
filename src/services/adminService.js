'use strict';
const bcrypt = require('bcrypt');
const adminRepository = require('../repositories/adminRepository');
const userRepository = require('../repositories/userRepository');
const userLimitConfigRepository = require('../repositories/userLimitConfigRepository');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { ADMIN_MESSAGES, USER_LIMIT_CONFIG_MESSAGES, USER_LIMIT_DEFAULTS, ROLES } = require('../utils/constant');
const { maskPhone, maskEmail } = require('../utils/Helper');


const login = async (email, password) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        if (!admin) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return ServiceResponse.error({ message: ADMIN_MESSAGES.INVALID_CREDENTIALS, statusCode: 401 });
        }

        const payload = {
            adminId: admin.id,
            email: admin.email,
            mobileNumber: admin.mobile_number,
            role: admin.role
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        const maskedMobile = maskPhone(admin.country_code + admin.mobile_number);
        const maskedEmail = maskEmail(admin.email);

        return ServiceResponse.success({
            message: ADMIN_MESSAGES.LOGIN_SUCCESS,
            data: { accessToken, refreshToken, maskedMobile, maskedEmail },
            statusCode: 200
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: ADMIN_MESSAGES.LOGIN_FAILED, statusCode: 500 });
    }
};

const findByEmail = async (email) => {
    try {
        const admin = await adminRepository.findByEmail(email);
        return ServiceResponse.success({ data: admin });
    } catch (error) {
        return ServiceResponse.error({ message: 'Error occured while checking email.', data: [], statusCode: 500 });
    }
};

const getUserLimitConfig = async ({ userId, adminRole }) => {
    try {
        // Role check: currently only SYS_ADMIN is permitted.
        // When SUPER_ADMIN is introduced, add it to ROLES.ADMIN in constant.js.
        if (!ROLES.ADMIN.includes(adminRole)) {
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.USER_NOT_FOUND,
                statusCode: 404
            });
        }

        const config = await userLimitConfigRepository.findByUserId(userId);

        const data = {
            user_id: userId,
            allowed_connections: config?.allowed_connections ?? USER_LIMIT_DEFAULTS.ALLOWED_CONNECTIONS,
            allowed_free_trial_days: config?.allowed_free_trial_days ?? USER_LIMIT_DEFAULTS.ALLOWED_FREE_TRIAL_DAYS,
            allowed_premium_days: config?.allowed_premium_days ?? USER_LIMIT_DEFAULTS.ALLOWED_PREMIUM_DAYS,
            is_custom: !!config
        };

        return ServiceResponse.success({
            message: USER_LIMIT_CONFIG_MESSAGES.FETCH_SUCCESS,
            data,
            statusCode: 200
        });

    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: USER_LIMIT_CONFIG_MESSAGES.FETCH_FAILED,
            statusCode: 500
        });
    }
};

const updateUserLimitConfig = async ({ userId, adminId, adminRole, payload }) => {
    const transaction = await sequelize.transaction();
    try {
        // Role check: currently only SYS_ADMIN is permitted.
        // When SUPER_ADMIN is introduced, add it to ROLES.ADMIN in constant.js.
        if (!ROLES.ADMIN.includes(adminRole)) {
            await transaction.rollback();
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.FORBIDDEN,
                statusCode: 403
            });
        }

        const user = await userRepository.getUserById(userId);
        if (!user) {
            await transaction.rollback();
            return ServiceResponse.error({
                message: USER_LIMIT_CONFIG_MESSAGES.USER_NOT_FOUND,
                statusCode: 404
            });
        }

        const { allowed_connections, allowed_free_trial_days, allowed_premium_days } = payload;

        const updateData = {};
        if (allowed_connections !== undefined) updateData.allowed_connections = allowed_connections;
        if (allowed_free_trial_days !== undefined) updateData.allowed_free_trial_days = allowed_free_trial_days;
        if (allowed_premium_days !== undefined) updateData.allowed_premium_days = allowed_premium_days;

        const result = await userLimitConfigRepository.upsertUserLimitConfig(userId, updateData, adminId, { transaction });

        await transaction.commit();

        return ServiceResponse.success({
            message: USER_LIMIT_CONFIG_MESSAGES.UPDATE_SUCCESS,
            data: result,
            statusCode: 200
        });

    } catch (error) {
        await transaction.rollback();
        errorLogger.error(error);
        return ServiceResponse.error({
            message: USER_LIMIT_CONFIG_MESSAGES.UPDATE_FAILED,
            statusCode: 500
        });
    }
};


module.exports = { login, findByEmail, getUserLimitConfig, updateUserLimitConfig, getMatchingEngineStats };


// ─── Matching Engine Dashboard ─────────────────────────────────────────────────

/**
 * Aggregate KPIs for the Matching Engine Dashboard.
 * All DB queries are delegated to adminRepository — this layer only handles
 * business logic (rate calculation, normalization) and error propagation.
 */
async function getMatchingEngineStats() {
    try {
        // Run all queries in parallel for performance
        const [
            kpi,
            breakdownRows,
            zeroRows,
            matchVolume,
            avgScoreRow,
            topSectors,
            algorithmDist,
            behavioralSignals,
        ] = await Promise.all([
            adminRepository.getMatchingEngineKpis(),
            adminRepository.getConnectionStatusBreakdown(),
            adminRepository.getZeroEngagementProfiles(),
            adminRepository.getMatchesGenerated(),
            adminRepository.getAverageCompatibilityScore(),
            adminRepository.getTopSectorsByVolume(),
            adminRepository.getAlgorithmDistribution(),
            adminRepository.getBehavioralSignals(),
        ]);

        const totalConnections    = parseInt(kpi.total_connections)    || 0;
        const acceptedConnections = parseInt(kpi.accepted_connections)  || 0;
        const acceptanceRate = totalConnections > 0
            ? Math.round((acceptedConnections / totalConnections) * 1000) / 10
            : 0;

        // Algorithm distribution with percentage (for cold-start vs. ML ratio)
        const totalAlgoShown = algorithmDist.reduce((s, r) => s + (parseInt(r.count) || 0), 0);
        const algorithmDistribution = algorithmDist.map(r => ({
            algorithmType: r.algorithm_type,
            count:         parseInt(r.count) || 0,
            percentage:    totalAlgoShown > 0
                ? Math.round((parseInt(r.count) / totalAlgoShown) * 100)
                : 0,
        }));

        return ServiceResponse.success({
            message: 'Matching engine stats fetched successfully.',
            data: {
                // ── Existing metrics (from connection/deal_room/user tables) ──
                totalProfiles:         parseInt(kpi.total_profiles)    || 0,
                totalConnections,
                acceptedConnections,
                acceptanceRate,
                activeDealRooms:       parseInt(kpi.active_deal_rooms) || 0,
                connectionStatusBreakdown: breakdownRows.map(r => ({
                    status: r.status,
                    count:  parseInt(r.count) || 0,
                })),
                zeroEngagementProfiles: zeroRows.map(r => ({
                    userId:   String(r.user_id),
                    name:     [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || '—',
                    role:     r.role_code    || '—',
                    company:  r.company_name || '—',
                    joinedAt: r.created_at
                        ? (r.created_at.toISOString?.() ?? String(r.created_at))
                        : null,
                })),

                // ── FRD Module 12.3 — new metrics from matching_events table ──
                /** Total matches generated: today / this week / this month */
                matchesGenerated: {
                    today:     parseInt(matchVolume.today)      || 0,
                    thisWeek:  parseInt(matchVolume.this_week)  || 0,
                    thisMonth: parseInt(matchVolume.this_month) || 0,
                },
                /** Average compatibility score (null = no data yet) */
                avgCompatibilityScore: avgScoreRow.avg_score != null
                    ? parseFloat(avgScoreRow.avg_score) || 0
                    : null,
                /** Top 5 sectors by match volume */
                topSectorsByVolume: topSectors.map(r => ({
                    sector: r.sector,
                    count:  parseInt(r.count) || 0,
                })),
                /** Cold-start (rule_based) vs. ML model distribution */
                algorithmDistribution,
                /** Behavioural signals: skips, accepts, flags etc. */
                behavioralSignals: behavioralSignals.map(r => ({
                    action: r.action,
                    count:  parseInt(r.count) || 0,
                })),
            },
            statusCode: 200,
        });

    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: 'Error fetching matching engine stats.',
            statusCode: 500,
        });
    }
}