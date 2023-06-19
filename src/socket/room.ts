import { Socket, Server } from "socket.io";
import { ACTIONS } from "constants/ACTIONS";
import { User, Room, Track } from "game";

interface SocketUserMap {
	[socketId: string]: User;
}
interface RoomMap {
	[roomId: string]: Room;
}

const socketUserMap: SocketUserMap = {};

const roomMap: RoomMap = {};

const roomListeners = (socket: Socket, io: Server) => {
	socket.on(ACTIONS.JOIN, ({ user }: { user: User }) => {
		socketUserMap[socket.id] = user;
		const roomId = user.roomId;
		// roomMap[roomId].addUser(user);
		io.to(roomId).emit(ACTIONS.ADD_PEER, user);
		socket.join(roomId);
	});

	socket.on(
		ACTIONS.CREATE_ROOM,
		({ user, tracks, totalRounds }: { user: User; tracks: Track[]; totalRounds: number }) => {
			const room = new Room([user], tracks, totalRounds);
			user.roomId = room.roomId;
			socketUserMap[socket.id] = user;
			roomMap[room.roomId] = room;
			socket.join(room.roomId);
			socket.emit(ACTIONS.ROOM_CREATED, room.roomId);
		}
	);

	const leaveRoom = () => {
		const roomId = socketUserMap[socket.id]?.roomId;
		if (roomId && roomMap[roomId]?.numberOfPlayers === 0) delete roomMap[roomId];
		io.to(roomId || "").emit(ACTIONS.REMOVE_PEER, socketUserMap[socket.id]?.id);
		delete socketUserMap[socket.id];
	};
	socket.on(ACTIONS.LEAVE, leaveRoom);
	socket.on("disconnecting", leaveRoom);
};
export default roomListeners;
