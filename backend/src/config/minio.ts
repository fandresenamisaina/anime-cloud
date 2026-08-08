import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

export const s3Client = new S3Client({
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
export const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT || "http://localhost:9000";

export const BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || "avatars";
export const BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS || "videos";
export const BUCKET_COVERS = process.env.MINIO_BUCKET_COVERS || "covers";
export const BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails";