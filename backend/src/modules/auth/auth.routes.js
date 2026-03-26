const express = require('express');
const router = express.Router();

const { register, login, forgotPasswordHandler, resetPasswordHandler } = require('./auth.controller');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('./auth.validation');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, forgotPasswordHandler);

// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, resetPasswordHandler);

module.exports = router;