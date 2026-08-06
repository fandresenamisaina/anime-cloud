import { Router } from "express";
import { streamEpisode } from "../controllers/streamController";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";

interface AuthRequest extends Request {
  userId?: number;
}

// Auth via header OU query param (necessaire pour la balise <video>)
function streamAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;

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
