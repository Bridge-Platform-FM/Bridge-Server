'use strict';

const { DealRoom } = require('../models');

const create = async (data, { transaction } = {}) => {
    return await DealRoom.create(data, { transaction });
};

module.exports = { create };
