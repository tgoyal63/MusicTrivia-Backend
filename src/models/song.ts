/**
 * Defines the Song model.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The data types.
 * @returns {typeof Song} - The Song model.
 */
import { Sequelize, Model, DataTypes } from "sequelize";

interface SongAttributes {
	id: number;
	preview_url: string;
	album: string;
	name: string;
	artists: string;
	spotify_url: string;
}

class Song extends Model<SongAttributes> implements SongAttributes {
	public id!: number;
	public preview_url!: string;
	public album!: string;
	public name!: string;
	public artists!: string;
	public spotify_url!: string;

	public static initModel(sequelize: Sequelize): typeof Song {
		Song.init(
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				preview_url: {
					type: DataTypes.STRING,
				},
				album: {
					type: DataTypes.STRING,
				},
				name: {
					type: DataTypes.STRING,
				},
				artists: {
					type: DataTypes.STRING,
				},
				spotify_url: {
					type: DataTypes.STRING,
				},
			},
			{
				sequelize,
			}
		);
		return Song;
	}
}

export default Song;
