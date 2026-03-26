const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Şifreyi hashler
 * @param {string} plainPassword
 * @returns {Promise<string>}
 */
const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * Düz şifre ile hash'i karşılaştırır
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash);
};

module.exports = { hashPassword, comparePassword };