// Parametre ve body validasyonları

const ApiError = require('../../utils/apiError');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// applicationId param validasyonu
const validateApplicationId = (req, res, next) => {
  const { applicationId } = req.params;

  if (!applicationId || !uuidRegex.test(applicationId)) {
    return next(ApiError.badRequest('Geçersiz başvuru ID formatı'));
  }

  next();
};

// listingId param validasyonu
const validateListingId = (req, res, next) => {
  const { listingId } = req.params;

  if (!listingId || !uuidRegex.test(listingId)) {
    return next(ApiError.badRequest('Geçersiz ilan ID formatı'));
  }

  next();
};

// listingId + applicationId param validasyonu (iptal endpoint'i için)
const validateListingAndApplicationId = (req, res, next) => {
  const { listingId, applicationId } = req.params;

  if (!listingId || !uuidRegex.test(listingId)) {
    return next(ApiError.badRequest('Geçersiz ilan ID formatı'));
  }

  if (!applicationId || !uuidRegex.test(applicationId)) {
    return next(ApiError.badRequest('Geçersiz başvuru ID formatı'));
  }

  next();
};

// Başvuru oluşturma body validasyonu (note opsiyonel ama varsa max 500 karakter)
const validateCreateApplication = (req, res, next) => {
  const { note } = req.body;

  if (note !== undefined && note !== null) {
    if (typeof note !== 'string') {
      return next(ApiError.badRequest('Not metin formatında olmalıdır'));
    }
    if (note.trim().length > 500) {
      return next(ApiError.badRequest('Not en fazla 500 karakter olabilir'));
    }
    // Boşlukları temizle
    req.body.note = note.trim();
  }

  next();
};

module.exports = {
  validateApplicationId,
  validateListingId,
  validateListingAndApplicationId,
  validateCreateApplication,
};