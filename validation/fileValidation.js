import { body, param, query } from "express-validator";
import { lengthValidator } from "../utils/validationUtils.js";

const validateParentId = [param("parentId").exists().escape().isUUID()];
const validateQueryFileId = [query("fileId").exists().escape().isUUID()];

const validateFileUpload = [...validateParentId];

const validateDownloadFile = [...validateQueryFileId];

const validateDeleteFile = [...validateQueryFileId];

const validateEditFile = [
	...validateQueryFileId,
	body("newFileName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- .()" })
		.withMessage("New file name must only contain letters and symbols"),

	lengthValidator("newFileName", { min: 1, max: 50 }),
];

const validateGetSharedFile = [
	param("parentShareUUID").exists().escape().isUUID(),
	query("fileId").exists().escape().isUUID(),
];

const validateShareFile = [
	...validateQueryFileId,
	body("duration").exists().escape().isInt().toInt(),
];

export {
	validateFileUpload,
	validateDownloadFile,
	validateDeleteFile,
	validateEditFile,
	validateGetSharedFile,
	validateShareFile,
};
