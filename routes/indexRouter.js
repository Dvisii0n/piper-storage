import { Router } from "express";
import {
	loginUser,
	signupUser,
	logoutUser,
	getLogin,
	getSignUp,
} from "../controllers/authController.js";
import folderController from "../controllers/folderController.js";
import { validateSignUp } from "../validation/authValidation.js";
import { query } from "express-validator";
import { validateGetSharedFolder } from "../validation/folderValidation.js";
import { validateGetSharedFile } from "../validation/fileValidation.js";
import fileController from "../controllers/fileController.js";

const indexRouter = new Router();

indexRouter.get("/", (req, res, next) => {
	try {
		res.render("index");
	} catch (error) {
		next(err);
	}
});

indexRouter.get(
	"/share/:folderUUID",
	validateGetSharedFolder,
	folderController.getSharedFolder,
);

indexRouter.get(
	"/download/:parentFolderUUID",
	validateGetSharedFile,
	fileController.downloadSharedFile,
);

indexRouter.get("/login", query("error").escape(), getLogin);

indexRouter.get("/signup", getSignUp);

indexRouter.get("/logout", logoutUser);

indexRouter.post("/login", loginUser);

indexRouter.post("/signup", validateSignUp, signupUser);

export default indexRouter;
