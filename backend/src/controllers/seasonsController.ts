import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middlewares/auth";

export const createSeason = async (req: AuthRequest, res: Response) => {
  try {
    const { series_id, season_number, title } = req.body;

    if (!series_id || !season_number) {
      return res.status(400).json({ message: "series_id et season_number sont obligatoires" });
    }

    // Vérifier si l'utilisateur est admin ou s'il a créé la série
    const seriesResult = await pool.query(
      "SELECT added_by FROM series WHERE id = $1",
      [series_id]
    );
    
    if (seriesResult.rows.length === 0) {
      return res.status(404).json({ message: "Serie introuvable" });
    }
    
    const seriesOwnerId = seriesResult.rows[0].added_by;
    
    // Vérifier si l'utilisateur est admin ou propriétaire de la série
    const userResult = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [req.userId]
    );
    
    const isAdmin = userResult.rows[0]?.is_admin || false;
    
    if (!isAdmin && seriesOwnerId !== req.userId) {
      return res.status(403).json({ message: "Seul le créateur de la série ou un admin peut ajouter des saisons" });
    }

    const result = await pool.query(
      `INSERT INTO seasons (series_id, season_number, title)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [series_id, season_number, title || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ message: "Cette saison existe deja pour cette serie" });
    }
    res.status(500).json({ message: "Erreur lors de la creation de la saison" });
  }
};

export const deleteSeason = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM seasons WHERE id = $1", [id]);
    res.json({ message: "Saison supprimee" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};
