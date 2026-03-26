const crypto = require('crypto');
const pool = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const { generateAccessToken } = require('../../utils/generateToken');
const { sendEmail } = require('../../utils/sendEmail');
const ApiError = require('../../utils/apiError');

/**
 * Yeni avukat kaydı oluşturur
 * @param {object} data - { first_name, last_name, email, password, phone?, bar_association?, bar_number? }
 * @returns {{ lawyer: object, accessToken: string }}
 */
const registerLawyer = async (data) => {
  const { first_name, last_name, email, password, phone, bar_association, bar_number } = data;

  // 1. Email daha önce alınmış mı?
  const existing = await pool.query(
    `SELECT id FROM lawyers WHERE email = $1 AND status != 'deleted'`,
    [email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    throw new ApiError(409, 'Bu email adresi zaten kullanılmaktadır.');
  }

  // 2. Şifreyi hashle
  const password_hash = await hashPassword(password);

  // 3. Avukatı veritabanına ekle
  const result = await pool.query(
    `INSERT INTO lawyers
      (first_name, last_name, email, password_hash, phone, bar_association, bar_number, status, created_at, updated_at)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
     RETURNING id, first_name, last_name, email, phone, bar_association, bar_number, status, created_at`,
    [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase(),
      password_hash,
      phone || null,
      bar_association || null,
      bar_number || null,
    ]
  );

  const lawyer = result.rows[0];

  // 4. Access token üret
  const accessToken = generateAccessToken({ id: lawyer.id, role: 'lawyer' });

  return { lawyer, accessToken };
};

/**
 * Avukat girişi yapar
 * @param {object} data - { email, password }
 * @returns {{ lawyer: object, accessToken: string }}
 */
const loginLawyer = async (data) => {
  const { email, password } = data;

  // 1. Kullanıcıyı bul
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, password_hash, phone, bar_association, bar_number, status, suspended_until
     FROM lawyers WHERE email = $1`,
    [email.toLowerCase()]
  );

  const lawyer = result.rows[0];

  // 2. Kullanıcı yok ya da silinmiş
  if (!lawyer || lawyer.status === 'deleted') {
    throw new ApiError(401, 'Email veya şifre hatalı.');
  }

  // 3. Hesap askıya alınmış mı?
  if (lawyer.status === 'suspended') {
    const now = new Date();
    if (lawyer.suspended_until && new Date(lawyer.suspended_until) > now) {
      throw new ApiError(403, `Hesabınız ${new Date(lawyer.suspended_until).toLocaleDateString('tr-TR')} tarihine kadar askıya alınmıştır.`);
    }
    // Süre dolduysa aktif say (middleware de kontrol eder ama burada da handle edelim)
  }

  // 4. Şifre doğru mu?
  const isMatch = await comparePassword(password, lawyer.password_hash);
  if (!isMatch) {
    throw new ApiError(401, 'Email veya şifre hatalı.');
  }

  // 5. Token üret
  const accessToken = generateAccessToken({ id: lawyer.id, role: 'lawyer' });

  // password_hash'i response'a ekleme
  const { password_hash, ...lawyerData } = lawyer;

  return { lawyer: lawyerData, accessToken };
};

/**
 * Şifre sıfırlama maili gönderir
 * @param {string} email
 */
const forgotPassword = async (email) => {
  // 1. Kullanıcıyı bul — bulunamasa bile güvenlik için aynı mesajı döneceğiz
  const result = await pool.query(
    `SELECT id, first_name, email FROM lawyers WHERE email = $1 AND status != 'deleted'`,
    [email.toLowerCase()]
  );

  const lawyer = result.rows[0];

  // Kullanıcı bulunamazsa sessizce çık (email enumeration'a karşı)
  if (!lawyer) return;

  // 2. Daha önce kullanılmamış aktif token varsa iptal et
  await pool.query(
    `UPDATE password_reset_tokens SET used = true
     WHERE lawyer_id = $1 AND used = false`,
    [lawyer.id]
  );

  // 3. Yeni token üret (32 byte hex = 64 karakter)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 dakika

  // 4. Token'ı kaydet
  await pool.query(
    `INSERT INTO password_reset_tokens (lawyer_id, token, expires_at, used, created_at)
     VALUES ($1, $2, $3, false, NOW())`,
    [lawyer.id, token, expiresAt]
  );

  // 5. Sıfırlama linkini oluştur
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  // 6. Maili gönder
  await sendEmail({
    to: lawyer.email,
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Merhaba ${lawyer.first_name},</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}"
           style="display:inline-block; padding:12px 24px; background:#1a56db; color:#fff;
                  text-decoration:none; border-radius:6px; margin:16px 0;">
          Şifremi Sıfırla
        </a>
        <p>Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız bu emaili görmezden gelebilirsiniz.</p>
      </div>
    `,
  });
};

/**
 * Token doğrulayıp yeni şifre belirler
 * @param {string} token
 * @param {string} newPassword
 */
const resetPassword = async (token, newPassword) => {
  // 1. Token'ı bul
  const result = await pool.query(
    `SELECT * FROM password_reset_tokens WHERE token = $1`,
    [token]
  );

  const resetToken = result.rows[0];

  // 2. Token yok
  if (!resetToken) {
    throw new ApiError(400, 'Geçersiz veya süresi dolmuş bağlantı.');
  }

  // 3. Daha önce kullanılmış mı?
  if (resetToken.used) {
    throw new ApiError(400, 'Bu bağlantı daha önce kullanılmıştır.');
  }

  // 4. Süresi dolmuş mu?
  if (new Date(resetToken.expires_at) < new Date()) {
    throw new ApiError(400, 'Bağlantının süresi dolmuştur. Lütfen tekrar şifre sıfırlama talebinde bulunun.');
  }

  // 5. Yeni şifreyi hashle
  const password_hash = await hashPassword(newPassword);

  // 6. Şifreyi güncelle
  await pool.query(
    `UPDATE lawyers SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
    [password_hash, resetToken.lawyer_id]
  );

  // 7. Token'ı kullanılmış olarak işaretle
  await pool.query(
    `UPDATE password_reset_tokens SET used = true WHERE id = $1`,
    [resetToken.id]
  );
};

module.exports = { registerLawyer, loginLawyer, forgotPassword, resetPassword };