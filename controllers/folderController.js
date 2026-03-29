import { matchedData, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";
import { supabaseDelete } from "../lib/supabase.js";
import BASE_URL from "../utils/baseUrl.js";
import { getFullSharedFoldersData } from "../utils/utils.js";

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
			next();
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
			next();
			return;
		}

		const { parentId, folderName } = matchedData(req);
		const ownerId = req.user.id;

		const isOwner = await verifyOwnership(req.user.id, parentId);

		if (!isOwner) {
			next();
			return;
		}

		const result = await prisma.$transaction(async (tx) => {
			const createdFolder = await prisma.folder.create({
				data: {
					id: crypto.randomUUID(),
					name: folderName,
					ownerId: ownerId,
					parentFolderId: parentId,
				},
			});

			const parentShares = await prisma.sharedFolder.findMany({
				where: { sharedFolderId: createdFolder.parentFolderId },
			});

			//if parent folder has shares
			if (parentShares.length > 0) {
				let sharesToCreate = [];
				for (let share of parentShares) {
					const shareId = crypto.randomUUID();
					sharesToCreate.push({
						id: shareId,
						expiresAt: share.expiresAt,
						parentShareId: share.id,
						sharedFolderId: createdFolder.id,
					});
				}

				//for each share related to the parent, create a new child share
				await prisma.sharedFolder.createMany({ data: sharesToCreate });
			}
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
			next();
			return;
		}
		const { id: folderId } = matchedData(req);

		const isOwner = await verifyOwnership(req.user.id, folderId);

		if (!isOwner) {
			next();
			return;
		}

		//remove parents, get orphans and delete them
		await prisma.$transaction(async (tx) => {
			await prisma.folder.delete({
				where: { id: folderId },
			});

			const orphans = await prisma.file.findMany({
				where: { parentFolderId: null },
			});

			if (orphans.length > 0) {
				await prisma.file.deleteMany({
					where: { parentFolderId: null },
				});
				const fileURLs = orphans.map((url) => url.fileUrl);
				//remove files from supabase
				await supabaseDelete(res, fileURLs);
			}
		});

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

		const { newFolderName } = matchedData(req);
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

async function createSharedFolder(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.redirect(req.get("referer"));
			return;
		}

		const { id: folderId, duration } = matchedData(req);

		const isOwner = await verifyOwnership(req.user.id, folderId);
		if (!isOwner) {
			next();
			return;
		}

		const result = await prisma.$transaction(async (tx) => {
			const folders = await prisma.folder.findMany({
				where: { ownerId: req.user.id },
				orderBy: { id: "desc" },
			});

			const [shareId, data] = getFullSharedFoldersData(
				folders,
				folderId,
				duration,
			);

			await prisma.sharedFolder.createMany({
				data: data,
			});

			return shareId;
		});

		res.redirect("/home/getFolderShareLink?shareId=" + result);
	} catch (err) {
		next(err);
	}
}

async function getFolderShareLink(req, res, next) {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			next();
			return;
		}

		const { shareId } = matchedData(req);
		const shareLink = `${BASE_URL}/share/${shareId}`;
		res.render("shareLink", { shareLink: shareLink });
	} catch (err) {
		next(err);
	}
}

async function getSharedFolder(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next();
			return;
		}
		const { folderUUID } = matchedData(req);
		const folderData = await prisma.sharedFolder.findUnique({
			where: { id: folderUUID },
			include: {
				sharedFolder: {
					include: {
						folders: {
							include: {
								sharedFolders: {
									select: { id: true },
									where: { parentShareId: folderUUID },
								},
							},
						},
						files: true,
					},
				},
			},
		});

		if (!folderData) {
			next();
			return;
		}

		res.render("readOnlyOpenFolder", {
			folderData: folderData.sharedFolder,
			shareId: folderData.id,
		});
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
	createSharedFolder,
	getFolderShareLink,
};
