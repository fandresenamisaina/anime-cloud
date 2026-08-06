import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true,
});
export const BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || "avatars";
export const BUCKET_VIDEOS = process.env.MINIO_BUCKET_VIDEOS || "videos";
export const BUCKET_COVERS = process.env.MINIO_BUCKET_COVERS || "covers";
export const BUCKET_THUMBNAILS = process.env.MINIO_BUCKET_THUMBNAILS || "thumbnails";
