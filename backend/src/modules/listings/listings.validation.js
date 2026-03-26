// Parametre ve body validasyonları

const ApiError = require('../../utils/apiError');

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// YYYY-MM-DD formatı
const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// listingId param validasyonu
const validateListingId = (req, res, next) => {
  const { listingId } = req.params;

  if (!listingId || !uuidRegex.test(listingId)) {
    return next(ApiError.badRequest('Geçersiz ilan ID formatı'));
  }

  next();
};

// İlan oluşturma body validasyonu
const validateCreateListing = (req, res, next) => {
  const { title, city, courthouse, hearing_date } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(ApiError.badRequest('Başlık zorunludur'));
  }
  if (title.trim().length > 150) {
    return next(ApiError.badRequest('Başlık en fazla 150 karakter olabilir'));
  }

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return next(ApiError.badRequest('Şehir zorunludur'));
  }
  if (city.trim().length > 50) {
    return next(ApiError.badRequest('Şehir en fazla 50 karakter olabilir'));
  }

  if (!courthouse || typeof courthouse !== 'string' || courthouse.trim().length === 0) {
    return next(ApiError.badRequest('Adliye zorunludur'));
  }
  if (courthouse.trim().length > 100) {
    return next(ApiError.badRequest('Adliye en fazla 100 karakter olabilir'));
  }

  if (!hearing_date || !dateRegex.test(hearing_date)) {
    return next(ApiError.badRequest('Duruşma tarihi zorunludur ve YYYY-MM-DD formatında olmalıdır'));
  }

  // Geçmiş tarih kontrolü
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hearingDate = new Date(hearing_date);
  if (hearingDate < today) {
    return next(ApiError.badRequest('Duruşma tarihi geçmiş bir tarih olamaz'));
  }

  // Boşlukları temizle
  req.body.title = title.trim();
  req.body.city = city.trim();
  req.body.courthouse = courthouse.trim();
  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
};

// İlan güncelleme body validasyonu (tüm alanlar opsiyonel ama en az biri zorunlu)
const validateUpdateListing = (req, res, next) => {
  const { title, description, city, courthouse, hearing_date } = req.body;

  const hasAnyField = [title, description, city, courthouse, hearing_date].some(
    (v) => v !== undefined
  );
  if (!hasAnyField) {
    return next(ApiError.badRequest('Güncellenecek en az bir alan girilmelidir'));
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return next(ApiError.badRequest('Başlık boş olamaz'));
    }
    if (title.trim().length > 150) {
      return next(ApiError.badRequest('Başlık en fazla 150 karakter olabilir'));
    }
    req.body.title = title.trim();
  }

  if (city !== undefined) {
    if (typeof city !== 'string' || city.trim().length === 0) {
      return next(ApiError.badRequest('Şehir boş olamaz'));
    }
    if (city.trim().length > 50) {
      return next(ApiError.badRequest('Şehir en fazla 50 karakter olabilir'));
    }
    req.body.city = city.trim();
  }

  if (courthouse !== undefined) {
    if (typeof courthouse !== 'string' || courthouse.trim().length === 0) {
      return next(ApiError.badRequest('Adliye boş olamaz'));
    }
    if (courthouse.trim().length > 100) {
      return next(ApiError.badRequest('Adliye en fazla 100 karakter olabilir'));
    }
    req.body.courthouse = courthouse.trim();
  }

  if (hearing_date !== undefined) {
    if (!dateRegex.test(hearing_date)) {
      return next(ApiError.badRequest('Duruşma tarihi YYYY-MM-DD formatında olmalıdır'));
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hearingDate = new Date(hearing_date);
    if (hearingDate < today) {
      return next(ApiError.badRequest('Duruşma tarihi geçmiş bir tarih olamaz'));
    }
  }

  if (description !== undefined && description !== null) {
    req.body.description = description.trim();
  }

  next();
};

// Filtre query param validasyonu (city, date, courthouse)
const validateListingFilters = (req, res, next) => {
  const { city, date, courthouse } = req.query;

  if (date !== undefined && !dateRegex.test(date)) {
    return next(ApiError.badRequest('Tarih YYYY-MM-DD formatında olmalıdır'));
  }

  if (city !== undefined && city.trim().length > 50) {
    return next(ApiError.badRequest('Şehir en fazla 50 karakter olabilir'));
  }

  if (courthouse !== undefined && courthouse.trim().length > 100) {
    return next(ApiError.badRequest('Adliye en fazla 100 karakter olabilir'));
  }

  next();
};

module.exports = {
  validateListingId,
  validateCreateListing,
  validateUpdateListing,
  validateListingFilters,
};