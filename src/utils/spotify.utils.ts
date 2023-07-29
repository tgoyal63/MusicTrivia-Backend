import axios, { AxiosError, AxiosResponse } from "axios";
import { Client, Track } from "spotify-api.js";
import { Track as GameTrack } from "game";

const spotifyClientId: string = process.env["SPOTIFY_CLIENT_ID"] || "";
const spotifyClientSecret: string = process.env["SPOTIFY_CLIENT_SECRET"] || "";
const redirect_uri: string = process.env["SPOTIFY_REDIRECT_URI"] || "";

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	scope: string;
	refresh_token: string;
}

interface UserResponse {
	id: string;
	email: string;
	uri: string;
	external_urls: {
		spotify: string;
	};
	country?: string;
	display_name?: string | null;
	explicit_content?: {
		filter_enabled: boolean;
		filter_locked: boolean;
	};
	followers?: {
		href: string | null;
		total: number;
	};
	images?: Array<{
		url: string;
		height?: number | null;
		width?: number | null;
	}>;
	product?: string;
	type: "user";
}

class SpotifyUtils {
	client?: Client;

	getClient = async () => {
		if (this.client) return this.client;
		const client = await Client.create({
			refreshToken: true, // Set this to true.
			token: {
				clientID: spotifyClientId || "", // Your spotify application client id.
				clientSecret: spotifyClientSecret || "", // Your spotify application client secret.
			},
			// This event is emitted whenever the token is refreshed by either 429 requests or [Client.refresh] method.
			onRefresh() {
				console.log(`Token has been refreshed. New token: ${client.token}!`);
			},
		});
		this.client = client;
		return client;
	};

	getAccessToken = async (code: string): Promise<TokenResponse> => {
		const requestBody = `grant_type=authorization_code&code=${encodeURIComponent(
			code || ""
		)}&redirect_uri=${encodeURIComponent(redirect_uri || "")}`;

		const authOptions = {
			url: "https://accounts.spotify.com/api/token",
			method: "POST",
			headers: {
				Authorization: "Basic " + Buffer.from(spotifyClientId + ":" + spotifyClientSecret).toString("base64"),
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: requestBody,
		};

		try {
			const response: AxiosResponse<TokenResponse> = await axios(authOptions);
			// update tokens in db here
			return response.data;
		} catch (error) {
			// Handle the error of user not added to the developer portal separately
			if (error instanceof AxiosError && error.response?.status === 401) throw new Error(error.message);
			else throw error;
		}
	};

	getUserProfile = async (accessToken: string): Promise<UserResponse> => {
		const userProfileOptions = {
			url: "https://api.spotify.com/v1/me",
			headers: {
				Authorization: "Bearer " + accessToken,
			},
		};
		try {
			const response: AxiosResponse<UserResponse> = await axios(userProfileOptions);
			return response.data;
		} catch (error) {
			// Handle the error of user not added to the developer portal separately
			if (error instanceof AxiosError && error.response?.status === 401) throw new Error(error.message);
			else throw error;
		}
	};

	getTracksFromPlaylist = async (playlist: string) => {
		if (!this.client) this.client = await this.getClient();
		const data = await this.client.playlists.getTracks(playlist);
		const finalData: GameTrack[] = [];
		data.forEach((track) => {
			const trackData = track?.track as Track;
			finalData.push({
				audio: trackData?.previewURL,
				title: trackData?.name,
				artists: trackData?.artists.map((artist) => artist.name),
				id: trackData?.id,
			});
		});
		return finalData;
	};
}

export default new SpotifyUtils();
