import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "./src/config/db";
import { s3Client, BUCKET_VIDEOS, BUCKET_THUMBNAILS } from "./src/config/minio";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobePath.path);

function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      resolve(duration ? Math.round(duration) : 0);
    });
  });
}

function extractThumbnail(
  inputPath: string,
  outputDir: string,
  outputFilename: string,
  timestampSeconds: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on("end", () => resolve(path.join(outputDir, outputFilename)))
      .on("error", (err) => reject(err))
      .screenshots({
        timestamps: [timestampSeconds],
        filename: outputFilename,
        folder: outputDir,
        size: "640x360",
      });
  });
}

function extractKeyFromUrl(url: string, bucket: string): string {
  const marker = `/${bucket}/`;
  const idx = url.indexOf(marker);
  return url.substring(idx + marker.length);
}

async function streamToFile(bucket: string, key: string, destPath: string): Promise<void> {
  const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const body = response.Body as unknown as NodeJS.ReadableStream;
  await new Promise<void>((resolve, reject) => {
    const writeStream = fs.createWriteStream(destPath);
    body.pipe(writeStream);
    writeStream.on("finish", () => resolve());
    writeStream.on("error", reject);
  });
}

async function main() {
  const { rows } = await pool.query(
    `SELECT id, video_url FROM episodes WHERE thumbnail_url IS NULL OR duration_seconds IS NULL`
  );

  console.log(`${rows.length} episode(s) a traiter.`);

  for (const episode of rows) {
    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    const tempVideoPath = path.join(tempDir, `${uniqueId}-backfill.mp4`);
    let tempThumbnailPath: string | null = null;

    try {
      console.log(`Episode ${episode.id} : telechargement...`);
      const videoKey = extractKeyFromUrl(episode.video_url, BUCKET_VIDEOS);
      await streamToFile(BUCKET_VIDEOS, videoKey, tempVideoPath);

      const durationSeconds = await getVideoDuration(tempVideoPath);
      const thumbnailTimestamp = durationSeconds > 0 ? Math.floor(durationSeconds * 0.1) : 1;

      const thumbnailFilename = `${uniqueId}-thumb.jpg`;
      tempThumbnailPath = await extractThumbnail(
        tempVideoPath,
        tempDir,
        thumbnailFilename,
        thumbnailTimestamp
      );

      const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);
      const thumbnailKey = `thumbnails/${uuidv4()}.jpg`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_THUMBNAILS,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: "image/jpeg",
        })
      );

      const thumbnailUrl = `http://localhost:9000/${BUCKET_THUMBNAILS}/${thumbnailKey}`;

      await pool.query(
        `UPDATE episodes SET thumbnail_url = $1, duration_seconds = $2 WHERE id = $3`,
        [thumbnailUrl, durationSeconds, episode.id]
      );

      console.log(`Episode ${episode.id} : OK (duree=${durationSeconds}s)`);
    } catch (err) {
      console.error(`Episode ${episode.id} : ECHEC`, err);
    } finally {
      if (fs.existsSync(tempVideoPath)) fs.unlinkSync(tempVideoPath);
      if (tempThumbnailPath && fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
    }
  }

  console.log("Termine.");
  await pool.end();
}

main();
