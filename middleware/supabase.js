import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

async function supabaseUpload(file_path, file) {
	const { data, error } = await supabase.storage
		.from("files")
		.upload(file_path, file);
	if (error) {
		throw error;
	}
}

async function getSupabaseDownloadUrl(file_path) {
	const { data, error } = await supabase.storage
		.from("files")
		.createSignedUrl(file_path, 60, { download: true });
	if (error) {
		throw error;
	}

	return data.signedUrl;
}

export { supabaseUpload, getSupabaseDownloadUrl };
