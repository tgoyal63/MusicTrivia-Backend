import * as sequelize from "sequelize";
import User from "../models/user";

module.exports = {
	/**
	 * Creates a new user in the database.
	 * @param user The user to create.
	 * @returns The created user.
	 * @throws An error if the user could not be created.
	 * @throws An error if the user already exists.
	 */
	async create(user: User): Promise<User> {
		try {
			const createdUser = await User.create(user);
			return createdUser;
		} catch (error) {
			if (error instanceof sequelize.UniqueConstraintError) {
				throw new Error("User already exists");
			} else if (error instanceof sequelize.ValidationError) {
				throw new Error("Invalid user");
			} else {
				throw error;
			}
		}
	},

	/**
	 * Gets a user by their id.
	 * @param id The id of the user to get.
	 * @returns The user with the given id.
	 * @throws An error if the user could not be found.
	 */
	async getById(id: string): Promise<User> {
		const user = await User.findByPk(id);
		if (!user) throw new Error("User not found");
		return user;
	},

	/**
	 * Gets a user by their email.
	 * @param email The email of the user to get.
	 * @returns The user with the given email.
	 * @throws An error if the user could not be found.
	 */
	async getByEmail(email: string): Promise<User> {
		const user = await User.findOne({ where: { email } });
		if (!user) throw new Error("User not found");
		return user;
	},

	/**
	 * Updates a user in the database.
	 * @param user The user to update.
	 * @returns The updated user.
	 * @throws An error if the user could not be updated.
	 */
	async update(user: User): Promise<User> {
		const updatedUser = await user.save();
		if (!updatedUser) throw new Error("User not updated");
		return updatedUser;
	},

	/**
	 * Deletes a user from the database.
	 * @param user The user to delete.
	 * @returns The deleted user.
	 */
	async delete(user: User): Promise<User> {
		await user.destroy();
		return user;
	},
};
