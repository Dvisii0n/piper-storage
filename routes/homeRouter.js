import { Router } from "express";
import homeController from "../controllers/homeController.js";
import folderController from "../controllers/folderController.js";
import fileController from "../controllers/fileController.js";
import { multerUpload } from "../middleware/multer.js";
import { checkAuth } from "../middleware/authHandler.js";

const homeRouter = new Router();

homeRouter.use(checkAuth);

homeRouter.get("/", homeController.getHome);

homeRouter.post("/upload/:parentId", multerUpload, fileController.fileUpload);
homeRouter.get("/downloadFile", fileController.downloadFile);
homeRouter.post("/deleteFile", fileController.deleteFile);
homeRouter.post("/editFile", fileController.editFile);

homeRouter.get("/folder/:id", folderController.getFolder);

homeRouter.post("/createFolder/:parentId", folderController.createFolder);

homeRouter.post("/editFolder/:id", folderController.editFolder);

homeRouter.post("/deleteFolder/:id", folderController.deleteFolder);

export default homeRouter;
