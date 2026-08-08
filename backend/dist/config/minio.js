"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_THUMBNAILS = exports.BUCKET_COVERS = exports.BUCKET_VIDEOS = exports.BUCKET_AVATARS = exports.MINIO_PUBLIC_URL = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.s3Client = new client_s3_1.S3Client({
    endpoint: process.env.MINIO_ENDPOINT || undefined,
    region: process.env.MINIO_REGION || "sa-east-1",
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || "",
        secretAccessKey: process.env.MINIO_SECRET_KEY || "",
    },
    forcePathStyle: true,
});
// URL publique utilisée pour construire les liens accessibles depuis le navigateur.
// En local: http://localhost:9000
// En production: l'URL publique de ton MinIO/S3 (ex: https://minio.tondomaine.com ou l'endpoint de ton bucket S3-compatible)
exports.MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://localhost:9000";
exports.BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || "avatars";
exports.BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS || "videos";
exports.BUCKET_COVERS = process.env.MINIO_BUCKET_COVERS || "covers";
exports.BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails";
