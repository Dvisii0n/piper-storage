import passport from "passport";
import { prisma } from "../lib/prisma.js";
import { matchedData, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { getBodyErrors } from "../utils/utils.js";

const getLogin = (req, res, next) => {
	try {
		const { error } = matchedData(req);

		if (error === "true") {
			res.render("login", { loginError: "Invalid user or password" });
			return;
		}
		res.render("login", { loginError: "" });
	} catch (err) {
		next(err);
	}
};

const getSignUp = (req, res, next) => {
	try {
		res.render("signup", { bodyErrors: {} });
	} catch (err) {
		next(err);
	}
};

const loginUser = passport.authenticate("local", {
	successRedirect: "/home",
	failureRedirect: "/login?error=true",
	failureMessage: "Invalid user or password",
});

const signupUser = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const bodyErrors = getBodyErrors(errors.array());
			res.render("signup", { bodyErrors: bodyErrors });
			return;
		}

		const { email, username, password } = matchedData(req);
		const passwordHash = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				id: crypto.randomUUID(),
				email: email,
				username: username,
				password: passwordHash,
				folders: {
					create: [{ id: crypto.randomUUID(), name: "home" }],
				},
			},
		});
		res.redirect("/login");
	} catch (err) {
		next(err);
	}
};

const logoutUser = async (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect("/login");
	});
};

export { loginUser, signupUser, logoutUser, getLogin, getSignUp };
