import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Socket, Server } from "socket.io";
import roomListeners from "socket/room";

const origin: string[] = process.env["CORS_ORIGIN"]?.split(",") || [];

export default function initializeSocket(server: HttpServer | HttpsServer): void {
	const io: Server = new Server(server, {
		serveClient: false,
		cors: {
			origin,
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket: Socket) => {
		roomListeners(socket, io);
	});
}
