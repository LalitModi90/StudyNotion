/** @format */

const express = require("express");

const router = express.Router();

// Auth controllers
const {
	login,
	signup,
	sendotp,
	changePassword,
} = require("../controllers/Auth");

// Reset password controllers
const {
	resetPasswordToken,
	resetPassword,
} = require("../controllers/ResetPassword");

// Auth middleware
const { auth } = require("../middlewares/auth");

// Login
router.post("/login", login);

// Signup
router.post("/signup", signup);

// Send OTP
router.post("/sendotp", sendotp);

// Change password
router.post("/changepassword", auth, changePassword);

// Send reset password link
router.post("/reset-password-token", resetPasswordToken);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;
