import { body, param, query } from "express-validator";
import { lengthValidator } from "../utils/validationUtils.js";

const validateFolderName = [
	body("folderName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- " })
		.withMessage("Folder name can only contain letters and numbers"),

	lengthValidator("folderName", { min: 1, max: 255 }),
];

const validateNewFolderName = [
	body("newFolderName")
		.notEmpty()
		.escape()
		.isAlphanumeric("en-US", { ignore: "_- " })
		.withMessage("New folder name can only contain letters and numbers"),

	lengthValidator("newFolderName", { min: 1, max: 255 }),
];

const validateFolderId = [param("id").exists().escape().isInt().toInt()];

const validateParentId = [param("parentId").exists().escape().isInt().toInt()];

const validateGetFolder = [...validateFolderId];

const validateCreateFolder = [...validateParentId, ...validateFolderName];

const validateEditFolder = [...validateFolderId, ...validateNewFolderName];

const validateDeleteFolder = [...validateFolderId];

const validateCreateSharedFolder = [
	...validateFolderId,
	body("duration").exists().escape().isInt({ min: 0, max: 14 }).toInt(),
];

const validateShareId = [query("shareId").exists().isString()];

const validateGetSharedFolder = [
	param("folderUUID").exists().escape().isString(),
];

export {
	validateGetFolder,
	validateFolderName,
	validateCreateFolder,
	validateEditFolder,
	validateDeleteFolder,
	validateCreateSharedFolder,
	validateShareId,
	validateGetSharedFolder,
};
