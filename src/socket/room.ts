import { Socket, Server } from "socket.io";
import { ACTIONS } from "constants/ACTIONS";

const codeEditorListeners = (socket: Socket, io: Server): void => {
	socket.on(ACTIONS.JOIN, ({ roomId }: { roomId: string }) => {
		console.log(`${socket.id} joined room ${roomId}`);
	});

	socket.on(ACTIONS.LEAVE, ({ roomId }: { roomId: string }) => {
		io.to(roomId).emit(ACTIONS.LEAVE, {});
	});
};

export default codeEditorListeners;
