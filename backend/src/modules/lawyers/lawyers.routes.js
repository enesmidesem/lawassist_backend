const express = require('express');
const router = express.Router();

const authenticate = require('../../middlewares/authenticate');
const requireLawyer = require('../../middlewares/requireLawyer');
const { getProfile, updateProfile, getListings, deleteProfile } = require('./lawyers.controller');
const { validateLawyerId, validateUpdateLawyer } = require('./lawyers.validation');

// GET /api/lawyers/:id/listings?status=active
router.get('/:id/listings', authenticate, requireLawyer, validateLawyerId, getListings);

// GET /api/lawyers/:id
router.get('/:id', authenticate, requireLawyer, validateLawyerId, getProfile);

// PUT /api/lawyers/:id
router.put('/:id', authenticate, requireLawyer, validateLawyerId, validateUpdateLawyer, updateProfile);

// DELETE /api/lawyers/:id
router.delete('/:id', authenticate, requireLawyer, validateLawyerId, deleteProfile);

module.exports = router;