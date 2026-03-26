const ApiError = require('../../utils/apiError');

/**
 * POST /auth/register — gelen body'yi doğrular
 */
const validateRegister = (req, res, next) => {
  const { first_name, last_name, email, password, phone, bar_association, bar_number } = req.body;

  // Zorunlu alanlar
  if (!first_name || !last_name || !email || !password || !phone || !bar_association || !bar_number) {
    return next(new ApiError(400, 'Ad, soyad, email, şifre, telefon, baro adı ve baro numarası zorunludur.'));
  }

  if (first_name.trim().length < 2 || last_name.trim().length < 2) {
    return next(new ApiError(400, 'Ad ve soyad en az 2 karakter olmalıdır.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Geçerli bir email adresi giriniz.'));
  }

  if (password.length < 8) {
    return next(new ApiError(400, 'Şifre en az 8 karakter olmalıdır.'));
  }

  if (!/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
    return next(new ApiError(400, 'Geçerli bir telefon numarası giriniz.'));
  }

  next();
};

/**
 * POST /auth/login — gelen body'yi doğrular
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, 'Email ve şifre zorunludur.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Geçerli bir email adresi giriniz.'));
  }

  next();
};

/**
 * POST /auth/forgot-password — gelen body'yi doğrular
 */
const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ApiError(400, 'Email adresi zorunludur.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ApiError(400, 'Geçerli bir email adresi giriniz.'));
  }

  next();
};

/**
 * POST /auth/reset-password — gelen body'yi doğrular
 */
const validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;

  if (!token) {
    return next(new ApiError(400, 'Sıfırlama token\'ı zorunludur.'));
  }

  if (!password) {
    return next(new ApiError(400, 'Yeni şifre zorunludur.'));
  }

  if (password.length < 8) {
    return next(new ApiError(400, 'Şifre en az 8 karakter olmalıdır.'));
  }

  next();
};

module.exports = { validateRegister, validateLogin, validateForgotPassword, validateResetPassword };