import mongoose from "mongoose";

function dbConnect(): Promise<void> {
	mongoose.set("strictQuery", false);
	mongoose.connect(process.env["MONGO_URI"] ?? "");
	const db = mongoose.connection;
	return new Promise((resolve, reject) => {
		db.once("open", () => {
			console.log("Connected to MongoDB");
			resolve();
		});
		db.on("error", (error) => {
			console.error.bind(console, "connection error:");
			reject(error);
		});
	});
}

export default dbConnect;
