import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import passportConfig from "./config/passport.js";
import "dotenv/config";
import expressSession from "express-session";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import indexRouter from "./routes/indexRouter.js";
import homeRouter from "./routes/homeRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, "public");

const app = express();
const PORT = 3000;

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

//prisma session store setup
app.use(
	expressSession({
		cookie: {
			maxAge: 24 * 60 * 60 * 1000, //ms, one day
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		},
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: new PrismaSessionStore(prisma, {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: true,
			dbRecordIdFunction: undefined,
		}),
	}),
);

app.use(passport.session());
passportConfig(passport);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

//router mounting
app.use("/", indexRouter);
app.use("/home", homeRouter);

//default status handlers
app.use((req, res) => {
	res.status(404).render("404");
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).render("500");
});

app.listen(PORT, (error) => {
	if (error) {
		throw error;
	}

	console.log(`Server running on port ${PORT}`);
});
