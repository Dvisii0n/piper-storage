import { matchedData, validationResult } from "express-validator";
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
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.redirect(req.get("referer"));
			return;
		}

		const { id: folderId } = matchedData(req);

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			next();
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
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log(errors.array());
			res.redirect(req.get("referer"));
			return;
		}

		const { parentId, folderName } = matchedData(req);
		const ownerId = req.user.id;

		const isOwner = await verifyOwnership(req.user.id, parentId);

		if (!isOwner) {
			next();
			return;
		}

		await prisma.folder.create({
			data: {
				name: folderName,
				ownerId: ownerId,
				parentFolderId: parentId,
			},
		});

		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function deleteFolder(req, res, next) {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.redirect("/home");
			return;
		}
		const { id: folderId } = matchedData(req);
		const parsedFolderId = parseInt(folderId);

		const isOwner = await verifyOwnership(req.user.id, parsedFolderId);

		if (!isOwner) {
			next();
			return;
		}

		//remove parents, get orphans and delete them
		const [deletedFolders, orphanFiles] = await prisma.$transaction([
			prisma.folder.delete({
				where: { id: parsedFolderId },
				select: {
					files: {
						select: { fileUrl: true },
					},
				},
			}),
			prisma.file.findMany({
				where: { parentFolderId: null },
			}),
			prisma.file.deleteMany({
				where: { parentFolderId: null },
			}),
		]);

		if (orphanFiles.length > 0) {
			const fileURLs = orphanFiles.map((url) => url.fileUrl);
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
		const { id: folderId } = matchedData(req);

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			res.redirect(req.get("referer"));
			return;
		}

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			next();
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

async function getSharedFolder(req, res, next) {
	try {
		res.render("index");
	} catch (err) {
		next(err);
	}
}

export default {
	getFolder,
	editFolder,
	createFolder,
	deleteFolder,
	getSharedFolder,
};
