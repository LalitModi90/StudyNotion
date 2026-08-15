/** @format */

const { instance } = require("../config/razorpay");
const Course = require("../models/course");
const User = require("../models/user");
const crypto = require("crypto");

const mailSender = require("../utils/mailsender");
const {
	courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

// Capture Payment
exports.capturePayment = async (req, res) => {
	try {
		const { courseId } = req.body;
		const userId = req.user.id;

		// Check course ID
		if (!courseId) {
			return res.status(400).json({
				success: false,
				message: "Please provide a valid course ID",
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

		// Check already enrolled
		const alreadyEnrolled = course.studentsEnrolled?.some(
			(id) => id.toString() === userId.toString(),
		);

		if (alreadyEnrolled) {
			return res.status(400).json({
				success: false,
				message: "Student is already enrolled",
			});
		}

		// Get course price
		const amount = Number(course.price);

		if (isNaN(amount) || amount <= 0) {
			return res.status(400).json({
				success: false,
				message: "Invalid course price",
			});
		}

		// Create Razorpay order
		const options = {
			amount: Math.round(amount * 100),
			currency: "INR",
			receipt: `course_${courseId}_${Date.now()}`,

			notes: {
				courseId: courseId.toString(),
				userId: userId.toString(),
			},
		};

		const paymentResponse = await instance.orders.create(options);

		return res.status(200).json({
			success: true,
			message: "Payment order created successfully",
			orderId: paymentResponse.id,
			amount: paymentResponse.amount,
			currency: paymentResponse.currency,
		});
	} catch (error) {
		console.error("Payment Error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while creating payment order",
		});
	}
};

// Verify Razorpay Webhook
exports.verifySignature = async (req, res) => {
	try {
		// Get signature
		const signature = req.headers["x-razorpay-signature"];

		if (!signature) {
			return res.status(400).json({
				success: false,
				message: "Razorpay signature is missing",
			});
		}

		// Get webhook secret
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

		if (!webhookSecret) {
			return res.status(500).json({
				success: false,
				message: "Webhook secret is not configured",
			});
		}

		// Verify signature
		const rawBody = req.rawBody;

		if (!rawBody) {
			return res.status(500).json({
				success: false,
				message: "Raw webhook body is missing",
			});
		}

		const expectedSignature = crypto
			.createHmac("sha256", webhookSecret)
			.update(rawBody)
			.digest("hex");

		if (signature !== expectedSignature) {
			return res.status(400).json({
				success: false,
				message: "Invalid webhook signature",
			});
		}

		console.log("Payment is Authorized");

		// Check payment event
		if (req.body.event !== "payment.captured") {
			return res.status(200).json({
				success: true,
				message: "Webhook received",
			});
		}

		// Get payment details
		const payment = req.body?.payload?.payment?.entity;

		if (!payment) {
			return res.status(400).json({
				success: false,
				message: "Payment details not found",
			});
		}

		// Get course and user ID
		const { courseId, userId } = payment.notes || {};

		if (!courseId || !userId) {
			return res.status(400).json({
				success: false,
				message: "Course ID or User ID is missing",
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

		// Check already enrolled
		const alreadyEnrolled = course.studentsEnrolled?.some(
			(id) => id.toString() === userId.toString(),
		);

		if (alreadyEnrolled) {
			return res.status(200).json({
				success: true,
				message: "Student is already enrolled",
			});
		}

		// Find user
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Enroll student
		await Course.findByIdAndUpdate(
			courseId,
			{
				$addToSet: {
					studentsEnrolled: userId,
				},
			},
			{
				new: true,
			},
		);

		// Add course to user
		await User.findByIdAndUpdate(
			userId,
			{
				$addToSet: {
					courses: courseId,
				},
			},
			{
				new: true,
			},
		);

		console.log("Student enrolled successfully");

		// Send enrollment email
		try {
			const emailResponse = await mailSender(
				user.email,
				"Course Enrollment Confirmation",
				courseEnrollmentEmail(user.firstName, course.courseName),
			);

			console.log("Enrollment email sent successfully:", emailResponse);
		} catch (emailError) {
			console.error("Enrollment email failed:", emailError);
		}

		return res.status(200).json({
			success: true,
			message: "Payment verified and student enrolled successfully",
		});
	} catch (error) {
		console.error("Webhook Verification Error:", error);

		return res.status(500).json({
			success: false,
			message: "Something went wrong while processing webhook",
		});
	}
};

exports.verifyPayment = exports.verifySignature;
exports.sendPaymentSuccessEmail = async (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Payment success email endpoint is available",
	});
};
