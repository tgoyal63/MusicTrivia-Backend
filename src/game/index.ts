import { v4 as uuidv4 } from "uuid";
import SpotifyUtils from "../utils/spotify.utils";

const dummyTrack = { id: "", audio: "", title: "", artists: [] };

// unique name and unique user id
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
	currentPlaylist?: string;
	onGoingGame?: Game;
	host: User;
	previousGames: { [gameId: string]: Game } = {};
	constructor(roomHost: User) {
		this.host = roomHost;
		this.addUser(roomHost);
	}
	startGame = async (totalRounds: number) => {
		if (totalRounds < 5) throw new Error("Room must have at least 5 rounds.");
		if (!this.currentPlaylist) throw new Error("Room must have a current playlist.");
		const tracks = await SpotifyUtils.getTracksFromPlaylist(this.currentPlaylist);
		if (tracks.length < 4 * totalRounds) throw new Error(`Room must have at least ${4 * totalRounds} tracks.`);
		this.onGoingGame = new Game(tracks, this.currentPlaylist, totalRounds, this);
		if (this.gameStarted) throw new Error("Game already started.");
		this.gameStarted = true;
		return this.onGoingGame?.onGoingRound.dataForRoundStart();
	};
	setCurrentPlaylist = (playlist: string) => {
		this.currentPlaylist = playlist;
	};
	addUser = (user: User) => {
		this.numberOfPlayers++;
		if (this.players[user.id]) throw new Error("User already exists");
		this.players[user.id] = user;
	};
	removeUser = (user?: User) => {
		if (!user) throw new Error("User not found");
		if (!this.players[user.id]) throw new Error("User not found");
		delete this.players[user.id];
		this.numberOfPlayers--;
	};
}

export class Game {
	gameId = uuidv4();
	totalRounds: number;
	rounds: { [id: number]: GameRound } = {};
	playedTracks: { [id: string]: Track } = {};
	onGoingRound: GameRound;
	gameTracks: Track[];
	playlist: string;
	room: Room;
	constructor(tracks: Track[], playlist: string, totalRounds: number, room: Room) {
		this.gameTracks = tracks;
		this.playlist = playlist;
		this.onGoingRound = this.generateNewRound(1);
		this.totalRounds = totalRounds;
		this.room = room;
		if (!this.room.currentPlaylist) throw new Error("No playlist found");
	}
	generateNewRound = (roundNumber: number) => {
		const isSongRound = true || Math.random() < 0.5; // ToDo: Fix this true
		if (isSongRound) {
			if (!this.gameTracks) throw new Error("No tracks found");
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
			// ToDo: For Artist Tracks
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
