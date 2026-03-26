const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const ApiError = require('../utils/apiError');

const authenticate = async (req, res, next) => {
  try {
    // 1. Token'ı header'dan al
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Yetkilendirme token\'ı bulunamadı.'));
    }

    const token = authHeader.split(' ')[1];

    // 2. Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Role göre kullanıcıyı DB'den kontrol et
    if (decoded.role === 'lawyer') {
      const { rows } = await pool.query(
        `SELECT id, status, suspended_until FROM lawyers WHERE id = $1`,
        [decoded.id]
      );

      if (!rows[0]) {
        return next(new ApiError(401, 'Kullanıcı bulunamadı.'));
      }

      const lawyer = rows[0];

      // Silinmiş hesap
      if (lawyer.status === 'deleted') {
        return next(new ApiError(401, 'Bu hesap silinmiştir.'));
      }

      // Askıya alınmış hesap
      if (lawyer.status === 'suspended') {
        const now = new Date();
        if (lawyer.suspended_until && new Date(lawyer.suspended_until) > now) {
          return next(new ApiError(403,
            `Hesabınız ${new Date(lawyer.suspended_until).toLocaleDateString('tr-TR')} tarihine kadar askıya alınmıştır.`
          ));
        }
        // Süre dolduysa otomatik aktife al
        await pool.query(
          `UPDATE lawyers SET status = 'active', suspended_until = NULL WHERE id = $1`,
          [decoded.id]
        );
      }

    } else if (decoded.role === 'admin') {
      const { rows } = await pool.query(
        `SELECT id FROM admins WHERE id = $1`,
        [decoded.id]
      );

      if (!rows[0]) {
        return next(new ApiError(401, 'Yönetici bulunamadı.'));
      }

    } else {
      return next(new ApiError(401, 'Geçersiz token rolü.'));
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();

  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Geçersiz token.'));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token süresi dolmuş.'));
    }
    next(err);
  }
};

module.exports = authenticate;