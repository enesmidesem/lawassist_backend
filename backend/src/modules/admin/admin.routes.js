//Route tanımları ve middleware zinciri.

const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const requireAdmin = require('../../middlewares/requireAdmin');
const adminController = require('./admin.controller');
const {
  validateAdminLogin,
  validateLawyerId,
  validateAdminUpdateLawyer,
  validateSuspend,
} = require('./admin.validation');

// POST /api/admin/login — Admin giriş (korumasız, JWT gerekmiyor)
router.post('/login', validateAdminLogin, adminController.loginAdmin);

// GET /api/admin/lawyers — Tüm avukatları listele
router.get('/lawyers', authenticate, requireAdmin, adminController.getAllLawyers);

// GET /api/admin/lawyers/:lawyerId — Avukat detayı
router.get(
  '/lawyers/:lawyerId',
  authenticate, requireAdmin, validateLawyerId,
  adminController.getLawyerById
);

// PUT /api/admin/lawyers/:lawyerId — Avukat güncelle
router.put(
  '/lawyers/:lawyerId',
  authenticate, requireAdmin, validateLawyerId, validateAdminUpdateLawyer,
  adminController.updateLawyer
);

// DELETE /api/admin/lawyers/:lawyerId — Avukat sil (soft delete)
router.delete(
  '/lawyers/:lawyerId',
  authenticate, requireAdmin, validateLawyerId,
  adminController.deleteLawyer
);

// PATCH /api/admin/lawyers/:lawyerId/suspend — Askıya al
router.patch(
  '/lawyers/:lawyerId/suspend',
  authenticate, requireAdmin, validateLawyerId, validateSuspend,
  adminController.suspendLawyer
);

// GET /api/admin/listings — Tüm ilanları listele
router.get('/listings', authenticate, requireAdmin, adminController.getAllListings);

module.exports = router;