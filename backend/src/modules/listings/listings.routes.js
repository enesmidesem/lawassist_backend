// Route tanımları. Middleware zinciri: authenticate → requireLawyer → validation → controller.

const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const requireLawyer = require('../../middlewares/requireLawyer');

const listingsController = require('./listings.controller');
const {
  validateListingId,
  validateCreateListing,
  validateUpdateListing,
  validateListingFilters,
} = require('./listings.validation');

const applicationsController = require('../applications/applications.controller');
const {
  validateListingId: validateListingIdForApp,
  validateListingAndApplicationId,
  validateCreateApplication,
} = require('../applications/applications.validation');

// =============================================
// LISTINGS
// =============================================

// POST /api/listings — ilan oluştur
router.post(
  '/',
  authenticate,
  requireLawyer,
  validateCreateListing,
  listingsController.createListing
);

// GET /api/listings?city=...&date=...&courthouse=... — ilanları filtrele (herkese açık)
router.get(
  '/',
  validateListingFilters,
  listingsController.getListings
);

// PUT /api/listings/:listingId — ilan güncelle
router.put(
  '/:listingId',
  authenticate,
  requireLawyer,
  validateListingId,
  validateUpdateListing,
  listingsController.updateListing
);

// DELETE /api/listings/:listingId — ilan sil
router.delete(
  '/:listingId',
  authenticate,
  requireLawyer,
  validateListingId,
  listingsController.deleteListing
);

// =============================================
// APPLICATIONS (listings/:listingId/applications)
// =============================================

// GET /api/listings/:listingId/applications — kendi ilanına gelen başvuruları listele
router.get(
  '/:listingId/applications',
  authenticate,
  requireLawyer,
  validateListingIdForApp,
  applicationsController.getApplicationsByListing
);

// POST /api/listings/:listingId/applications — ilana başvur
router.post(
  '/:listingId/applications',
  authenticate,
  requireLawyer,
  validateListingIdForApp,
  validateCreateApplication,
  applicationsController.createApplication
);

// DELETE /api/listings/:listingId/applications/:applicationId — başvuruyu iptal et
router.delete(
  '/:listingId/applications/:applicationId',
  authenticate,
  requireLawyer,
  validateListingAndApplicationId,
  applicationsController.cancelApplication
);

module.exports = router;