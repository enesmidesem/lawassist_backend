// Route tanımları. Middleware zinciri: authenticate → requireLawyer → validation → controller.

const express = require('express');
const router = express.Router();
const authenticate = require('../../middlewares/authenticate');
const requireLawyer = require('../../middlewares/requireLawyer');
const applicationsController = require('./applications.controller');
const {
  validateApplicationId,
  validateListingId,
  validateListingAndApplicationId,
  validateCreateApplication,
} = require('./applications.validation');

// PATCH /api/applications/:applicationId/approve
router.patch(
  '/:applicationId/approve',
  authenticate,
  requireLawyer,
  validateApplicationId,
  applicationsController.approveApplication
);

// PATCH /api/applications/:applicationId/reject
router.patch(
  '/:applicationId/reject',
  authenticate,
  requireLawyer,
  validateApplicationId,
  applicationsController.rejectApplication
);

module.exports = router;