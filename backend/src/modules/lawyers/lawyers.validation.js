const ApiError = require('../../utils/apiError');

/**
 * GET /lawyers/:id — lawyerId param kontrolü
 */
const validateLawyerId = (req, res, next) => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!id || !uuidRegex.test(id)) {
    return next(new ApiError(400, 'Geçerli bir avukat ID\'si giriniz.'));
  }

  next();
};

/**
 * PUT /lawyers/:id — güncelleme body kontrolü
 */
const validateUpdateLawyer = (req, res, next) => {
  const { first_name, last_name, email, phone, bar_association, bar_number } = req.body;

  // En az bir alan gönderilmiş olmalı
  if (!first_name && !last_name && !email && !phone && !bar_association && !bar_number) {
    return next(new ApiError(400, 'Güncellenecek en az bir alan giriniz.'));
  }

  if (first_name && first_name.trim().length < 2) {
    return next(new ApiError(400, 'Ad en az 2 karakter olmalıdır.'));
  }

  if (last_name && last_name.trim().length < 2) {
    return next(new ApiError(400, 'Soyad en az 2 karakter olmalıdır.'));
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError(400, 'Geçerli bir email adresi giriniz.'));
    }
  }

  if (phone && !/^\+?[\d\s\-()]{7,20}$/.test(phone)) {
    return next(new ApiError(400, 'Geçerli bir telefon numarası giriniz.'));
  }

  next();
};

module.exports = { validateLawyerId, validateUpdateLawyer };