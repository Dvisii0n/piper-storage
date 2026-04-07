import multer, { MulterError } from "multer";
import { getCleanReferer } from "../utils/utils.js";

//max files to upload
const LIMIT = 5;
const MAX_SIZE_MB = 6;

const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: MAX_SIZE_MB * 1000000, //6MB in bytes
		files: LIMIT,
	},
}).array("uploadedFiles", LIMIT);

async function multerUpload(req, res, next) {
	upload(req, res, (err) => {
		if (err instanceof MulterError) {
			const refererURL = req.get("referer");
			const cleanReferer = getCleanReferer(refererURL);
			switch (err.code) {
				case "LIMIT_FILE_SIZE":
					res.redirect(cleanReferer + "?uploadError=LIMIT_FILE_SIZE");
					return;

				case "LIMIT_FILE_COUNT":
					res.redirect(cleanReferer + "?uploadError=LIMIT_FILE_COUNT");
					return;

				default:
					res.status(500).send("An error ocurred while uploading");
					return;
			}
		} else if (err) {
			next(err);
			return;
		}

		next();
	});
}
export { multerUpload };
