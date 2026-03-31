import { prisma } from "../lib/prisma.js";

async function getHome(req, res, next) {
	try {
		const homeFolder = await prisma.folder.findFirst({
			where: { parentFolderId: null, AND: { ownerId: req.user.id } },
			select: {
				folders: true,
				files: true,
				name: true,
				id: true,
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
