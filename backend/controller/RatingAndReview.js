/** @format */

const mongoose = require("mongoose");
const Course = require("../models/course");
const RatingAndReview = require("../models/RatingAndReview");
const User = require("../models/user");

exports.createRating = async (req, res) => {
	try {
		const { courseId, rating, review } = req.body;
		const userId = req.user.id;

		// Check required fields
		if (!courseId || !rating || !review) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// Check student enrolled in course
		const courseDetails = await Course.findOne({
			_id: courseId,
			studentsEnrolled: {
				$elemMatch: {
					$eq: userId,
				},
			},
		});

		if (!courseDetails) {
			return res.status(400).json({
				success: false,
				message: "Student is not enrolled in this course",
			});
		}

		// Check already reviewed
		const already = await RatingAndReview.findOne({
			user: userId,
			course: courseId,
		});

		if (already) {
			return res.status(400).json({
				success: false,
				message: "You have already reviewed this course",
			});
		}

		// Check rating
		if (rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: "Rating must be between 1 and 5",
			});
		}

		// Check user exists
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Create rating and review
		const newRatingAndReview = await RatingAndReview.create({
			user: userId,
			course: courseId,
			rating: rating,
			review: review,
		});

		// Add review to course
		courseDetails.ratingAndReviews.push(newRatingAndReview._id);

		await courseDetails.save();

		return res.status(201).json({
			success: true,
			message: "Rating and review created successfully",
			ratingAndReview: newRatingAndReview,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while creating rating and review",
			error: error.message,
		});
	}
};
exports.getAvgRating = async (req, res) => {
	try {
		const { courseId } = req.body;

		if (!courseId) {
			return res.status(400).json({
				success: false,
				message: "Course ID is required",
			});
		}

		const result = await RatingAndReview.aggregate([
			{
				$match: {
					course: new mongoose.Types.ObjectId(courseId),
				},
			},
			{
				$group: {
					_id: null,
					averageRating: {
						$avg: "$rating",
					},
				},
			},
		]);

		if (result.length === 0) {
			return res.status(200).json({
				success: true,
				message: "No rating found",
				averageRating: 0,
				totalReviews: 0,
			});
		}

		return res.status(200).json({
			success: true,
			message: "Average rating fetched successfully",
			averageRating: result[0].averageRating,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong",
			error: error.message,
		});
	}
};

exports.getAllRatingAndReview = async (req, res) => {
	try {
		const allRatingAndReview = await (
			await RatingAndReview.find({})
		)
			.sort({ rating: "desc" })
			.populate({
				path: "user",
				select: "firstName lastName email image",
			})
			.populate({
				path: "course",
				select: "courseName",
			})
			.exec();

		if (allRatingAndReview.length === 0) {
			return res.status(200).json({
				success: true,
				message: "No rating and review found",
				ratingAndReview: [],
			});
		}

		return res.status(200).json({
			success: true,
			message: "All rating and review fetched successfully",
			data: allRatingAndReview,
		});
	} catch (error) {
		console.log(error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while fetching rating and review",
			error: error.message,
		});
	}
};

exports.getAverageRating = exports.getAvgRating;
exports.getAllRating = exports.getAllRatingAndReview;
