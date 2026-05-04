const jwt = require('jsonwebtoken');

/**
 * Tạo JWT Token cho user
 * @param {String} id - MongoDB ObjectId của user
 * @returns {String} JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

module.exports = generateToken;
