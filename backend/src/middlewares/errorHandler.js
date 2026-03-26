// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Operasyonel (beklenen) hatalar — ApiError sınıfından gelenler
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // JWT hataları (authenticate dışında fırlarsa)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Geçersiz token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token süresi doldu.' });
  }

  // Beklenmedik hatalar
  console.error('BEKLENMEDIK HATA:', err);
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Sunucu hatası.' : err.message,
  });
};

module.exports = errorHandler;