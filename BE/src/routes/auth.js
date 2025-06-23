const express = require('express');
const {
  register,
  login,
  googleLogin,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout
} = require('../controllers/authController');

const { auth } = require('../middlewares/auth');
const {
  validateRegister,
  validateLogin,
  validatePasswordUpdate,
  validateEmail,
  validatePasswordReset
} = require('../middlewares/validation');
const {
  loginRateLimit,
  passwordResetRateLimit,
  registrationRateLimit
} = require('../middlewares/rateLimit');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', registrationRateLimit, validateRegister, register);
router.post('/login', loginRateLimit, validateLogin, login);
router.post('/google', googleLogin);
router.post('/forgotpassword', passwordResetRateLimit, validateEmail, forgotPassword);
router.put('/resetpassword/:resettoken', validatePasswordReset, resetPassword);
router.get('/verifyemail/:verifytoken', verifyEmail);

// Protected routes
router.get('/me', auth, getMe);
router.put('/updatedetails', auth, updateDetails);
router.put('/updatepassword', auth, validatePasswordUpdate, updatePassword);
router.post('/logout', auth, logout);

module.exports = router;
