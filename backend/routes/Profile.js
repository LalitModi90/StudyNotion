/** @format */

const express = require("express");

const router = express.Router();

// Profile controllers
const {
	deleteAccount,
	updateProfile,
	getAllUserDetails,
	updateDisplayPicture,
	getEnrolledCourses,
	instructorDashboard,
} = require("../controller/profile");

// Auth middleware
const { auth, isInstructor } = require("../middlewares/auth");

// Delete account
router.delete("/deleteProfile", auth, deleteAccount);

// Update profile
router.put("/updateProfile", auth, updateProfile);

// Get user details
router.get("/getUserDetails", auth, getAllUserDetails);

// Get enrolled courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

// Update display picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

// Instructor dashboard
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
