import { Router } from "express";
import homeController from "../controllers/homeController.js";
import folderController from "../controllers/folderController.js";
import fileController from "../controllers/fileController.js";
import { multerUpload } from "../middleware/multer.js";
import { checkAuth } from "../middleware/authHandler.js";
import {
	validateCreateFolder,
	validateCreateSharedFolder,
	validateDeleteFolder,
	validateEditFolder,
	validateGetFolder,
	validateGetHome,
	validateShareId,
} from "../validation/folderValidation.js";
import {
	validateDeleteFile,
	validateDownloadFile,
	validateEditFile,
	validateFileUpload,
	validateShareFile,
} from "../validation/fileValidation.js";

const homeRouter = new Router();

homeRouter.use(checkAuth);

homeRouter.get("/", validateGetHome, homeController.getHome);

//files

homeRouter.get(
	"/downloadFile",
	validateDownloadFile,
	fileController.downloadFile,
);

homeRouter.post("/deleteFile", validateDeleteFile, fileController.deleteFile);

homeRouter.post(
	"/upload/:parentId",
	validateFileUpload,
	multerUpload,
	fileController.fileUpload,
);

homeRouter.post("/editFile", validateEditFile, fileController.editFile);

homeRouter.post(
	"/shareFile",
	validateShareFile,
	fileController.getSharedFileDownloadUrl,
);

//folders

homeRouter.get("/folder/:id", validateGetFolder, folderController.getFolder);

homeRouter.post(
	"/createFolder/:parentId",
	validateCreateFolder,
	folderController.createFolder,
);

homeRouter.post(
	"/editFolder/:id",
	validateEditFolder,
	folderController.editFolder,
);

homeRouter.post(
	"/deleteFolder/:id",
	validateDeleteFolder,
	folderController.deleteFolder,
);

homeRouter.post(
	"/createSharedFolder/:id",
	validateCreateSharedFolder,
	folderController.createSharedFolder,
);

homeRouter.get(
	"/getFolderShareLink",
	validateShareId,
	folderController.getFolderShareLink,
);

export default homeRouter;
