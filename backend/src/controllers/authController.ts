import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db";
import { s3Client, BUCKET_AVATARS } from "../config/minio";
import { AuthRequest } from "../middlewares/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MINIO_PUBLIC_URL = process.env.MINIO_ENDPOINT || "http://localhost:9000";

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email ou pseudo deja utilise" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let avatarUrl: string | null = null;

    if (req.file) {
      const key = `avatars/${uuidv4()}-${req.file.originalname}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_AVATARS,
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      avatarUrl = `${MINIO_PUBLIC_URL}/${BUCKET_AVATARS}/${key}`;
    }

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, created_at`,
      [username, email, passwordHash, avatarUrl]
    );

    const user = result.rows[0];

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l inscription" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1",
      [req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation du profil" });
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Fichier avatar obligatoire" });
    }

    const key = `avatars/${uuidv4()}-${req.file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_AVATARS,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );
    const avatarUrl = `${MINIO_PUBLIC_URL}/${BUCKET_AVATARS}/${key}`;

    const result = await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, username, email, avatar_url, created_at`,
      [avatarUrl, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise a jour de l avatar" });
  }
};

export const googleCallback = (req: AuthRequest, res: Response) => {
  const user = req.user as { id: number; is_admin?: boolean } | undefined;
  if (!user) {
    return res.redirect(`${FRONTEND_URL}/login`);
  }
  const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });
  res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
};
