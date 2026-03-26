//Admin endpointleri için input doğrulama.

const ApiError = require('../../utils/apiError');

// Admin login doğrulaması
const validateAdminLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(ApiError.badRequest('Email ve şifre zorunludur'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(ApiError.badRequest('Geçersiz email formatı'));
  }

  next();
};

// lawyerId UUID doğrulaması
const validateLawyerId = (req, res, next) => {
  const { lawyerId } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!lawyerId || !uuidRegex.test(lawyerId)) {
    return next(ApiError.badRequest('Geçersiz avukat ID formatı'));
  }

  next();
};

// Avukat güncelleme doğrulaması
const validateAdminUpdateLawyer = (req, res, next) => {
  const { firstName, lastName, email, phone } = req.body;

  if (!firstName && !lastName && !email && !phone) {
    return next(ApiError.badRequest('Güncellenecek en az bir alan gönderilmelidir'));
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(ApiError.badRequest('Geçersiz email formatı'));
    }
  }

  if (firstName && (firstName.length < 2 || firstName.length > 50)) {
    return next(ApiError.badRequest('Ad 2-50 karakter arasında olmalıdır'));
  }

  if (lastName && (lastName.length < 2 || lastName.length > 50)) {
    return next(ApiError.badRequest('Soyad 2-50 karakter arasında olmalıdır'));
  }

  next();
};

// Askıya alma doğrulaması
const validateSuspend = (req, res, next) => {
  const { suspendUntil } = req.body;

  if (!suspendUntil) {
    return next(ApiError.badRequest('Askı bitiş tarihi (suspendUntil) zorunludur'));
  }

  const suspendDate = new Date(suspendUntil);
  if (isNaN(suspendDate.getTime())) {
    return next(ApiError.badRequest('Geçersiz tarih formatı'));
  }

  if (suspendDate <= new Date()) {
    return next(ApiError.badRequest('Askı bitiş tarihi gelecekte bir tarih olmalıdır'));
  }

  next();
};

module.exports = {
  validateAdminLogin,
  validateLawyerId,
  validateAdminUpdateLawyer,
  validateSuspend,
};