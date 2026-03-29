import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SECRET_KEY,
);

async function supabaseUpload(res, file_path, file) {
	const { data, error } = await supabase.storage
		.from("files")
		.upload(file_path, file);
	if (error) {
		throw "An error ocurred when uploading to cloud storage";
	}
}

async function getSupabaseDownloadUrl(res, file_path, filename) {
	const { data, error } = await supabase.storage
		.from("files")
		.createSignedUrl(file_path, 60, { download: filename });
	if (error) {
		throw "An error ocurred donwloading from cloud storage";
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

export { supabaseUpload, getSupabaseDownloadUrl, supabaseDelete };
