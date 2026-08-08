import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { pool } from "../config/db";
import { supabaseAdmin, BUCKET_VIDEOS, BUCKET_THUMBNAILS } from "../config/supabase";
import { AuthRequest } from "../middlewares/auth";

// Genere une URL signee permettant au navigateur d'uploader directement
// la video vers Supabase Storage, sans passer par la RAM/CPU du backend.
export const getVideoUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: "filename est obligatoire" });
    }

    const key = `episodes/${uuidv4()}-${filename}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_VIDEOS)
      .createSignedUploadUrl(key);

    if (error || !data) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_VIDEOS).getPublicUrl(key);

    res.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
  }
};

// Meme principe pour la miniature (image).
export const getThumbnailUploadUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ message: "filename est obligatoire" });
    }

    const key = `thumbnails/${uuidv4()}-${filename}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_THUMBNAILS)
      .createSignedUploadUrl(key);

    if (error || !data) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_THUMBNAILS).getPublicUrl(key);

    res.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      publicUrl: publicUrlData.publicUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
  }
};

// Recoit juste les URLs publiques + metadonnees en JSON (fichiers deja sur Supabase).
export const createEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const {
      season_id,
      episode_number,
      title,
      video_url,
      thumbnail_url,
      duration_seconds,
    } = req.body;

    if (!season_id || !episode_number || !video_url) {
      return res.status(400).json({ message: "season_id, episode_number et video_url sont obligatoires" });
    }

    const seasonResult = await pool.query("SELECT series_id FROM seasons WHERE id = $1", [season_id]);
    if (seasonResult.rows.length === 0) {
      return res.status(404).json({ message: "Saison introuvable" });
    }

    const seriesId = seasonResult.rows[0].series_id;
    const seriesResult = await pool.query("SELECT added_by FROM series WHERE id = $1", [seriesId]);

    const userResult = await pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
    const isAdmin = userResult.rows[0]?.is_admin || false;

    if (!isAdmin && seriesResult.rows[0].added_by !== req.userId) {
      return res.status(403).json({ message: "Seul le createur de la serie peut ajouter des episodes" });
    }

    const result = await pool.query(
      `INSERT INTO episodes (season_id, episode_number, title, video_url, thumbnail_url, duration_seconds, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        season_id,
        episode_number,
        title || null,
        video_url,
        thumbnail_url || null,
        duration_seconds || 0,
        req.userId,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Cet episode existe deja pour cette saison" });
    }
    res.status(500).json({ message: "Erreur lors de l ajout de l episode" });
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

    const episodeResult = await pool.query(
      "SELECT uploaded_by FROM episodes WHERE id = $1",
      [id]
    );

    if (episodeResult.rows.length === 0) {
      return res.status(404).json({ message: "Episode introuvable" });
    }

    const uploadedBy = episodeResult.rows[0].uploaded_by;

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