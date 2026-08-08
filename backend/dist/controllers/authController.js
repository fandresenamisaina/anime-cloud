"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.updateAvatar = exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const db_1 = require("../config/db");
const minio_1 = require("../config/minio");
const JWT_SECRET = process.env.JWT_SECRET || "secret_par_defaut";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const MINIO_PUBLIC_URL = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Champs manquants" });
        }
        const existing = await db_1.pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Email ou pseudo deja utilise" });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        let avatarUrl = null;
        if (req.file) {
            const key = `avatars/${(0, uuid_1.v4)()}-${req.file.originalname}`;
            await minio_1.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: minio_1.BUCKET_AVATARS,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
            avatarUrl = `${MINIO_PUBLIC_URL}/${minio_1.BUCKET_AVATARS}/${key}`;
        }
        const result = await db_1.pool.query(`INSERT INTO users (username, email, password_hash, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, avatar_url, created_at`, [username, email, passwordHash, avatarUrl]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ user, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de l inscription" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Champs manquants" });
        }
        const result = await db_1.pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user || !user.password_hash) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ message: "Identifiants invalides" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
            },
            token,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la connexion" });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const result = await db_1.pool.query("SELECT id, username, email, avatar_url, created_at FROM users WHERE id = $1", [req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la recuperation du profil" });
    }
};
exports.getMe = getMe;
const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Fichier avatar obligatoire" });
        }
        const key = `avatars/${(0, uuid_1.v4)()}-${req.file.originalname}`;
        await minio_1.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: minio_1.BUCKET_AVATARS,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        }));
        const avatarUrl = `${MINIO_PUBLIC_URL}/${minio_1.BUCKET_AVATARS}/${key}`;
        const result = await db_1.pool.query(`UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, username, email, avatar_url, created_at`, [avatarUrl, req.userId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la mise a jour de l avatar" });
    }
};
exports.updateAvatar = updateAvatar;
const googleCallback = (req, res) => {
    const user = req.user;
    if (!user) {
        return res.redirect(`${FRONTEND_URL}/login`);
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, isAdmin: user.is_admin || false }, JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
};
exports.googleCallback = googleCallback;
