import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SECRET_KEY,
);

async function supabaseUpload(file_path, file) {
	const { data, error } = await supabase.storage
		.from("files")
		.upload(file_path, file);
	if (error) {
		throw "An error ocurred when uploading to cloud storage";
	}
}

async function getSupabaseDownloadUrl(file_path, filename) {
	const { data, error } = await supabase.storage
		.from("files")
		.createSignedUrl(file_path, 60, { download: filename });
	if (error) {
		throw "An error ocurred donwloading from cloud storage";
	}

	return data.signedUrl;
}

async function getTempSupabaseDownloadUrl(duration, file_path, filename) {
	let expiresIn = 0;
	switch (duration) {
		case 1:
			expiresIn = 86400;
			break;
		case 3:
			expiresIn = 259200;
			break;
		case 7:
			expiresIn = 604800;
			break;
		case 14:
			expiresIn = 1209600;
			break;
		default:
			expiresIn = 10;
			break;
	}
	const { data, error } = await supabase.storage
		.from("files")
		.createSignedUrl(file_path, expiresIn, { download: filename });
	if (error) {
		throw "An error ocurred downloading from cloud storage";
	}

	return data.signedUrl;
}

//takes an array of file urls and deletes them
async function supabaseDelete(file_paths) {
	const { data, error } = await supabase.storage
		.from("files")
		.remove(file_paths);
	if (error) {
		throw "An error ocurred when deleting from cloud storage";
	}
}

export {
	supabaseUpload,
	getSupabaseDownloadUrl,
	supabaseDelete,
	getTempSupabaseDownloadUrl,
};
