import { useEffect, useState } from "react";
import api from "../api/client";

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
}

interface SeriesAdmin {
  id: number;
  title: string;
  genre: string | null;
  cover_url: string | null;
  owner_username: string | null;
  season_count: number;
  episode_count: number;
}

interface EpisodeAdmin {
  id: number;
  title: string | null;
  episode_number: number;
  video_url: string;
  stream_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  uploaded_by: number | null;
  uploader_username: string | null;
  series_title: string;
  season_number: number;
}

interface Stats {
  totalUsers: number;
  totalSeries: number;
  totalEpisodes: number;
  totalDurationSeconds: number;
}

interface BucketInfo {
  count: number;
  sizeBytes: number;
}

interface StorageStats {
  avatars: BucketInfo;
  videos: BucketInfo;
  covers: BucketInfo;
  thumbnails: BucketInfo;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours} h`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

type Tab = "users" | "content" | "episodes" | "storage";

interface EpisodeRowProps {
  episode: EpisodeAdmin;
  onDelete: () => void;
}

function EpisodeRow({ episode, onDelete }: EpisodeRowProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [streamSrc, setStreamSrc] = useState("");

  const handleWatch = () => {
    // Construire l'URL de streaming avec le token pour l'authentification
    const token = localStorage.getItem("token");
    const streamUrl = `http://localhost:4000/api/stream/${episode.id}${token ? `?token=${token}` : ""}`;
    setStreamSrc(streamUrl);
    setShowVideo(true);
  };

  const handleDelete = () => {
    if (!confirm(`Supprimer l episode "${episode.title || `Episode ${episode.episode_number}`}" ?`)) return;
    api.delete(`/admin/episodes/${episode.id}`).then(() => onDelete()).catch(err => alert(err.response?.data?.message || "Erreur"));
  };

  return (
    <>
      <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="w-24 h-14 bg-dark-900/60 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
          {episode.thumbnail_url ? (
            <img src={episode.thumbnail_url} alt={episode.title || "Episode"} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm opacity-30">?</span>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold">
            {episode.series_title} - Saison {episode.season_number} Episode {episode.episode_number}
          </p>
          <p className="text-xs text-gray-400">
            {episode.title || `Episode ${episode.episode_number}`} - {episode.duration_seconds ? Math.floor(episode.duration_seconds / 60) + " min" : "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            Importe par {episode.uploader_username || "inconnu"} le {new Date(episode.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <button
          onClick={handleWatch}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 transition"
        >
          Voir
        </button>
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = episode.stream_url;
            link.download = `${episode.series_title}_S${episode.season_number}E${episode.episode_number}.mp4`;
            link.click();
          }}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 transition"
        >
          Telecharger
        </button>
        <button
          onClick={handleDelete}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
        >
          Supprimer
        </button>
      </div>

      {showVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold">
                {episode.series_title} - S{episode.season_number}E{episode.episode_number}
              </h3>
              <button
                onClick={() => {
                  setShowVideo(false);
                  setStreamSrc("");
                }}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video
                src={streamSrc}
                controls
                autoPlay
                className="w-full h-full"
                poster={episode.thumbnail_url || undefined}
                preload="metadata"
                playsInline
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesAdmin[]>([]);
  const [episodesList, setEpisodesList] = useState<EpisodeAdmin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [storage, setStorage] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = () => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get<User[]>("/admin/users"),
      api.get<SeriesAdmin[]>("/admin/series"),
      api.get<EpisodeAdmin[]>("/admin/episodes"),
      api.get<Stats>("/admin/stats"),
      api.get<StorageStats>("/admin/storage"),
    ])
      .then(([usersRes, seriesRes, episodesRes, statsRes, storageRes]) => {
        setUsers(usersRes.data);
        setSeriesList(seriesRes.data);
        setEpisodesList(episodesRes.data);
        setStats(statsRes.data);
        setStorage(storageRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Erreur lors du chargement");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleToggleAdmin = async (id: number) => {
    try {
      await api.put(`/admin/users/${id}/toggle-admin`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la mise a jour");
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`Supprimer l utilisateur ${username} et tout son contenu ?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleDeleteSeries = async (id: number, title: string) => {
    if (!confirm(`Supprimer la serie "${title}" et tout son contenu ?`)) return;
    try {
      await api.delete(`/admin/series/${id}`);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Chargement...</div>;
  if (error) return <div className="p-12 text-center text-red-400">{error}</div>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "users", label: "Utilisateurs" },
    { key: "content", label: "Series" },
    { key: "episodes", label: "Episodes" },
    { key: "storage", label: "Stockage" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Administration</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">
              {stats.totalUsers}
            </p>
            <p className="text-xs text-gray-400 mt-1">Utilisateurs</p>
          </div>
          <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">
              {stats.totalSeries}
            </p>
            <p className="text-xs text-gray-400 mt-1">Series</p>
          </div>
          <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">
              {stats.totalEpisodes}
            </p>
            <p className="text-xs text-gray-400 mt-1">Episodes</p>
          </div>
          <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">
              {formatDuration(stats.totalDurationSeconds)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Contenu total</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-8 bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.key
                ? "bg-gradient-to-r from-red-600 via-red-700 to-red-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-dark-900/60 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm opacity-30">?</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">
                  {u.username}{" "}
                  {u.is_admin && (
                    <span className="text-xs bg-red-600/20 text-red-300 px-2 py-0.5 rounded ml-1">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => handleToggleAdmin(u.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-dark-900/60 border border-white/10 hover:bg-dark-700/60 transition"
              >
                {u.is_admin ? "Retirer admin" : "Rendre admin"}
              </button>
              <button
                onClick={() => handleDeleteUser(u.id, u.username)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div className="flex flex-col gap-2">
          {seriesList.length === 0 ? (
            <p className="text-gray-500">Aucune serie.</p>
          ) : (
            seriesList.map((s) => (
              <div
                key={s.id}
                className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <div className="w-14 h-20 bg-dark-900/60 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                  {s.cover_url ? (
                    <img src={s.cover_url} alt={s.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg opacity-30">?</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-gray-400">
                    {s.genre || "Sans genre"} - {s.season_count} saison(s), {s.episode_count} episode(s)
                  </p>
                  <p className="text-xs text-gray-500">
                    Ajoute par {s.owner_username || "inconnu"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSeries(s.id, s.title)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "episodes" && (
        <div className="flex flex-col gap-2">
          {episodesList.length === 0 ? (
            <p className="text-gray-500">Aucun episode.</p>
          ) : (
            episodesList.map((e) => (
              <EpisodeRow key={e.id} episode={e} onDelete={() => fetchAll()} />
            ))
          )}
        </div>
      )}

      {tab === "storage" && storage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["avatars", "videos", "covers", "thumbnails"] as const).map((bucket) => (
            <div key={bucket} className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-sm font-semibold text-gray-300 capitalize mb-1">{bucket}</p>
              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-600 to-red-400">
                {formatBytes(storage[bucket].sizeBytes)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{storage[bucket].count} fichier(s)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
