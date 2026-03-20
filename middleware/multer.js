import multer, { MulterError } from "multer";
import path from "path";

//max files to upload
const LIMIT = 5;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array("uploadedFiles", LIMIT);

async function multerUpload(req, res, next) {
	upload(req, res, (err) => {
		if (err instanceof MulterError) {
			res.status(500).send("An error ocurred when uploading");
		} else if (err) {
			next(err);
		}

		next();
	});
}
export { multerUpload };
