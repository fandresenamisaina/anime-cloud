import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db";
import { s3Client, BUCKET_COVERS } from "../config/minio";
import { AuthRequest } from "../middlewares/auth";
export const createSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, genre } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Le titre est obligatoire" });
    }
    let coverUrl: string | null = null;
    if (req.file) {
      const key = `covers/${uuidv4()}-${req.file.originalname}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_COVERS,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      coverUrl = `http://localhost:9000/${BUCKET_COVERS}/${key}`;
    }
    const result = await pool.query(
      `INSERT INTO series (title, description, cover_url, genre, added_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description || null, coverUrl, genre || null, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la creation de la serie" });
  }
};
export const getAllSeries = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const result = await pool.query(
      `SELECT * FROM series
       WHERE title ILIKE $1
       ORDER BY created_at DESC`,
      [`%${search}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des series" });
  }
};
export const getSeriesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seriesResult = await pool.query("SELECT * FROM series WHERE id = $1", [id]);
    if (seriesResult.rows.length === 0) {
      return res.status(404).json({ message: "Serie introuvable" });
    }
    const seasonsResult = await pool.query(
      `SELECT * FROM seasons WHERE series_id = $1 ORDER BY season_number ASC`,
      [id]
    );
    const seasons = await Promise.all(
      seasonsResult.rows.map(async (season: any) => {
        const episodesResult = await pool.query(
          `SELECT e.id, e.episode_number, e.title, e.thumbnail_url, e.duration_seconds, e.uploaded_by
           FROM episodes e
           WHERE e.season_id = $1
           ORDER BY e.episode_number ASC`,
          [season.id]
        );
        return { ...season, episodes: episodesResult.rows };
      })
    );
    res.json({ ...seriesResult.rows[0], seasons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de la serie" });
  }
};
export const deleteSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const seriesResult = await pool.query("SELECT added_by FROM series WHERE id = $1", [id]);
    if (seriesResult.rows.length === 0) {
      return res.status(404).json({ message: "Serie introuvable" });
    }
    if (seriesResult.rows[0].added_by !== req.userId) {
      return res.status(403).json({ message: "Tu ne peux supprimer que tes propres series" });
    }
    await pool.query("DELETE FROM series WHERE id = $1", [id]);
    res.json({ message: "Serie supprimee" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};