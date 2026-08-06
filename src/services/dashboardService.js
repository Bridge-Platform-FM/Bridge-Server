'use strict';
const dashboardRepository = require('../repositories/dashboardRepository');
const { errorLogger } = require('../configs/logger');
const ServiceResponse = require('../utils/ServiceResponse');
const { DASHBOARD_MESSAGES } = require('../utils/constant');

// ─── User Dashboard ───────────────────────────────────────────────────────────

/**
 * Collects every data point shown on the user's role dashboard in a single
 * service call. All repository queries run in parallel via Promise.all.
 *
 * The meetings count is wrapped in an extra catch so a missing or differently-
 * named meeting table never breaks the entire dashboard response — it just
 * silently returns 0 for upcomingMeetingsCount.
 *
 * Stat → frontend label mapping (for reference when wiring up the views):
 *
 *   StartupView
 *     connectionsReceived  → "Investor Matches"
 *     connectionsAccepted  → "Connections"
 *     kycDocumentsCount    → "Documents"
 *     (profileViews not tracked — return 0 until analytics table exists)
 *
 *   InvestorView
 *     activeDealRooms       → "New Deals"
 *     connectionsAccepted   → "Portfolio Cos."
 *     upcomingMeetingsCount → "Meetings"
 *     (watchlist not tracked — return 0 until watchlist table exists)
 *
 *   B2BView
 *     connectionsReceived  → "Marketplace Leads"
 *     activeDealRooms      → "Active Contracts"
 *     connectionsAccepted  → "Partners"
 *     kycDocumentsCount    → "Documents"
 */
const getUserDashboard = async ({ userId }) => {
    try {
        const [
            profile,
            connectionStats,
            activeDealRooms,
            kycDocumentsCount,
            upcomingMeetingsCount,
        ] = await Promise.all([
            dashboardRepository.getUserDashboardProfile(userId),
            dashboardRepository.getUserConnectionStats(userId),
            dashboardRepository.getUserActiveDealRoomsCount(userId),
            dashboardRepository.getUserKycDocumentsCount(userId),
            dashboardRepository.getUserUpcomingMeetingsCount(userId).catch(() => 0),
        ]);

        if (!profile) {
            return ServiceResponse.error({
                message: DASHBOARD_MESSAGES.USER_NOT_FOUND,
                statusCode: 404,
            });
        }

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                profile: {
                    firstName:        profile.first_name       || null,
                    lastName:         profile.last_name        || null,
                    organizationName: profile.organization_name || null,
                    role:             profile.role_code,
                    isActive:         profile.is_active,
                    kycStatus:        profile.kyc_status       || null,
                },
                stats: {
                    // connection stats (all roles)
                    connectionsSent:      parseInt(connectionStats.sent)     || 0,
                    connectionsReceived:  parseInt(connectionStats.received) || 0,
                    connectionsAccepted:  parseInt(connectionStats.accepted) || 0,
                    // activity stats (all roles)
                    activeDealRooms,
                    kycDocumentsCount,
                    upcomingMeetingsCount,
                    // stats not yet backed by a DB table — reserved for future use
                    profileViews: 0,
                    watchlistCount: 0,
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: DASHBOARD_MESSAGES.FETCH_FAILED,
            statusCode: 500,
        });
    }
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

/**
 * Aggregates the KPIs visible on the Admin dashboard — user counts and the KYC
 * pipeline. The acting admin's profile is echoed so the frontend can personalise
 * the header without a separate /me call.
 *
 * Stat → frontend label mapping:
 *   kycPending               → "KYC To Review"
 *   totalUsers               → context / user management numbers
 *   suspendedUsers           → suspension management context
 *   newRegistrationsLast7Days → recent growth indicator
 *
 * NOTE: "Open Tickets", "Resolved Today", and "Avg. Response" that appear in
 * the current AdminView placeholder are from a support-ticket system not yet
 * in the DB schema. They are omitted here and should be added to a future
 * tickets table. The frontend AdminView should be updated to use the real
 * fields above once this API is wired in.
 */
const getAdminDashboard = async ({ adminId }) => {
    try {
        const [adminProfile, userCounts, kycCounts] = await Promise.all([
            dashboardRepository.getAdminProfile(adminId),
            dashboardRepository.getUserCounts(),
            dashboardRepository.getKycStatusCounts(),
        ]);

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                adminProfile: {
                    name: adminProfile?.name || null,
                    role: adminProfile?.role || null,
                },
                stats: {
                    totalUsers:                parseInt(userCounts.total)            || 0,
                    suspendedUsers:            parseInt(userCounts.suspended)        || 0,
                    newRegistrationsLast7Days: parseInt(userCounts.new_last_7_days)  || 0,
                    kycPending:                parseInt(kycCounts.pending)           || 0,
                    kycApproved:               parseInt(kycCounts.approved)          || 0,
                    kycRejected:               parseInt(kycCounts.rejected)          || 0,
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: DASHBOARD_MESSAGES.FETCH_FAILED,
            statusCode: 500,
        });
    }
};

// ─── Super Admin Dashboard ────────────────────────────────────────────────────

/**
 * Platform-wide KPIs for the Super Admin dashboard. Runs six repository calls
 * in parallel: everything the admin dashboard returns plus organisation count,
 * active-today count, and admin account health.
 *
 * Stat → frontend label mapping (SuperAdminView):
 *   totalUsers        → "Total Users"
 *   totalOrganizations → "Organizations"
 *   kycPending        → "Pending KYC"
 *   activeToday       → "Active Today"
 *   + admin account stats surfaced in future admin-health cards
 */
const getSuperAdminDashboard = async ({ adminId }) => {
    try {
        const [
            adminProfile,
            userCounts,
            kycCounts,
            totalOrganizations,
            activeToday,
            adminCounts,
        ] = await Promise.all([
            dashboardRepository.getAdminProfile(adminId),
            dashboardRepository.getUserCounts(),
            dashboardRepository.getKycStatusCounts(),
            dashboardRepository.getTotalOrganizationsCount(),
            dashboardRepository.getActiveTodayCount(),
            dashboardRepository.getAdminAccountCounts(),
        ]);

        return ServiceResponse.success({
            message: DASHBOARD_MESSAGES.FETCH_SUCCESS,
            data: {
                adminProfile: {
                    name: adminProfile?.name || null,
                    role: adminProfile?.role || null,
                },
                stats: {
                    // ── User metrics (SuperAdminView stat cards) ───────────────
                    totalUsers:                parseInt(userCounts.total)            || 0,
                    totalOrganizations,
                    kycPending:                parseInt(kycCounts.pending)           || 0,
                    activeToday,
                    // ── Extended pipeline detail ───────────────────────────────
                    kycApproved:               parseInt(kycCounts.approved)          || 0,
                    kycRejected:               parseInt(kycCounts.rejected)          || 0,
                    suspendedUsers:            parseInt(userCounts.suspended)        || 0,
                    newRegistrationsLast7Days: parseInt(userCounts.new_last_7_days)  || 0,
                    // ── Admin account health ───────────────────────────────────
                    totalAdmins:     parseInt(adminCounts.total)     || 0,
                    activeAdmins:    parseInt(adminCounts.active)    || 0,
                    suspendedAdmins: parseInt(adminCounts.suspended) || 0,
                },
            },
            statusCode: 200,
        });
    } catch (error) {
        errorLogger.error(error);
        return ServiceResponse.error({
            message: DASHBOARD_MESSAGES.FETCH_FAILED,
            statusCode: 500,
        });
    }
};

module.exports = { getUserDashboard, getAdminDashboard, getSuperAdminDashboard };
