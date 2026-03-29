import multer, { MulterError } from "multer";

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
			switch (err.code) {
				case "LIMIT_FILE_SIZE":
					res.send(`File must not exceed ${MAX_SIZE_MB} MB`);
					return;

				case "LIMIT_FILE_COUNT":
					res.send(
						`You can only upload a maximun of ${LIMIT} files at the same time`,
					);
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
