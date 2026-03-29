import { body } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { lengthValidator } from "../utils/validationUtils.js";

const pwLength = { min: 8, max: 255 };
const usernameLength = { min: 3, max: 255 };
const emailLength = { min: 8, max: 255 };

const validateSignUp = [
	body("email")
		.trim()
		.escape()
		.isEmail()
		.withMessage("Please enter a valid email")
		.custom(async (value) => {
			const user = await prisma.user.findFirst({ where: { email: value } });
			if (user) {
				throw new Error("Email is already taken");
			}
		}),

	lengthValidator("email", emailLength),

	body("username")
		.trim()
		.escape()
		.isAlphanumeric()
		.withMessage("Username must only contain letters and numbers")
		.custom(async (value) => {
			const user = await prisma.user.findFirst({ where: { username: value } });
			if (user) {
				throw new Error("Username is already taken");
			}
		}),

	lengthValidator("username", usernameLength),

	body("password")
		.trim()
		.isStrongPassword({
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		})
		.withMessage(
			"Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol",
		),
];

const validateLogin = [
	body("username").trim().escape().isAlphanumeric(),

	lengthValidator("username", usernameLength),

	body("password")
		.trim()
		.isStrongPassword()
		.withMessage("Password must only contain letters and numbers or symbols"),

	,
	lengthValidator("password", pwLength),
];

export { validateSignUp, validateLogin };
