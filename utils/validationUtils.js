import { body } from "express-validator";
import { capitalize } from "../utils/utils.js";

export const lengthValidator = (name, { min, max }) => {
	return body(name)
		.isLength({ min: min })
		.withMessage(`${capitalize(name)} must be at least ${min} characters long`)
		.isLength({ max: max })
		.withMessage(`${capitalize(name)} must be shorter than ${max} characters`);
};
