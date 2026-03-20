import { prisma } from "../lib/prisma.js";
import {
	getSupabaseDownloadUrl,
	supabaseUpload,
} from "../middleware/supabase.js";
import path from "path";

async function fileUpload(req, res, next) {
	try {
		const parentId = parseInt(req.params.parentId);
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
			await supabaseUpload(file.filePath, file.buffer);
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
		const { fileUrl } = await prisma.file.findUnique({
			where: { id: fileId },
			select: { fileUrl: true },
		});

		const signedUrl = await getSupabaseDownloadUrl(fileUrl);

		res.redirect(signedUrl);
	} catch (err) {
		next(err);
	}
}

export default {
	fileUpload,
	downloadFile,
};
