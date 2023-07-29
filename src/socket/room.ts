import { Socket, Server } from "socket.io";
import { ACTIONS } from "constants/ACTIONS";
import { User, Room } from "game";

interface SocketUserMap {
	[socketId: string]: User;
}
interface RoomMap {
	[socket: string]: Room;
}

const socketUserMap: SocketUserMap = {};

const roomMap: RoomMap = {};

const checkRoom = (roomId: string) => {
	if (!(roomId && roomMap[roomId])) throw new Error("Room not found");
	return roomMap[roomId] as Room;
};

const roomListeners = (socket: Socket, io: Server) => {
	socket.on(ACTIONS.JOIN, ({ user }: { user: User }) => {
		try {
			if (!user) throw new Error("User not found");
			user.id = socket.id;
			socketUserMap[socket.id] = user;
			const roomId = user.roomId;
			if (!roomId) throw new Error("Room not found");
			const room = checkRoom(roomId);
			if (room) room.addUser(user);
			io.to(roomId).emit(ACTIONS.ADD_PEER, user);
			socket.join(roomId);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.JOIN}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	socket.on(ACTIONS.CREATE_ROOM, ({ user }: { user: User }) => {
		try {
			if (!user) throw new Error("User not found");
			user.id = socket.id;
			const room = new Room(user);
			user.roomId = room.roomId;
			socketUserMap[socket.id] = user;
			roomMap[room.roomId] = room;
			socket.join(room.roomId);
			socket.emit(ACTIONS.ROOM_CREATED, room.roomId);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.CREATE_ROOM}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	socket.on(ACTIONS.SET_PLAYLIST, ({ playlist }: { playlist: string }) => {
		try {
			if (!playlist) throw new Error("Playlist not found");
			const user = socketUserMap[socket.id] as User;
			if (!user) throw new Error("User not found");
			const roomId = user.roomId as string;
			const room = checkRoom(roomId);
			if (user.id !== room.host.id) throw new Error("You are not the host");
			room.setCurrentPlaylist(playlist);
			io.to(roomId).emit(ACTIONS.SET_PLAYLIST, playlist);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.SET_PLAYLIST}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	socket.on(ACTIONS.START_GAME, async ({ totalRounds }: { totalRounds: number }) => {
		try {
			if (!totalRounds) throw new Error("Total Rounds not found");
			const user = socketUserMap[socket.id] as User;
			if (!user) throw new Error("User not found");
			const roomId = user.roomId as string;
			const room = checkRoom(roomId);
			if (user.id !== room.host.id) throw new Error("You are not the host");
			const roundOneData = await room.startGame(totalRounds);
			io.to(roomId).emit(ACTIONS.START_GAME, roundOneData);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.START_GAME}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	socket.on(ACTIONS.START_ROUND, () => {
		try {
			const user = socketUserMap[socket.id] as User;
			if (!user) throw new Error("User not found");
			const roomId = user.roomId as string;
			const room = checkRoom(roomId);
			if (!room.onGoingGame) throw new Error("Game Not Started");
			const roundData = room.onGoingGame.onGoingRound.dataForRoundStart();
			io.to(roomId).emit(ACTIONS.START_ROUND, roundData);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.START_ROUND}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	socket.on(ACTIONS.ROUND_ENDED, (roundNumber: number) => {
		try {
			const roomId = socketUserMap[socket.id]?.roomId as string;
			const room = checkRoom(roomId);
			const roundEndData = room.onGoingGame?.onGoingRound.dataForRoundEnd(roundNumber);
			io.to(roomId).emit(ACTIONS.ROUND_ENDED, roundEndData);
			const totalRounds = room.onGoingGame?.totalRounds || 0;
			if (totalRounds < roundNumber) room.onGoingGame?.nextRound(roundNumber + 1);
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.ROUND_ENDED}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	});

	const leaveRoom = () => {
		try {
			const roomId = socketUserMap[socket.id]?.roomId as string;
			const room = checkRoom(roomId);
			if (room) room.removeUser(socketUserMap[socket.id]);
			if (room.numberOfPlayers === 0) delete roomMap[roomId];
			io.to(roomId || "").emit(ACTIONS.REMOVE_PEER, socketUserMap[socket.id]?.id);
			delete socketUserMap[socket.id];
		} catch (error) {
			console.error(`Error occurred during ${ACTIONS.LEAVE}:`, error);
			if (error instanceof Error) socket.emit(ACTIONS.ERROR, error.message);
		}
	};
	socket.on(ACTIONS.LEAVE, leaveRoom);
	socket.on("disconnecting", leaveRoom);
};
export default roomListeners;
