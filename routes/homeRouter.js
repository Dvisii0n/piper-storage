import { Router } from "express";
import homeController from "../controllers/homeController.js";
import folderController from "../controllers/folderController.js";
import fileController from "../controllers/fileController.js";
import { multerUpload } from "../middleware/multer.js";
import { checkAuth } from "../middleware/authHandler.js";
import {
	validateCreateFolder,
	validateDeleteFolder,
	validateEditFolder,
	validateGetFolder,
} from "../validation/folderValidation.js";
import {
	validateDeleteFile,
	validateDownloadFile,
	validateEditFile,
	validateFileUpload,
} from "../validation/fileValidation.js";

const homeRouter = new Router();

homeRouter.use(checkAuth);

homeRouter.get("/", homeController.getHome);

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

export default homeRouter;
