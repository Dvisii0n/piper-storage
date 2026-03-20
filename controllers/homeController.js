import { prisma } from "../lib/prisma.js";

async function getHome(req, res, next) {
	try {
		const homeFolder = await prisma.folder.findFirst({
			where: { parentFolderId: null, AND: { ownerId: req.user.id } },
			include: {
				folders: true,
				files: true,
			},
		});

		res.render("home", { folderData: homeFolder });
	} catch (err) {
		next(err);
	}
}

export default {
	getHome,
};
