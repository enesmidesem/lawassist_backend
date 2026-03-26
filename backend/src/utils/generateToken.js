const jwt = require('jsonwebtoken');

/**
 * Access token üretir (1 gün ömürlü)
 * @param {object} payload - { id, role }
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

module.exports = { generateAccessToken };