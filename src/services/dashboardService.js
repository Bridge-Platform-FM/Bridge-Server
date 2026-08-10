'use strict';

const dashboardRepository = require('../repositories/dashboardRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { DASHBOARD_MESSAGES } = require('../utils/constant');

// ─── User Dashboard ───────────────────────────────────────────────────────────

const getUserDashboard = async ({ userId }) => {
    try {
        // All queries run in parallel; each degrades gracefully to a safe default
        // rather than letting a single transient DB error 500 the whole dashboard.
        const [
            profile,
            connectionStats,
            activeDealRoomsCount,
            kycDocumentsCount,
            upcomingMeetingsCount,
        ] = await Promise.all([
            dashboardRepository.getUserDashboardProfile(userId).catch(() => null),
            dashboardRepository.getUserConnectionStats(userId).catch(() => ({})),
            dashboardRepository.getUserActiveDealRoomsCount(userId).catch(() => 0),
            dashboardRepository.getUserKycDocumentsCount(userId).catch(() => 0),
            // Meeting table shape is assumed — catch keeps the rest of the dashboard
            // intact if the query fails due to a schema mismatch.
            dashboardRepository.getUserUpcomingMeetingsCount(userId).catch(() => 0),
        ]);

        if (!profile) {
            return ServiceResponse.error({ message: DASHBOARD_MESSAGES.USER_NOT_FOUND, statusCode: 404 });
        }

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                profile: {
                    firstName:        profile.first_name,
                    lastName:         profile.last_name,
                    organizationName: profile.organization_name,
                    role:             profile.role_code,
                    isActive:         profile.is_active,
                    kycStatus:        profile.kyc_status,
                },
                stats: {
                    connectionsSent:        parseInt(connectionStats.sent        || 0),
                    connectionsReceived:    parseInt(connectionStats.received    || 0),
                    connectionsAccepted:    parseInt(connectionStats.accepted    || 0),
                    activeDealRooms:        activeDealRoomsCount,
                    kycDocumentsCount:      kycDocumentsCount,
                    upcomingMeetingsCount:  upcomingMeetingsCount,
                    // Placeholder stats — no backing table yet; will be non-zero once
                    // profile_view tracking and watchlist features are implemented.
                    profileViews:   0,
                    watchlistCount: 0,
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DASHBOARD_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const getAdminDashboard = async ({ adminId }) => {
    try {
        const [adminProfile, userCounts, kycCounts] = await Promise.all([
            dashboardRepository.getAdminProfile(adminId).catch(() => null),
            dashboardRepository.getUserCounts().catch(() => ({})),
            dashboardRepository.getKycStatusCounts().catch(() => ({})),
        ]);

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                adminProfile: {
                    name: adminProfile?.name || '',
                    role: adminProfile?.role || '',
                },
                stats: {
                    totalUsers:                parseInt(userCounts.total           || 0),
                    suspendedUsers:            parseInt(userCounts.suspended       || 0),
                    newRegistrationsLast7Days: parseInt(userCounts.new_last_7_days || 0),
                    kycPending:                parseInt(kycCounts.pending          || 0),
                    kycApproved:               parseInt(kycCounts.approved         || 0),
                    kycRejected:               parseInt(kycCounts.rejected         || 0),
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DASHBOARD_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

// ─── Super Admin Dashboard ────────────────────────────────────────────────────

const getSuperAdminDashboard = async ({ adminId }) => {
    try {
        const [
            adminProfile,
            userCounts,
            kycCounts,
            totalOrganizations,
            activeToday,
            adminAccountCounts,
        ] = await Promise.all([
            dashboardRepository.getAdminProfile(adminId).catch(() => null),
            dashboardRepository.getUserCounts().catch(() => ({})),
            dashboardRepository.getKycStatusCounts().catch(() => ({})),
            dashboardRepository.getTotalOrganizationsCount().catch(() => 0),
            // NOTE: activeToday is derived from user_session.last_activity_at.
            // That column is only written when SESSION_LIMIT_ENABLED=true (defaults
            // to false). In environments where the flag is off this will return 0.
            // Confirm SESSION_LIMIT_ENABLED=true is set before relying on this KPI.
            dashboardRepository.getActiveTodayCount().catch(() => 0),
            dashboardRepository.getAdminAccountCounts().catch(() => ({})),
        ]);

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                adminProfile: {
                    name: adminProfile?.name || '',
                    role: adminProfile?.role || '',
                },
                stats: {
                    totalUsers:                parseInt(userCounts.total              || 0),
                    totalOrganizations:        totalOrganizations,
                    kycPending:                parseInt(kycCounts.pending             || 0),
                    activeToday:               activeToday,
                    kycApproved:               parseInt(kycCounts.approved            || 0),
                    kycRejected:               parseInt(kycCounts.rejected            || 0),
                    suspendedUsers:            parseInt(userCounts.suspended          || 0),
                    newRegistrationsLast7Days: parseInt(userCounts.new_last_7_days    || 0),
                    totalAdmins:               parseInt(adminAccountCounts.total      || 0),
                    activeAdmins:              parseInt(adminAccountCounts.active     || 0),
                    suspendedAdmins:           parseInt(adminAccountCounts.suspended  || 0),
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({ message: DASHBOARD_MESSAGES.FETCH_FAILED, statusCode: 500 });
    }
};

module.exports = { getUserDashboard, getAdminDashboard, getSuperAdminDashboard };