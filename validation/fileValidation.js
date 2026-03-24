import { body, param, query } from "express-validator";
import { lengthValidator } from "../utils/validationUtils.js";

const validateParentId = [param("parentId").exists().escape().isInt().toInt()];
const validateQueryFileId = [query("fileId").exists().escape().isInt().toInt()];

const validateFileUpload = [...validateParentId];

const validateDownloadFile = [...validateQueryFileId];

const validateDeleteFile = [...validateQueryFileId];

const validateEditFile = [
	...validateQueryFileId,
	body("newFileName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- ." })
		.withMessage("New file name must me alphanumeric"),

	lengthValidator("newFileName", { min: 1, max: 255 }),
];

export {
	validateFileUpload,
	validateDownloadFile,
	validateDeleteFile,
	validateEditFile,
};
