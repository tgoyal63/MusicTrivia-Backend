import { Sequelize } from "sequelize";
import Song from "./song";

export interface Database {
	sequelize: Sequelize;
	songs: typeof Song;
}

/**
 * Initializes the database connection and models.
 * @returns The database object.
 */
export function initializeDatabase(): Database {
	const dbName = process.env["DB_NAME"] || "";
	const dbUser = process.env["DB_USER"] || "";
	const dbPassword = process.env["DB_PASSWORD"] || "";
	const host = process.env["DB_HOST"] || "";
	const dialect = "postgres";
	const pool = {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	};
	if (!dbName || !dbUser || !dbPassword || !host) {
		throw new Error("Missing database configuration");
	}

	const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
		host,
		dialect,
		pool,
	});

	const db: Database = {
		sequelize,
		songs: Song.initModel(sequelize),
	};

	return db;
}
