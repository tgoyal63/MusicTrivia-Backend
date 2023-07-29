import { config } from "dotenv";
config();

import express, { Express } from "express";
import { Server } from "http";
import { createServer } from "https";
import cors, { CorsOptions } from "cors";
import { readFileSync } from "fs";
import cookieParser from "cookie-parser";
// import { initializeDatabase } from "./models";
import userRouter from "routes/user.routes";
import socket from "./socket";

const app: Express = express();
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true }));

const origin: string[] = process.env["CORS_ORIGIN"]?.split(",") || [];
const corsOptions: CorsOptions = {
	origin,
	credentials: true,
	optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());

app.use("/public", express.static("public"));

app.use("/users", userRouter);

app.get("/", (req, res) => {
	res.send("Hello World");
});

try {
	const httpsOptions = {
		key: readFileSync("./ssl_certificates/private.key"),
		cert: readFileSync("./ssl_certificates/certificate.crt"),
	};
	const sslPort: number = parseInt(process.env["PORT"] || "8443");
	const httpsServer = createServer(httpsOptions, app);
	socket(httpsServer);
	httpsServer.listen(sslPort, () => {
		console.log(`HTTPS Server is running on port ${sslPort}`);
	});
} catch (error) {
	console.log("Couldnt find SSL information, running an HTTP server instead.");
	// initializeDatabase()
	// 	.sequelize.sync()
	// 	.then(() => {
	const port: number = parseInt(process.env["PORT"] || "5000");
	const server: Server = new Server(app);
	socket(server);
	server.listen(port, () => {
		console.log(`HTTP Server is running on port ${port}`);
	});
	// });
}
