import { Response, NextFunction } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "./auth";

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [req.userId]
    );
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res
        .status(403)
        .json({ message: "Acces reserve aux administrateurs" });
    }
    next();
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Erreur lors de la verification des droits" });
  }
};
