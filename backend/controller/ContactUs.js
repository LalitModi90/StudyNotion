/** @format */

const mailSender = require("../utils/mailsender");

const { contactUsEmail } = require("../mail/templates/contactFormRes");

exports.contactUs = async (req, res) => {
	try {
		const { firstName, lastName, email, phoneNo, message } = req.body;

		// Check required fields
		if (!firstName || !lastName || !email || !phoneNo || !message) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		// Admin email
		const adminEmail = process.env.ADMIN_EMAIL;

		// Send mail to user
		await mailSender(
			email,
			"Contact Form Confirmation",
			contactUsEmail(firstName, lastName, email, phoneNo, message),
		);

		// Send mail to admin
		await mailSender(
			adminEmail,
			"New Contact Us Request",
			contactUsEmail(firstName, lastName, email, phoneNo, message),
		);

		return res.status(200).json({
			success: true,
			message: "Message sent successfully",
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

exports.contactUsController = exports.contactUs;
