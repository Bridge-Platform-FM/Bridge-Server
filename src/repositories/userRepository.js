const User = require("../models/User");

const createUser = async (userData, { transaction }) => {
    return await User.create(userData, { transaction });
};

module.exports = {
    createUser
};
