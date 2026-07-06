'use strict';

const { Op } = require('sequelize');
const { DealRoomMessage, User } = require('../models');

const create = async (data, { transaction } = {}) => {
    return await DealRoomMessage.create(data, { transaction });
};

const findById = async (messageId) => {
    return await DealRoomMessage.findOne({
        where: { id: messageId, is_deleted: false }
    });
};

const findByDealRoomId = async (dealRoomId, { cursor, limit } = {}) => {
    const where = { deal_room_id: dealRoomId, is_deleted: false };
    if (cursor) {
        where.id = { [Op.lt]: cursor };
    }

    return await DealRoomMessage.findAll({
        where,
        include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name'] }],
        order: [['id', 'DESC']],
        limit: limit || 30
    });
};

const markReadByDealRoom = async (dealRoomId, readerUserId, { transaction } = {}) => {
    const [count] = await DealRoomMessage.update(
        { read_at: new Date() },
        {
            where: {
                deal_room_id: dealRoomId,
                recipient_user_id: readerUserId,
                read_at: null,
                is_deleted: false
            },
            transaction
        }
    );
    return count;
};

module.exports = { create, findById, findByDealRoomId, markReadByDealRoom };
