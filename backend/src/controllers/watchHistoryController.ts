import { Response } from "express";
import { pool } from "../config/db";
import { Request } from "express";

export const upsertProgress = async (req: Request, res: Response) => {
  try {
    const { episode_id, progress_seconds, completed } = req.body;

    if (!episode_id || progress_seconds === undefined) {
      return res.status(400).json({ message: "episode_id et progress_seconds sont obligatoires" });
    }

    const result = await pool.query(
      `INSERT INTO watch_history (user_id, episode_id, progress_seconds, completed, last_watched_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (user_id, episode_id)
       DO UPDATE SET progress_seconds = $3, completed = $4, last_watched_at = now()
       RETURNING *`,
      [req.userId, episode_id, progress_seconds, completed || false]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la sauvegarde de la progression" });
  }
};

export const getProgress = async (req: Request, res: Response) => {
  try {
    const { episode_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM watch_history WHERE user_id = $1 AND episode_id = $2",
      [req.userId, episode_id]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de la progression" });
  }
};

export const getContinueWatching = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT wh.progress_seconds, wh.completed, wh.last_watched_at,
              e.id as episode_id, e.episode_number, e.title as episode_title, e.duration_seconds,
              s.id as season_id, s.season_number,
              se.id as series_id, se.title as series_title, se.cover_url
       FROM watch_history wh
       JOIN episodes e ON e.id = wh.episode_id
       JOIN seasons s ON s.id = e.season_id
       JOIN series se ON se.id = s.series_id
       WHERE wh.user_id = $1 AND wh.completed = false AND wh.progress_seconds > 0
       ORDER BY wh.last_watched_at DESC
       LIMIT 12`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de l historique" });
  }
};
