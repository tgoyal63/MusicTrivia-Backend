import { v4 as uuidv4 } from "uuid";

const dummyTrack = { id: "", audio: "", title: "", artists: [] };

export interface User {
	id: string;
	name: string;
	avatar: string;
	score?: number;
	rank?: number;
	roomId: string;
}

export interface Track {
	id: string;
	audio: string;
	title: string;
	artists: string[];
}

export class Room {
	roomId = uuidv4();
	gameStarted = false;
	players: { [id: string]: User } = {};
	numberOfPlayers = 0;
	onGoingGame: Game;
	roomHost: User;
	previousGames: { [gameId: string]: Game } = {};
	constructor(players: User[], tracks: Track[], totalRounds: number, roomHost: User) {
		if (tracks.length < 20) {
			throw new Error("Room must have at least 20 tracks");
		}
		players.forEach((player) => {
			this.players[player.id] = player;
			this.numberOfPlayers++;
		});
		this.onGoingGame = new Game(tracks, totalRounds, this);
		this.roomHost = roomHost;
	}
	startGame = () => {
		if (this.numberOfPlayers < 2) throw new Error("Room must have atleast 2 player.");
		this.gameStarted = true;
		return this.onGoingGame.onGoingRound.dataForRoundStart();
	};
	addUser = (user: User) => {
		this.numberOfPlayers++;
		this.players[user.id] = user;
	};
	removeUser = (user?: User) => {
		if (user) {
			delete this.players[user.id];
			this.numberOfPlayers--;
		}
	};
}

export class Game {
	gameId = uuidv4();
	totalRounds: number;
	rounds: { [id: number]: GameRound } = {};
	playedTracks: { [id: string]: Track } = {};
	onGoingRound: GameRound;
	gameTracks: Track[];
	room: Room;
	constructor(tracks: Track[], totalRounds: number, room: Room) {
		this.gameTracks = tracks;
		this.onGoingRound = this.generateNewRound(1);
		this.totalRounds = totalRounds;
		this.room = room;
	}
	generateNewRound = (roundNumber: number) => {
		const isSongRound = true || Math.random() < 0.5;
		if (isSongRound) {
			// select 4 random Track.names from element.title of each Track in gameTracks array
			const randomTracks = this.gameTracks.sort(() => Math.random() - 0.5);
			const uniqueRandomTracks = randomTracks.filter((Track) => {
				if (!this.playedTracks[Track.id]) {
					return true;
				}
				return false;
			});
			const fourRandomTracks = uniqueRandomTracks.slice(0, 4);
			// select 1 Track from fourRandomTracks array
			const answerTrack = fourRandomTracks[Math.floor(Math.random() * fourRandomTracks.length)];
			if (!answerTrack) throw new Error("No answer Track found");
			const fourRandomTrackNames = fourRandomTracks.map((Track) => Track.title);
			this.playedTracks[answerTrack.id] = answerTrack;
			return new GameRound(answerTrack, fourRandomTrackNames, isSongRound, roundNumber, this, this.room);
		} else {
			// to be coded
			return new GameRound(dummyTrack, [], isSongRound, roundNumber, this, this.room);
		}
	};
	nextRound = (newRoundNumber: number) => {
		if (this.onGoingRound.roundNumber !== newRoundNumber - 1) throw new Error("Round not found");
		this.onGoingRound.ongoing = false;
		this.playedTracks[this.onGoingRound.answerTrack.id] = this.onGoingRound.answerTrack;
		this.rounds[newRoundNumber - 1] = this.onGoingRound;
		this.onGoingRound = this.generateNewRound(newRoundNumber);
	};
}

export class GameRound {
	isSongRound: boolean;
	answerTrack: Track;
	options: string[];
	ongoing: boolean;
	roundNumber: number;
	game: Game;
	room: Room;
	constructor(Track: Track, options: string[], isSongRound: boolean, roundNumber: number, game: Game, room: Room) {
		this.answerTrack = Track;
		this.options = options;
		this.ongoing = true;
		this.isSongRound = isSongRound;
		this.roundNumber = roundNumber;
		this.game = game;
		this.room = room;
	}
	dataForRoundStart = () => {
		this.ongoing = true;
		return {
			roundNumber: this.roundNumber,
			audio: this.answerTrack.audio,
			options: this.options,
		};
	};
	dataForRoundEnd = (roundNumber: number) => {
		if (roundNumber !== this.roundNumber) throw new Error("invalid roundnumber");
		this.ongoing = false;
		return {
			roundNumber: this.roundNumber,
			track: this.answerTrack,
		};
	};
}
