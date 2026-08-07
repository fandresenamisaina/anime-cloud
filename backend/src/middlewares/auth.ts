import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";

// Interface pour les requêtes avec authentification
export interface AuthRequest extends Request {
  userId?: number;
  isAdmin?: boolean;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; isAdmin?: boolean };
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin ?? false;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expire" });
  }
};
