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
    <div className="p-4 md:p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ajouter une serie</h1>
      {error && (
        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500"
          required
        />
        <textarea
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 resize-none"
        />
        <input
          type="text"
          placeholder="Genre (optionnel)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500"
        />
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Image de couverture (optionnel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
            className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-500 file:text-white hover:file:bg-accent-600 file:cursor-pointer cursor-pointer"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition rounded-lg py-3 font-semibold"
        >
          {loading ? "Creation..." : "Creer la serie"}
        </button>
      </form>
    </div>
  );
}
