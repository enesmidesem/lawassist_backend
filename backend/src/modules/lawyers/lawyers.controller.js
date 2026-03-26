const { getLawyerById, updateLawyerById, getLawyerListings, deleteLawyer } = require('./lawyers.service');

/**
 * GET /api/lawyers/:id
 */
const getProfile = async (req, res, next) => {
  try {
    const lawyer = await getLawyerById(req.params.id, req.user);
    res.status(200).json({ success: true, data: { lawyer } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/lawyers/:id
 */
const updateProfile = async (req, res, next) => {
  try {
    const lawyer = await updateLawyerById(req.params.id, req.user, req.body);
    res.status(200).json({
      success: true,
      message: 'Profil bilgileriniz başarıyla güncellendi.',
      data: { lawyer },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/lawyers/:id/listings
 */
const getListings = async (req, res, next) => {
  try {
    const listings = await getLawyerListings(req.params.id, req.user, req.query.status);
    res.status(200).json({
      success: true,
      data: { listings },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/lawyers/:id
 */
const deleteProfile = async (req, res, next) => {
  try {
    await deleteLawyer(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: 'Hesabınız başarıyla silindi.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, getListings, deleteProfile };