import { Router } from "express";
import {
	loginUser,
	signupUser,
	logoutUser,
} from "../controllers/authController.js";

const indexRouter = new Router();

indexRouter.get("/", (req, res, next) => {
	try {
		res.render("index");
	} catch (error) {
		next(err);
	}
});

indexRouter.get("/login", (req, res, next) => {
	try {
		res.render("login");
	} catch (error) {
		next(err);
	}
});

indexRouter.get("/signup", (req, res, next) => {
	try {
		res.render("signup");
	} catch (error) {
		next(err);
	}
});

indexRouter.get("/logout", logoutUser);

indexRouter.post("/login", loginUser);
indexRouter.post("/signup", signupUser);

export default indexRouter;
