/** @format */

const express = require("express");

const router = express.Router();

// Course controllers
const {
	createCourse,
	getAllCourses,
	getCourseDetails,
	getFullCourseDetails,
	editCourse,
	getInstructorCourses,
	deleteCourse,
} = require("../controllers/Course");

// Category controllers
const {
	showAllCategories,
	createCategory,
	categoryPageDetails,
} = require("../controllers/Category");

// Section controllers
const {
	createSection,
	updateSection,
	deleteSection,
} = require("../controllers/Section");

// SubSection controllers
const {
	createSubSection,
	updateSubSection,
	deleteSubSection,
} = require("../controllers/Subsection");

// Rating controllers
const {
	createRating,
	getAverageRating,
	getAllRating,
} = require("../controllers/RatingAndReview");

// Course progress controller
const { updateCourseProgress } = require("../controllers/courseProgress");

// Auth middleware
const {
	auth,
	isInstructor,
	isStudent,
	isAdmin,
} = require("../middlewares/auth");

// Create course
router.post("/createCourse", auth, isInstructor, createCourse);

// Add section
router.post("/addSection", auth, isInstructor, createSection);

// Update section
router.post("/updateSection", auth, isInstructor, updateSection);

// Delete section
router.post("/deleteSection", auth, isInstructor, deleteSection);

// Add subsection
router.post("/addSubSection", auth, isInstructor, createSubSection);

// Update subsection
router.post("/updateSubSection", auth, isInstructor, updateSubSection);

// Delete subsection
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);

// Get all courses
router.get("/getAllCourses", getAllCourses);

// Get course details
router.post("/getCourseDetails", getCourseDetails);

// Get full course details
router.post("/getFullCourseDetails", auth, getFullCourseDetails);

// Edit course
router.post("/editCourse", auth, isInstructor, editCourse);

// Get instructor courses
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);

// Delete course
router.delete("/deleteCourse", auth, isInstructor, deleteCourse);

// Update course progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// Create category
router.post("/createCategory", auth, isAdmin, createCategory);

// Get all categories
router.get("/showAllCategories", showAllCategories);

// Get category page details
router.post("/getCategoryPageDetails", categoryPageDetails);

// Create rating
router.post("/createRating", auth, isStudent, createRating);

// Get average rating
router.get("/getAverageRating", getAverageRating);

// Get all reviews
router.get("/getReviews", getAllRating);

module.exports = router;
