/** @format */

const express = require("express");

const router = express.Router();

// Payment controllers
const { capturePayment, verifySignature } = require("../controller/payment");

// Auth middleware
const { auth, isStudent } = require("../middlewares/auth");

// Create payment
router.post("/capturePayment", auth, isStudent, capturePayment);

// Razorpay webhook
router.post("/verifySignature", verifySignature);

module.exports = router;
