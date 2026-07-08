'use strict';

const { Meeting, DealRoom } = require('../models');
const { Op } = require('sequelize');

// ─── Deal Room ────────────────────────────────────────────────────────────────

const getDealRoomById = async (dealRoomId) => {
    return await DealRoom.findOne({
        where: { id: dealRoomId, is_deleted: false }
    });
};

// ─── Meetings ─────────────────────────────────────────────────────────────────

const createMeeting = async (meetingData, { transaction } = {}) => {
    return await Meeting.create(meetingData, { transaction });
};

const getMeetingById = async (meetingId) => {
    return await Meeting.findOne({
        where: { id: meetingId, is_deleted: false }
    });
};

/**
 * Returns ALL meetings (past + upcoming) for a deal room, sorted chronologically.
 */
const getMeetingsByDealRoom = async (dealRoomId) => {
    return await Meeting.findAll({
        where: {
            deal_room_id: dealRoomId,
            is_deleted: false
        },
        order: [['scheduled_at', 'ASC']]
    });
};

/**
 * Returns the single nearest upcoming meeting for a deal room.
 * "Upcoming" means scheduled_at is strictly in the future.
 * Returns null if no upcoming meetings exist.
 */
const getUpcomingMeetingByDealRoom = async (dealRoomId) => {
    const now = new Date();
    return await Meeting.findOne({
        where: {
            deal_room_id: dealRoomId,
            is_deleted: false,
            scheduled_at: { [Op.gt]: now }
        },
        order: [['scheduled_at', 'ASC']]  // nearest first → LIMIT 1 via findOne
    });
};

const updateMeeting = async (updateData, meetingId, { transaction } = {}) => {
    const [updatedCount, updatedRows] = await Meeting.update(
        {
            ...updateData,
            updated_at: new Date()
        },
        {
            where: { id: meetingId, is_deleted: false },
            returning: true,   // PostgreSQL: returns the updated row
            transaction
        }
    );

    if (updatedCount === 0) {
        throw new Error(`Meeting not found with id ${meetingId}`);
    }

    return updatedRows[0];
};

module.exports = {
    getDealRoomById,
    createMeeting,
    getMeetingById,
    getMeetingsByDealRoom,
    getUpcomingMeetingByDealRoom,
    updateMeeting
};