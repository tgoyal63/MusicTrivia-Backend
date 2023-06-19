import { Request, Response } from "express";
import SpotifyUtils from "../utils/spotify.utils";

const AuthController = {
	signIn: (req: Request, res: Response) => {
		const scope = "user-read-private user-read-email playlist-read-private user-library-read";
		res.redirect(
			`https://accounts.spotify.com/authorize?client_id=${process.env["SPOTIFY_CLIENT_ID"]}&response_type=code&redirect_uri=${process.env["SPOTIFY_REDIRECT_URI"]}&scope=${scope}&state=${process.env["SPOTIFY_STATE"]}`
		);
	},
	callback: async (req: Request, res: Response) => {
		if (!req.query["code"] || req.query["state"] !== process.env["SPOTIFY_STATE"]) {
			res.status(403).send("Invalid state parameter");
			return;
		}

		const code = String(req.query["code"]);

		const tokens = await SpotifyUtils.getAccessToken(code);
		const UserInfo = await SpotifyUtils.getUserProfile(tokens.access_token);
		console.log(tokens);
		console.log(UserInfo);

		res.redirect("/");
	},
};

export default AuthController;
