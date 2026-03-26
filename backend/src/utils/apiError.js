class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Geçersiz istek verisi') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Kimlik doğrulama başarısız') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Bu işlem için yetkiniz yok') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Kaynak bulunamadı') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Çakışma hatası') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;