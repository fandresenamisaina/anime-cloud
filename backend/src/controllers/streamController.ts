import { Response } from "express";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db";
import { s3Client, BUCKET_VIDEOS } from "../config/minio";
import { AuthRequest } from "../middlewares/auth";

function extractKeyFromUrl(videoUrl: string, bucket: string): string {
  const marker = `/${bucket}/`;
  const index = videoUrl.indexOf(marker);
  return videoUrl.substring(index + marker.length);
}

export const streamEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const episodeResult = await pool.query(
      "SELECT * FROM episodes WHERE id = $1",
      [id]
    );

    if (episodeResult.rows.length === 0) {
      return res.status(404).json({ message: "Episode introuvable" });
    }

    const episode = episodeResult.rows[0];
    const key = extractKeyFromUrl(episode.video_url, BUCKET_VIDEOS);

    const headResult = await s3Client.send(
      new HeadObjectCommand({ Bucket: BUCKET_VIDEOS, Key: key })
    );

    const fileSize = headResult.ContentLength || 0;
    const contentType = headResult.ContentType || "video/mp4";
    const range = req.headers.range;

    if (!range) {
      const objectResult = await s3Client.send(
        new GetObjectCommand({ Bucket: BUCKET_VIDEOS, Key: key })
      );
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      });
      (objectResult.Body as NodeJS.ReadableStream).pipe(res);
      return;
    }

    const matches = range.match(/bytes=(\d*)-(\d*)/);
    let start: number;
    let end: number;

    if (matches && matches[1] !== "") {
      start = parseInt(matches[1], 10);
      end = matches[2] !== "" ? parseInt(matches[2], 10) : fileSize - 1;
    } else if (matches && matches[2] !== "") {
      const suffixLength = parseInt(matches[2], 10);
      start = Math.max(fileSize - suffixLength, 0);
      end = fileSize - 1;
    } else {
      start = 0;
      end = fileSize - 1;
    }

    if (end >= fileSize) end = fileSize - 1;
    if (start > end) start = end;

    const chunkSize = end - start + 1;

    const objectResult = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_VIDEOS,
        Key: key,
        Range: `bytes=${start}-${end}`,
      })
    );

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": contentType,
    });

    (objectResult.Body as NodeJS.ReadableStream).pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Erreur lors du streaming de la video" });
    }
  }
};
