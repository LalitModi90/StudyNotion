/** @format */

const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);

		console.log("Database connected successfully");
	} catch (error) {
		console.log("Database connection failed");
		console.log(error);

		process.exit(1);
	}
};
