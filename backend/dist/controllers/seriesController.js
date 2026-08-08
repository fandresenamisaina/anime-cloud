"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSeries = exports.getSeriesById = exports.getAllSeries = exports.createSeries = void 0;
const uuid_1 = require("uuid");
const client_s3_1 = require("@aws-sdk/client-s3");
const db_1 = require("../config/db");
const minio_1 = require("../config/minio");
const createSeries = async (req, res) => {
    try {
        const { title, description, genre } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Le titre est obligatoire" });
        }
        let coverUrl = null;
        if (req.file) {
            const key = `covers/${(0, uuid_1.v4)()}-${req.file.originalname}`;
            await minio_1.s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: minio_1.BUCKET_COVERS,
                Key: key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
            coverUrl = `http://localhost:9000/${minio_1.BUCKET_COVERS}/${key}`;
        }
        const result = await db_1.pool.query(`INSERT INTO series (title, description, cover_url, genre, added_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [title, description || null, coverUrl, genre || null, req.userId]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la creation de la serie" });
    }
};
exports.createSeries = createSeries;
const getAllSeries = async (req, res) => {
    try {
        const search = req.query.search || "";
        const result = await db_1.pool.query(`SELECT * FROM series
       WHERE title ILIKE $1
       ORDER BY created_at DESC`, [`%${search}%`]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la recuperation des series" });
    }
};
exports.getAllSeries = getAllSeries;
const getSeriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const seriesResult = await db_1.pool.query("SELECT * FROM series WHERE id = $1", [id]);
        if (seriesResult.rows.length === 0) {
            return res.status(404).json({ message: "Serie introuvable" });
        }
        const seasonsResult = await db_1.pool.query(`SELECT * FROM seasons WHERE series_id = $1 ORDER BY season_number ASC`, [id]);
        const seasons = await Promise.all(seasonsResult.rows.map(async (season) => {
            const episodesResult = await db_1.pool.query(`SELECT e.id, e.episode_number, e.title, e.thumbnail_url, e.duration_seconds, e.uploaded_by
           FROM episodes e
           WHERE e.season_id = $1
           ORDER BY e.episode_number ASC`, [season.id]);
            return { ...season, episodes: episodesResult.rows };
        }));
        res.json({ ...seriesResult.rows[0], seasons });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la recuperation de la serie" });
    }
};
exports.getSeriesById = getSeriesById;
const deleteSeries = async (req, res) => {
    try {
        const { id } = req.params;
        const seriesResult = await db_1.pool.query("SELECT added_by FROM series WHERE id = $1", [id]);
        if (seriesResult.rows.length === 0) {
            return res.status(404).json({ message: "Serie introuvable" });
        }
        if (seriesResult.rows[0].added_by !== req.userId) {
            return res.status(403).json({ message: "Tu ne peux supprimer que tes propres series" });
        }
        await db_1.pool.query("DELETE FROM series WHERE id = $1", [id]);
        res.json({ message: "Serie supprimee" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
exports.deleteSeries = deleteSeries;
