const User = require('../models/userModel');

const checkUserExists = async (email) => {
    return await User.exists({ email });
};

module.exports = checkUserExists;
