import { Response } from "express";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { pool } from "../config/db";
import { AuthRequest } from "../middlewares/auth";
import { s3Client, BUCKET_AVATARS, BUCKET_VIDEOS, BUCKET_COVERS, BUCKET_THUMBNAILS } from "../config/minio";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, avatar_url, is_admin, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des utilisateurs" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.userId) {
      return res.status(400).json({ message: "Tu ne peux pas supprimer ton propre compte ici" });
    }
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "Utilisateur supprime" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression de l utilisateur" });
  }
};

export const toggleUserAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET is_admin = NOT is_admin WHERE id = $1 RETURNING id, username, is_admin",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise a jour" });
  }
};

export const getAllSeriesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.title, s.genre, s.cover_url, s.created_at, s.added_by,
              u.username as owner_username,
              (SELECT COUNT(*) FROM seasons se WHERE se.series_id = s.id) as season_count,
              (SELECT COUNT(*) FROM episodes e JOIN seasons se ON e.season_id = se.id WHERE se.series_id = s.id) as episode_count
       FROM series s
       LEFT JOIN users u ON u.id = s.added_by
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des series" });
  }
};

export const getAllEpisodesAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.episode_number, e.video_url, e.thumbnail_url, 
              e.duration_seconds, e.created_at, e.uploaded_by,
              u.username as uploader_username,
              s.title as series_title,
              se.season_number
       FROM episodes e
       JOIN seasons se ON e.season_id = se.id
       JOIN series s ON s.id = se.series_id
       LEFT JOIN users u ON u.id = e.uploaded_by
       ORDER BY e.created_at DESC`
    );

    // Convertir les URLs MinIO en URLs de streaming
    const episodesWithStreamUrl = result.rows.map((episode: any) => ({
      ...episode,
      stream_url: `http://localhost:4000/api/stream/${episode.id}`
    }));

    res.json(episodesWithStreamUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des episodes" });
  }
};

export const adminDeleteSeries = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM series WHERE id = $1", [id]);
    res.json({ message: "Serie supprimee par admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

export const adminDeleteEpisode = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM episodes WHERE id = $1", [id]);
    res.json({ message: "Episode supprime par admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [users, series, episodes, storage] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users"),
      pool.query("SELECT COUNT(*) FROM series"),
      pool.query("SELECT COUNT(*) FROM episodes"),
      pool.query("SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds FROM episodes"),
    ]);
    res.json({
      totalUsers: Number(users.rows[0].count),
      totalSeries: Number(series.rows[0].count),
      totalEpisodes: Number(episodes.rows[0].count),
      totalDurationSeconds: Number(storage.rows[0].total_seconds),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation des statistiques" });
  }
};

// Récupère la taille d'un bucket. Si MinIO est injoignable (down, mauvaise
// config, credentials invalides, etc.), on ne fait pas planter toute la
// route /admin/storage : on renvoie juste des valeurs à zéro pour ce bucket
// et on logge l'erreur côté serveur pour debug.
async function getBucketSize(bucket: string): Promise<{ count: number; sizeBytes: number }> {
  let count = 0;
  let sizeBytes = 0;
  let continuationToken: string | undefined = undefined;
  try {
    do {
      const result: any = await s3Client.send(
        new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken })
      );
      (result.Contents || []).forEach((obj: any) => {
        count += 1;
        sizeBytes += obj.Size || 0;
      });
      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error(`Stockage indisponible pour le bucket "${bucket}":`, (err as Error).message);
    return { count: 0, sizeBytes: 0 };
  }
  return { count, sizeBytes };
}

export const getStorageStats = async (req: AuthRequest, res: Response) => {
  try {
    const [avatars, videos, covers, thumbnails] = await Promise.all([
      getBucketSize(BUCKET_AVATARS),
      getBucketSize(BUCKET_VIDEOS),
      getBucketSize(BUCKET_COVERS),
      getBucketSize(BUCKET_THUMBNAILS),
    ]);
    res.json({ avatars, videos, covers, thumbnails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la recuperation du stockage" });
  }
};