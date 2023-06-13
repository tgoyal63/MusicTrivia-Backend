import mongoose from "mongoose";

function dbConnect(): void {
	mongoose.set("strictQuery", false);
	mongoose.connect(process.env["MONGO_URI"] ?? "");
	const db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error:"));
	db.once("open", () => {
		console.log("Connected to MongoDB");
	});
}

export default dbConnect;
