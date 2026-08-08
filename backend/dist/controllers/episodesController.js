"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEpisode = exports.getEpisodeById = exports.createEpisode = exports.getThumbnailUploadUrl = exports.getVideoUploadUrl = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../config/db");
const supabase_1 = require("../config/supabase");
// Genere une URL signee permettant au navigateur d'uploader directement
// la video vers Supabase Storage, sans passer par la RAM/CPU du backend.
const getVideoUploadUrl = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: "filename est obligatoire" });
        }
        const key = `episodes/${(0, uuid_1.v4)()}-${filename}`;
        const { data, error } = await supabase_1.supabaseAdmin.storage
            .from(supabase_1.BUCKET_VIDEOS)
            .createSignedUploadUrl(key);
        if (error || !data) {
            console.error(error);
            return res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
        }
        const { data: publicUrlData } = supabase_1.supabaseAdmin.storage.from(supabase_1.BUCKET_VIDEOS).getPublicUrl(key);
        res.json({
            signedUrl: data.signedUrl,
            token: data.token,
            path: data.path,
            publicUrl: publicUrlData.publicUrl,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
    }
};
exports.getVideoUploadUrl = getVideoUploadUrl;
// Meme principe pour la miniature (image).
const getThumbnailUploadUrl = async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ message: "filename est obligatoire" });
        }
        const key = `thumbnails/${(0, uuid_1.v4)()}-${filename}`;
        const { data, error } = await supabase_1.supabaseAdmin.storage
            .from(supabase_1.BUCKET_THUMBNAILS)
            .createSignedUploadUrl(key);
        if (error || !data) {
            console.error(error);
            return res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
        }
        const { data: publicUrlData } = supabase_1.supabaseAdmin.storage.from(supabase_1.BUCKET_THUMBNAILS).getPublicUrl(key);
        res.json({
            signedUrl: data.signedUrl,
            token: data.token,
            path: data.path,
            publicUrl: publicUrlData.publicUrl,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la generation de l'URL d'upload" });
    }
};
exports.getThumbnailUploadUrl = getThumbnailUploadUrl;
// Recoit juste les URLs publiques + metadonnees en JSON (fichiers deja sur Supabase).
const createEpisode = async (req, res) => {
    try {
        const { season_id, episode_number, title, video_url, thumbnail_url, duration_seconds, } = req.body;
        if (!season_id || !episode_number || !video_url) {
            return res.status(400).json({ message: "season_id, episode_number et video_url sont obligatoires" });
        }
        const seasonResult = await db_1.pool.query("SELECT series_id FROM seasons WHERE id = $1", [season_id]);
        if (seasonResult.rows.length === 0) {
            return res.status(404).json({ message: "Saison introuvable" });
        }
        const seriesId = seasonResult.rows[0].series_id;
        const seriesResult = await db_1.pool.query("SELECT added_by FROM series WHERE id = $1", [seriesId]);
        const userResult = await db_1.pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
        const isAdmin = userResult.rows[0]?.is_admin || false;
        if (!isAdmin && seriesResult.rows[0].added_by !== req.userId) {
            return res.status(403).json({ message: "Seul le createur de la serie peut ajouter des episodes" });
        }
        const result = await db_1.pool.query(`INSERT INTO episodes (season_id, episode_number, title, video_url, thumbnail_url, duration_seconds, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [
            season_id,
            episode_number,
            title || null,
            video_url,
            thumbnail_url || null,
            duration_seconds || 0,
            req.userId,
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        if (err.code === "23505") {
            return res.status(409).json({ message: "Cet episode existe deja pour cette saison" });
        }
        res.status(500).json({ message: "Erreur lors de l ajout de l episode" });
    }
};
exports.createEpisode = createEpisode;
const getEpisodeById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db_1.pool.query("SELECT * FROM episodes WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Episode introuvable" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la recuperation de l episode" });
    }
};
exports.getEpisodeById = getEpisodeById;
const deleteEpisode = async (req, res) => {
    try {
        const { id } = req.params;
        const episodeResult = await db_1.pool.query("SELECT uploaded_by FROM episodes WHERE id = $1", [id]);
        if (episodeResult.rows.length === 0) {
            return res.status(404).json({ message: "Episode introuvable" });
        }
        const uploadedBy = episodeResult.rows[0].uploaded_by;
        const userResult = await db_1.pool.query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
        const isAdmin = userResult.rows[0]?.is_admin || false;
        if (!isAdmin && uploadedBy !== req.userId) {
            return res.status(403).json({ message: "Vous ne pouvez pas supprimer cet episode" });
        }
        await db_1.pool.query("DELETE FROM episodes WHERE id = $1", [id]);
        res.json({ message: "Episode supprime" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
exports.deleteEpisode = deleteEpisode;
