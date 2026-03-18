import { Router } from "express";
import homeController from "../controllers/homeController.js";
import { multerUpload } from "../middleware/multer.js";
import { checkAuth } from "../middleware/authHandler.js";

const homeRouter = new Router();

homeRouter.use(checkAuth);

homeRouter.get("/", homeController.getHome);
homeRouter.get("/folder/:id", homeController.getFolder);

homeRouter.post("/upload/:parentId", multerUpload, homeController.fileUpload);

homeRouter.post("/createFolder/:parentId", homeController.createFolder);

homeRouter.post("/editFolder/:id", homeController.editFolder);

homeRouter.post("/deleteFolder/:id", homeController.deleteFolder);

export default homeRouter;
