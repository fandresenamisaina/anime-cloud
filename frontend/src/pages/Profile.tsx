import { useEffect, useState } from "react";
import api from "../api/client";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = () => {
    setLoading(true);
    setLoadError("");
    api
      .get<UserProfile>("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
        console.error("Erreur /auth/me:", err.response?.status, err.response?.data);
        setLoadError(
          err.response?.data?.message ||
            `Erreur ${err.response?.status || ""} lors du chargement du profil`
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await api.put<UserProfile>("/auth/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setAvatarFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise a jour de l avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  if (!user) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>Profil introuvable</p>
        {loadError && <p className="text-sm text-gray-500 mt-2">{loadError}</p>}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>

      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-dark-700 overflow-hidden flex items-center justify-center">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl opacity-30">?</span>
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">{user.username}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            Membre depuis le {new Date(user.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <form onSubmit={handleAvatarChange} className="w-full flex flex-col gap-3 mt-4">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-2 rounded text-sm">{error}</div>
          )}
          <label className="text-xs text-gray-400 block">Changer l avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-500 file:text-white hover:file:bg-accent-600 file:cursor-pointer cursor-pointer"
          />
          <button
            type="submit"
            disabled={!avatarFile || uploading}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition rounded-lg py-2 font-semibold"
          >
            {uploading ? "Envoi en cours..." : "Mettre a jour l avatar"}
          </button>
        </form>
      </div>
    </div>
  );
}