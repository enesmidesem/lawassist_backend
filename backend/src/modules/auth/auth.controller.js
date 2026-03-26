const { registerLawyer, loginLawyer, forgotPassword, resetPassword } = require('./auth.service');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { lawyer, accessToken } = await registerLawyer(req.body);
    res.status(201).json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu.',
      data: { lawyer, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { lawyer, accessToken } = await loginLawyer(req.body);
    res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      data: { lawyer, accessToken },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/forgot-password
 */
const forgotPasswordHandler = async (req, res, next) => {
  try {
    await forgotPassword(req.body.email);
    // Güvenlik: kullanıcı var olsa da olmasa da aynı mesajı dön
    res.status(200).json({
      success: true,
      message: 'Kayıtlı bir hesap varsa şifre sıfırlama maili gönderildi.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/reset-password
 */
const resetPasswordHandler = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, forgotPasswordHandler, resetPasswordHandler };