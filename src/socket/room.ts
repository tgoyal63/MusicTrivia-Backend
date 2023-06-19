import { Socket, Server } from "socket.io";
import { ACTIONS } from "constants/ACTIONS";
import { User, Room, Track } from "game";

interface SocketUserMap {
	[socketId: string]: User;
}
interface RoomMap {
	[socket: string]: Room;
}

const socketUserMap: SocketUserMap = {};

const roomMap: RoomMap = {};

const roomListeners = (socket: Socket, io: Server) => {
	socket.on(ACTIONS.JOIN, ({ user }: { user: User }) => {
		socketUserMap[socket.id] = user;
		const roomId = user.roomId;
		if (!(roomId && roomMap[roomId])) throw new Error("Room not found");
		roomMap[roomId]?.addUser(user); // huh?
		io.to(roomId).emit(ACTIONS.ADD_PEER, user);
		socket.join(roomId);
	});

	socket.on(
		ACTIONS.CREATE_ROOM,
		({ user, tracks, totalRounds }: { user: User; tracks: Track[]; totalRounds: number }) => {
			const room = new Room([user], tracks, totalRounds, user);
			user.roomId = room.roomId;
			socketUserMap[socket.id] = user;
			roomMap[room.roomId] = room;
			socket.join(room.roomId);
			socket.emit(ACTIONS.ROOM_CREATED, room.roomId);
		}
	);

	socket.on(ACTIONS.START_GAME, () => {
		const roomId = socketUserMap[socket.id]?.roomId;
		if (!(roomId && roomMap[roomId])) throw new Error("Room Not Found");
		if (roomId && roomMap[roomId]?.gameStarted) {
			throw new Error("Game already started");
		}
		const roundOneData = roomMap[roomId]?.startGame();
		io.to(roomId).emit(ACTIONS.START_GAME, roundOneData);
	});

	socket.on(ACTIONS.START_ROUND, () => {
		const roomId = socketUserMap[socket.id]?.roomId;
		if (!(roomId && roomMap[roomId])) throw new Error("Room Not Found");
		const roundData = roomMap[roomId]?.onGoingGame.onGoingRound.dataForRoundStart();
		io.to(roomId).emit(ACTIONS.START_ROUND, roundData);
	});

	socket.on(ACTIONS.ROUND_ENDED, (roundNumber) => {
		const roomId = socketUserMap[socket.id]?.roomId;
		if (!(roomId && roomMap[roomId])) throw new Error("Room Not Found");
		const roundEndData = roomMap[roomId]?.onGoingGame.onGoingRound.dataForRoundEnd(roundNumber);
		io.to(roomId).emit(ACTIONS.ROUND_ENDED, roundEndData);
		roomMap[roomId]?.onGoingGame.nextRound(roundNumber + 1);
	});

	const leaveRoom = () => {
		const roomId = socketUserMap[socket.id]?.roomId;
		if (roomId && roomMap[roomId]?.numberOfPlayers === 0) delete roomMap[roomId];
		if (roomId) roomMap[roomId]?.removeUser(socketUserMap[socket.id]);
		io.to(roomId || "").emit(ACTIONS.REMOVE_PEER, socketUserMap[socket.id]?.id);
		delete socketUserMap[socket.id];
	};
	socket.on(ACTIONS.LEAVE, leaveRoom);
	socket.on("disconnecting", leaveRoom);
};
export default roomListeners;
