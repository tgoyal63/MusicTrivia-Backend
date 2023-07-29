/**
 * Defines the User model.
 *
 * @param {Sequelize} sequelize - The Sequelize instance.
 * @param {DataTypes} DataTypes - The data types.
 * @returns {typeof User} - The User model.
 */
import { Sequelize, Model, DataTypes } from "sequelize";

interface ExternalUrlAttributes {
	spotify?: string;
}

interface ExplicitContentAttributes {
	filter_enabled?: boolean;
	filter_locked?: boolean;
}

interface FollowersAttributes {
	href?: string;
	total?: number;
}

interface ImageAttributes {
	url?: string;
	height?: number | null;
	width?: number | null;
}

interface UserAttributes {
	id: string;
	email: string;
	uri: string;
	external_url?: ExternalUrlAttributes;
	country?: string;
	display_name?: string | null;
	explicit_content?: ExplicitContentAttributes | null;
	followers?: FollowersAttributes | null;
	images?: ImageAttributes[];
	product?: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
	public id!: string;
	public email!: string;
	public uri!: string;
	public external_url?: ExternalUrlAttributes;
	public country?: string;
	public display_name?: string | null;
	public explicit_content?: ExplicitContentAttributes | null;
	public followers?: FollowersAttributes | null;
	public images?: ImageAttributes[];
	public product?: string;

	public static initModel(sequelize: Sequelize): typeof User {
		User.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
				},
				email: {
					type: DataTypes.STRING,
					primaryKey: true,
				},
				uri: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				external_url: {
					type: DataTypes.JSON,
					allowNull: true,
				},
				country: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				display_name: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				explicit_content: {
					type: DataTypes.JSON,
					allowNull: true,
				},
				followers: {
					type: DataTypes.JSON,
					allowNull: true,
				},
				images: {
					type: DataTypes.ARRAY(DataTypes.JSON),
					allowNull: true,
				},
				product: {
					type: DataTypes.STRING,
					allowNull: true,
				},
			},
			{
				sequelize,
				timestamps: true,
			}
		);
		return User;
	}
}

export default User;
