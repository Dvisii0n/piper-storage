import { body, param, query } from "express-validator";
import { lengthValidator } from "../utils/validationUtils.js";

const validateFolderName = [
	body("folderName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- " })
		.withMessage("Folder name can only contain letters and numbers"),

	lengthValidator("folderName", { min: 1, max: 50 }),
];

const validateNewFolderName = [
	body("newFolderName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- " })
		.withMessage("New folder name can only contain letters and numbers"),

	lengthValidator("newFolderName", { min: 1, max: 50 }),
];

const validateFolderId = [param("id").exists().escape().isUUID()];

const validateParentId = [param("parentId").exists().escape().isUUID()];

const validateGetFolder = [
	...validateFolderId,
	query("uploadError").escape().isString().optional(),
];

const validateCreateFolder = [...validateParentId, ...validateFolderName];

const validateEditFolder = [...validateFolderId, ...validateNewFolderName];

const validateDeleteFolder = [...validateFolderId];

const validateCreateSharedFolder = [
	...validateFolderId,
	body("duration").exists().escape().isInt().toInt(),
];

const validateShareId = [query("shareId").exists().isUUID()];

const validateGetSharedFolder = [
	param("folderUUID").exists().escape().isUUID(),
];

const validateGetHome = [query("uploadError").escape().isString().optional()];

export {
	validateGetFolder,
	validateFolderName,
	validateCreateFolder,
	validateEditFolder,
	validateDeleteFolder,
	validateCreateSharedFolder,
	validateShareId,
	validateGetSharedFolder,
	validateGetHome,
};
