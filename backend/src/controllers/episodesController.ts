import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db";
import { s3Client, BUCKET_VIDEOS, BUCKET_THUMBNAILS } from "../config/minio";
import { AuthRequest } from "../middlewares/auth";
import { Request } from "express";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobePath.path);

function fixVideoFaststart(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(["-c copy", "-movflags +faststart"])
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}

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

function convertSrtToVtt(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export const createEpisode = async (req: AuthRequest, res: Response) => {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;
  let tempThumbnailPath: string | null = null;
  let tempSrtPath: string | null = null;
  let tempVttPath: string | null = null;

  try {
    const { season_id, episode_number, title } = req.body;
    const files = req.files as {
      video?: Express.Multer.File[];
      subtitle?: Express.Multer.File[];
    };

    if (!season_id || !episode_number) {
      return res.status(400).json({ message: "season_id et episode_number sont obligatoires" });
    }

    // Vérifier que l'utilisateur a créé la saison (et donc la série)
    const seasonResult = await pool.query("SELECT series_id FROM seasons WHERE id = $1", [season_id]);
    if (seasonResult.rows.length === 0) {
      return res.status(404).json({ message: "Saison introuvable" });
    }
    
    const seriesId = seasonResult.rows[0].series_id;
    const seriesResult = await pool.query("SELECT added_by FROM series WHERE id = $1", [seriesId]);
    
    // Vérifier si l'utilisateur est admin ou s'il est le créateur de la série
    const userResult = await pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
    const isAdmin = userResult.rows[0]?.is_admin || false;
    
    if (!isAdmin && seriesResult.rows[0].added_by !== req.userId) {
      return res.status(403).json({ message: "Seul le créateur de la série peut ajouter des episodes" });
    }

    const videoFile = files?.video?.[0];
    if (!videoFile) {
      return res.status(400).json({ message: "Le fichier video est obligatoire"});
    }

    const tempDir = os.tmpdir();
    const uniqueId = uuidv4();
    tempInputPath = path.join(tempDir, `${uniqueId}-input.mp4`);
    tempOutputPath = path.join(tempDir, `${uniqueId}-output.mp4`);

    fs.writeFileSync(tempInputPath, videoFile.buffer);

    await fixVideoFaststart(tempInputPath, tempOutputPath);

    const durationSeconds = await getVideoDuration(tempOutputPath);
    const thumbnailTimestamp = durationSeconds > 0 ? Math.floor(durationSeconds * 0.1) : 1;

    const thumbnailFilename = `${uniqueId}-thumb.jpg`;
    tempThumbnailPath = await extractThumbnail(
      tempOutputPath,
      tempDir,
      thumbnailFilename,
      thumbnailTimestamp
    );

    const fixedBuffer = fs.readFileSync(tempOutputPath);
    const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

    const key = `episodes/${uuidv4()}-${videoFile.originalname}`;
    const thumbnailKey = `thumbnails/${uuidv4()}.jpg`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_VIDEOS,
        Key: key,
        Body: fixedBuffer,
        ContentType: videoFile.mimetype,
      })
    );

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_THUMBNAILS,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: "image/jpeg",
      })
    );

    const videoUrl = `http://localhost:9000/${BUCKET_VIDEOS}/${key}`;
    const thumbnailUrl = `http://localhost:9000/${BUCKET_THUMBNAILS}/${thumbnailKey}`;

    let subtitleUrl: string | null = null;
    const subtitleFile = files?.subtitle?.[0];

    if (subtitleFile) {
      tempSrtPath = path.join(tempDir, `${uniqueId}-subtitle.srt`);
      tempVttPath = path.join(tempDir, `${uniqueId}-subtitle.vtt`);
      fs.writeFileSync(tempSrtPath, subtitleFile.buffer);
      await convertSrtToVtt(tempSrtPath, tempVttPath);

      const vttBuffer = fs.readFileSync(tempVttPath);
      const subtitleKey = `subtitles/${uuidv4()}.vtt`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_VIDEOS,
          Key: subtitleKey,
          Body: vttBuffer,
          ContentType: "text/vtt",
        })
      );

      subtitleUrl = `http://localhost:9000/${BUCKET_VIDEOS}/${subtitleKey}`;
    }

    const result = await pool.query(
      `INSERT INTO episodes (season_id, episode_number, title, video_url, thumbnail_url, duration_seconds, subtitle_url, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [season_id, episode_number, title || null, videoUrl, thumbnailUrl, durationSeconds, subtitleUrl, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Cet episode existe deja pour cette saison" });
    }
    res.status(500).json({ message: "Erreur lors de l ajout de l episode" });
  } finally {
    if (tempInputPath && fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (tempOutputPath && fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    if (tempThumbnailPath && fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
    if (tempSrtPath && fs.existsSync(tempSrtPath)) fs.unlinkSync(tempSrtPath);
    if (tempVttPath && fs.existsSync(tempVttPath)) fs.unlinkSync(tempVttPath);
  }
};

export const getEpisodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM episodes WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Episode introuvable" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de l episode" });
  }
};

export const deleteEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier qui a uploadé l'épisode
    const episodeResult = await pool.query(
      "SELECT uploaded_by FROM episodes WHERE id = $1",
      [id]
    );
    
    if (episodeResult.rows.length === 0) {
      return res.status(404).json({ message: "Episode introuvable" });
    }
    
    const uploadedBy = episodeResult.rows[0].uploaded_by;
    
    // Vérifier si l'utilisateur est admin ou s'il est celui qui a uploadé
    const userResult = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [req.userId]
    );
    
    const isAdmin = userResult.rows[0]?.is_admin || false;
    
    if (!isAdmin && uploadedBy !== req.userId) {
      return res.status(403).json({ message: "Vous ne pouvez pas supprimer cet episode" });
    }
    
    await pool.query("DELETE FROM episodes WHERE id = $1", [id]);
    res.json({ message: "Episode supprime" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};
