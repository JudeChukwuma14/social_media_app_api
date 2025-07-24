const express = require('express');
const router = express.Router();
const { registerAccount, verifyOtp, resendOtp, forgotPassword, resetPassword, resendForgotPasswordOtp, loginUser } = require('../controller/userController');
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many registration attempts from this IP, please try again after 15 minutes'
});

const resendOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: 'Too many OTP requests from this IP, please try again after 15 minutes'
});


router.post('/register',registerLimiter, registerAccount)
router.post('/verify-otp', verifyOtp)
router.post("/resend-otp", resendOtpLimiter, resendOtp)
router.post("/forgot-password", forgotPassword)
router.post("/resend-forgot-password-otp", resendForgotPasswordOtp)
router.post("/reset-password", resetPassword)
router.post("/login", loginUser)



module.exports = router;