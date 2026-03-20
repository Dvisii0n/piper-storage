import { prisma } from "../lib/prisma.js";
import { supabaseDelete } from "../middleware/supabase.js";

async function verifyOwnership(userId, folderId) {
	const { ownerId } = await prisma.folder.findUnique({
		where: { id: folderId },
		select: { ownerId: true },
	});

	if (userId !== ownerId) {
		return false;
	}

	return true;
}

async function getFolder(req, res, next) {
	try {
		const folderId = parseInt(req.params.id);

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			res.redirect("/home");
			return;
		}

		const folder = await prisma.folder.findUnique({
			where: { id: folderId },
			select: { folders: true, files: true, id: true },
		});

		res.render("home", { folderData: folder });
	} catch (err) {
		next(err);
	}
}

async function createFolder(req, res, next) {
	try {
		const { folderName } = req.body;
		const ownerId = req.user.id;
		const parentFolderId = parseInt(req.params.parentId);

		const isOwner = await verifyOwnership(req.user.id, parentFolderId);

		if (!isOwner) {
			res.redirect("/home");
			return;
		}

		await prisma.folder.create({
			data: {
				name: folderName,
				ownerId: ownerId,
				parentFolderId: parentFolderId,
			},
		});

		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function deleteFolder(req, res, next) {
	try {
		const folderId = parseInt(req.params.id);

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			res.redirect("/home");
			return;
		}

		//remove folder and files from database
		const { files } = await prisma.folder.delete({
			where: { id: folderId },
			select: {
				files: {
					select: { fileUrl: true },
				},
			},
		});

		if (files.length > 0) {
			const fileURLs = files.map((url) => url.fileUrl);
			//remove files from supabase
			await supabaseDelete(res, fileURLs);
		}

		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function editFolder(req, res, next) {
	try {
		const folderId = parseInt(req.params.id);

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			res.redirect("/home");
			return;
		}

		const { newFolderName } = req.body;
		await prisma.folder.update({
			where: { id: folderId },
			data: {
				name: newFolderName,
			},
		});
		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

export default { getFolder, editFolder, createFolder, deleteFolder };
