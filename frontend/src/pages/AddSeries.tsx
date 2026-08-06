import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function AddSeries() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (description) formData.append("description", description);
      if (genre) formData.append("genre", genre);
      if (cover) formData.append("cover", cover);

      const res = await api.post("/series", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/series/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la creation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Ajouter une serie</h1>

      <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre</label>
            <input
              type="text"
              placeholder="Titre de la serie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder:text-gray-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description (optionnel)
            </label>
            <textarea
              placeholder="Synopsis"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition resize-none placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Genre (optionnel)
            </label>
            <input
              type="text"
              placeholder="Shonen, Action"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-dark-900/60 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition placeholder:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Image de couverture (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-dark-700 file:text-white hover:file:bg-dark-700/70 file:cursor-pointer cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 disabled:opacity-50 transition rounded-xl py-3 font-semibold shadow-lg shadow-red-900/30"
          >
            {loading ? "Creation..." : "Creer la serie"}
          </button>
        </form>
      </div>
    </div>
  );
}
