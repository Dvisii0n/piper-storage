import passport from "passport";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const loginUser = passport.authenticate("local", {
	successRedirect: "/home",
	failureRedirect: "/login",
});

const signupUser = async (req, res, next) => {
	try {
		const { email, username, password } = req.body;
		const passwordHash = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				email: email,
				username: username,
				password: passwordHash,
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

export { loginUser, signupUser, logoutUser };
