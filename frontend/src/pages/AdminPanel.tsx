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

type Tab = "users" | "content" | "storage";

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesAdmin[]>([]);
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
      api.get<Stats>("/admin/stats"),
      api.get<StorageStats>("/admin/storage"),
    ])
      .then(([usersRes, seriesRes, statsRes, storageRes]) => {
        setUsers(usersRes.data);
        setSeriesList(seriesRes.data);
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

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Administration</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-accent-500">{stats.totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Utilisateurs</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-accent-500">{stats.totalSeries}</p>
            <p className="text-xs text-gray-400 mt-1">Series</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-accent-500">{stats.totalEpisodes}</p>
            <p className="text-xs text-gray-400 mt-1">Episodes</p>
          </div>
          <div className="bg-dark-800 border border-dark-700 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-accent-500">
              {formatDuration(stats.totalDurationSeconds)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Contenu total</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-dark-700">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === "users" ? "text-accent-500 border-b-2 border-accent-500" : "text-gray-400"
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setTab("content")}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === "content" ? "text-accent-500 border-b-2 border-accent-500" : "text-gray-400"
          }`}
        >
          Contenu
        </button>
        <button
          onClick={() => setTab("storage")}
          className={`px-4 py-2 text-sm font-semibold transition ${
            tab === "storage" ? "text-accent-500 border-b-2 border-accent-500" : "text-gray-400"
          }`}
        >
          Stockage
        </button>
      </div>

      {tab === "users" && (
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-dark-700 overflow-hidden flex items-center justify-center flex-shrink-0">
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
                    <span className="text-xs bg-accent-500/20 text-accent-500 px-2 py-0.5 rounded ml-1">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-400">{u.email}</p>
              </div>
              <button
                onClick={() => handleToggleAdmin(u.id)}
                className="text-xs px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
              >
                {u.is_admin ? "Retirer admin" : "Rendre admin"}
              </button>
              <button
                onClick={() => handleDeleteUser(u.id, u.username)}
                className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
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
            <p className="text-gray-400">Aucune serie.</p>
          ) : (
            seriesList.map((s) => (
              <div
                key={s.id}
                className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 flex items-center gap-3"
              >
                <div className="w-14 h-20 bg-dark-700 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
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
                  className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "storage" && storage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["avatars", "videos", "covers", "thumbnails"] as const).map((bucket) => (
            <div key={bucket} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-300 capitalize mb-1">{bucket}</p>
              <p className="text-xl font-bold text-accent-500">
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
