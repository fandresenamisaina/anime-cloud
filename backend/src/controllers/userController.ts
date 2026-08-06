import { Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { AuthRequest } from "../middlewares/auth";

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;
    const userId = req.userId;

    if (!username && !password) {
      return res.status(400).json({ message: "Aucun champ a modifier" });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (username) {
      const existing = await pool.query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, userId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "Ce nom d utilisateur est deja utilise" });
      }
      updates.push(`username = $${paramIndex}`);
      values.push(username);
      paramIndex++;
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, username, email, avatar_url, created_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise a jour du profil" });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { series_id } = req.body;
    const result = await pool.query(
      `INSERT INTO favorites (user_id, series_id) VALUES ($1, $2)
       ON CONFLICT (user_id, series_id) DO NOTHING
       RETURNING *`,
      [req.userId, series_id]
    );
    res.status(201).json(result.rows[0] || { message: "Deja en favori" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l ajout aux favoris" });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { series_id } = req.params;
    await pool.query(
      "DELETE FROM favorites WHERE user_id = $1 AND series_id = $2",
      [req.userId, series_id]
    );
    res.json({ message: "Retire des favoris" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.* FROM series s
       JOIN favorites f ON f.series_id = s.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des favoris" });
  }
};

// WATCHLIST

export const addToWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const { series_id } = req.body;
    const result = await pool.query(
      `INSERT INTO watchlist (user_id, series_id) VALUES ($1, $2)
       ON CONFLICT (user_id, series_id) DO NOTHING
       RETURNING *`,
      [req.userId, series_id]
    );
    res.status(201).json(result.rows[0] || { message: "Deja dans la watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l ajout a la watchlist" });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const { series_id } = req.params;
    await pool.query(
      "DELETE FROM watchlist WHERE user_id = $1 AND series_id = $2",
      [req.userId, series_id]
    );
    res.json({ message: "Retire de la watchlist" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

export const getWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.* FROM series s
       JOIN watchlist w ON w.series_id = s.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de la watchlist" });
  }
};

// HISTORIQUE DE VISIONNAGE

export const updateWatchProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { episode_id, progress_seconds, completed } = req.body;

    const result = await pool.query(
      `INSERT INTO watch_history (user_id, episode_id, progress_seconds, completed, last_watched_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, episode_id)
       DO UPDATE SET progress_seconds = $3, completed = $4, last_watched_at = NOW()
       RETURNING *`,
      [req.userId, episode_id, progress_seconds || 0, completed || false]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise a jour de la progression" });
  }
};

export const getWatchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT wh.*, e.title as episode_title, e.episode_number, s.series_id,
              se.title as series_title
       FROM watch_history wh
       JOIN episodes e ON e.id = wh.episode_id
       JOIN seasons s ON s.id = e.season_id
       JOIN series se ON se.id = s.series_id
       WHERE wh.user_id = $1
       ORDER BY wh.last_watched_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation de l historique" });
  }
};
