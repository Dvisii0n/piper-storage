import { prisma } from "../lib/prisma.js";
import {
	getSupabaseDownloadUrl,
	supabaseDelete,
	supabaseUpload,
} from "../middleware/supabase.js";
import path from "path";

async function fileUpload(req, res, next) {
	try {
		const parentId = parseInt(req.params.parentId);
		const { ownerId } = await prisma.folder.findUnique({
			where: { id: parentId },
			select: { ownerId: true },
		});

		if (ownerId !== req.user.id) {
			res.redirect("/home");
			return;
		}

		const files = req.files;

		const filesData = files.map((file) => {
			const filePath = `files/${file.originalname + "-" + Date.now() + path.extname(file.originalname)}`;
			return {
				name: file.originalname,
				filePath: filePath,
				size: file.size,
				buffer: file.buffer,
			};
		});

		//files data but without buffer property
		const filesDataForDb = filesData.map((file) => ({
			name: file.name,
			fileUrl: file.filePath,
			parentFolderId: parentId,
			size_bytes: file.size,
		}));

		//upload to supabase
		for (let file of filesData) {
			await supabaseUpload(res, file.filePath, file.buffer);
		}

		//register on db
		await prisma.file.createMany({ data: filesDataForDb });
		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

async function downloadFile(req, res, next) {
	try {
		const fileId = parseInt(req.query.fileId);
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
			res.redirect("/home");
			return;
		}

		const signedUrl = await getSupabaseDownloadUrl(res, data.fileUrl);
		res.redirect(signedUrl);
	} catch (err) {
		next(err);
	}
}

async function deleteFile(req, res, next) {
	try {
		const fileId = parseInt(req.query.fileId);
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
			res.redirect("/home");
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
		const fileId = parseInt(req.query.fileId);
		const newName = req.body.newFileName;
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
			res.redirect("/home");
			return;
		}

		await prisma.file.update({
			where: { id: fileId },
			data: { name: newName },
		});

		res.redirect(req.get("referer"));
	} catch (err) {
		next(err);
	}
}

export default {
	fileUpload,
	downloadFile,
	deleteFile,
	editFile,
};
