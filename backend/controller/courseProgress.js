/** @format */

const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/course");

// Update Course Progress
exports.updateCourseProgress = async (req, res) => {
	try {
		const { courseId, subSectionId } = req.body;

		const userId = req.user.id;

		// Check required fields
		if (!courseId || !subSectionId) {
			return res.status(400).json({
				success: false,
				message: "Course ID and SubSection ID are required",
			});
		}

		// Find course
		const course = await Course.findById(courseId);

		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}

		// Find progress
		let courseProgress = await CourseProgress.findOne({
			courseID: courseId,
			userId: userId,
		});

		// Create progress if not found
		if (!courseProgress) {
			courseProgress = await CourseProgress.create({
				courseID: courseId,
				userId: userId,
				completedVideos: [subSectionId],
			});
		} else {
			// Check video already completed
			const alreadyCompleted = courseProgress.completedVideos.some(
				(id) => id.toString() === subSectionId.toString(),
			);

			// Add video
			if (!alreadyCompleted) {
				courseProgress.completedVideos.push(subSectionId);

				await courseProgress.save();
			}
		}

		// Calculate progress
		const totalVideos = courseProgress.completedVideos.length;

		return res.status(200).json({
			success: true,
			message: "Course progress updated successfully",
			data: courseProgress,
		});
	} catch (error) {
		console.log("Course Progress Error:", error);

		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
