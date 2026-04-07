import { prisma } from "../lib/prisma.js";
import { matchedData, validationResult } from "express-validator";

async function getHome(req, res, next) {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			next();
			return;
		}

		const { uploadError } = matchedData(req);
		const folderData = await prisma.$transaction(async (tx) => {
			const homeFolder = await tx.folder.findFirst({
				where: { parentFolderId: null, AND: { ownerId: req.user.id } },
				select: {
					folders: true,
					files: true,
					name: true,
					id: true,
				},
			});

			const currentDate = new Date();
			await tx.sharedFolder.deleteMany({
				where: {
					expiresAt: { lte: currentDate },
					AND: { sharedFolder: { ownerId: req.user.id } },
				},
			});

			return homeFolder;
		});

		res.render("home", { folderData: folderData, uploadError: uploadError });
	} catch (err) {
		next(err);
	}
}

export default {
	getHome,
};
