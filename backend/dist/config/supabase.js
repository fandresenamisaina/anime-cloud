"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_AVATARS = exports.BUCKET_COVERS = exports.BUCKET_THUMBNAILS = exports.BUCKET_VIDEOS = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d'environnement");
}
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
exports.BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS || "videos";
exports.BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails";
exports.BUCKET_COVERS = process.env.MINIO_BUCKET_COVERS || "covers";
exports.BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || "avatars";
