import { matchedData, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";
import {
	getSupabaseDownloadUrl,
	supabaseDelete,
	supabaseUpload,
} from "../middleware/supabase.js";
import path from "path";

async function fileUpload(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.send(errors);
			return;
		}

		const { parentId } = matchedData(req);
		const { ownerId } = await prisma.folder.findUnique({
			where: { id: parentId },
			select: { ownerId: true },
		});

		if (ownerId !== req.user.id) {
			next();
			return;
		}

		const files = req.files;

		//upload to supabase and modify req.files
		for (let file of files) {
			const safeNameWithExt = path
				.basename(file.originalname)
				.replace(/[^a-zA-Z0-9._-]/g, "_");
			const filePath = `files/${crypto.randomUUID()}-${safeNameWithExt}`;

			file["safeName"] = path.basename(
				file.originalname,
				path.extname(file.originalname),
			);
			file["extension"] = path.extname(file.originalname);
			file["fileUrl"] = filePath;
			await supabaseUpload(res, filePath, file.buffer);
		}

		const filesData = files.map((file) => ({
			id: crypto.randomUUID(),
			fileUrl: file.fileUrl,
			mime_type: file.mimetype,
			name: file.safeName,
			extension: file.extension,
			size_bytes: file.size,
			parentFolderId: parentId,
		}));

		// //register on db
		await prisma.file.createMany({ data: filesData });
		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function downloadFile(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.send(errors);
			return;
		}
		const { fileId } = matchedData(req);
		const data = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				fileUrl: true,
				mime_type: true,
				name: true,
				extension: true,
				parentFolder: {
					select: { ownerId: true },
				},
			},
		});

		if (req.user.id !== data.parentFolder.ownerId) {
			next();
		}

		const fileNameWithExt = `${data.name}${data.extension}`;

		const signedUrl = await getSupabaseDownloadUrl(
			res,
			data.fileUrl,
			fileNameWithExt,
		);
		res.redirect(signedUrl);
	} catch (err) {
		next(err);
	}
}

async function deleteFile(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.send(errors);
			return;
		}
		const { fileId } = matchedData(req);
		const data = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				fileUrl: true,
				parentFolder: {
					select: { ownerId: true },
				},
			},
		});

		if (req.user.id !== data.parentFolder.ownerId) {
			next();
			return;
		}

		await prisma.file.delete({ where: { id: fileId } });
		await supabaseDelete(res, [data.fileUrl]);
		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function editFile(req, res, next) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.send(errors);
			return;
		}

		const { fileId, newFileName } = matchedData(req);
		const data = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				fileUrl: true,
				parentFolder: {
					select: { ownerId: true },
				},
			},
		});

		if (req.user.id !== data.parentFolder.ownerId) {
			next();
			return;
		}

		await prisma.file.update({
			where: { id: fileId },
			data: { name: newFileName },
		});

		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function downloadSharedFile(req, res, next) {
	try {
		const { fileId, parentShareId } = matchedData(req);

		const data = await prisma.file.findUnique({
			where: { id: fileId },
			select: {
				name: true,
				fileUrl: true,
				extension: true,
				parentFolder: {
					select: {
						sharedFolders: {
							where: { id: parentShareId },
							select: { id: true },
						},
					},
				},
			},
		});

		if (!data || data.parentFolder.sharedFolders.length === 0) {
			next();
			return;
		}

		const fileNameWithExt = `${data.name}${data.extension}`;

		const signedUrl = await getSupabaseDownloadUrl(
			res,
			data.fileUrl,
			fileNameWithExt,
		);
		res.redirect(signedUrl);
	} catch (err) {
		next(err);
	}
}

export default {
	fileUpload,
	downloadFile,
	deleteFile,
	editFile,
	downloadSharedFile,
};
