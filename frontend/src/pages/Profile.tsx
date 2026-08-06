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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = () => {
    setLoading(true);
    setLoadError("");
    api
      .get<UserProfile>("/auth/me")
      .then((res) => setUser(res.data))
      .catch((err) => {
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setUpdatingProfile(true);
    try {
      const updateData: { username?: string; password?: string } = {};
      if (username.trim()) updateData.username = username.trim();
      if (password) updateData.password = password;

      if (!updateData.username && !updateData.password) {
        setError("Aucun champ a modifier");
        setUpdatingProfile(false);
        return;
      }

      const res = await api.put<UserProfile>("/user/profile", updateData);
      setUser(res.data);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise a jour du profil");
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Chargement...</div>;

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-dark-800/70 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8">
          <p className="text-red-400 font-medium">Profil introuvable</p>
          {loadError && <p className="text-sm text-gray-500 mt-2">{loadError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Mon profil</h1>

      <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 flex flex-col items-center gap-4">
        <div className="w-32 h-32 rounded-full bg-dark-900/60 border border-white/10 overflow-hidden flex items-center justify-center">
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
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <label className="text-xs text-gray-400 block">Changer l avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-fuchsia-500 file:via-purple-500 file:to-cyan-400 file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer"
          />
          <button
            type="submit"
            disabled={!avatarFile || uploading}
            className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 disabled:opacity-50 transition rounded-xl py-2.5 font-semibold shadow-lg shadow-purple-900/30"
          >
            {uploading ? "Envoi en cours..." : "Mettre a jour l avatar"}
          </button>
        </form>
      </div>

      <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 mt-6">
        <h2 className="text-xl font-bold mb-4">Modifier le profil</h2>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nouveau nom d utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
              className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={updatingProfile || (!username.trim() && !password)}
            className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 hover:opacity-90 disabled:opacity-50 transition rounded-xl py-2.5 font-semibold shadow-lg shadow-purple-900/30"
          >
            {updatingProfile ? "Mise a jour..." : "Mettre a jour le profil"}
          </button>
        </form>
      </div>
    </div>
  );
}
