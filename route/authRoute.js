const express = require('express');
const {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    logout
} = require('../controllers/authController');
const { authenticatedUser } = require('../middleware/authenticated');
const router = express.Router();

router.route('/register').post(register);
router.route('/verify-email').post(verifyEmail);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);
router.route('/logout').delete(authenticatedUser, logout);

module.exports = router;