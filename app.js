import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import passportConfig from "./config/passport.js";
import "dotenv/config";
import expressSession from "express-session";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import indexRouter from "./routes/indexRouter.js";
import homeRouter from "./routes/homeRouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsPath = path.join(__dirname, "public");

const app = express();
const PORT = 3000;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

//prisma session store setup
app.use(
	expressSession({
		cookie: {
			maxAge: 7 * 24 * 60 * 60 * 1000, //ms
		},
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true,
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
	res.status(404).send("404 not found");
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send("500 server error");
});

app.listen(PORT, (error) => {
	if (error) {
		throw error;
	}

	console.log(`Server running on port ${PORT}`);
});
