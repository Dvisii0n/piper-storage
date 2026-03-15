import multer, { MulterError } from "multer";
import path from "path";

//max files to upload
const LIMIT = 5;

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(
			null,
			file.originalname + "-" + Date.now() + path.extname(file.originalname),
		);
	},
});
const upload = multer({ storage: storage }).array("uploadedFiles", LIMIT);

async function uploadFiles(req, res, next) {
	if (!req.isAuthenticated()) return res.redirect("/login");
	upload(req, res, (err) => {
		if (err instanceof MulterError) {
			res.status(500).send("An error ocurred when uploading");
		} else if (err) {
			next(err);
		}
	});
	next();
}
export { uploadFiles };
