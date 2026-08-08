import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d'environnement");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS || "videos";
export const BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails";
export const BUCKET_COVERS = process.env.MINIO_BUCKET_COVERS || "covers";
export const BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || "avatars";