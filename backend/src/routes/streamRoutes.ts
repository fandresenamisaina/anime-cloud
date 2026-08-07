import { Router, Request, Response, NextFunction } from "express";
import { streamEpisode } from "../controllers/streamController";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";

// Interface pour les requêtes avec authentification
export interface AuthRequest extends Request {
  userId?: number;
  isAdmin?: boolean;
}

// Auth via header OU query param (necessaire pour la balise <video>)
function streamAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = (req.query as { token?: string }).token;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : queryToken;

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expire" });
  }
}

const router = Router();

router.get("/:id", streamAuthMiddleware, streamEpisode);

export default router;
