import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  uploaded_by: number;
}

interface Season {
  id: number;
  season_number: number;
  episodes: Episode[];
  added_by?: number;
}

interface SeriesData {
  id: number;
  title: string;
  added_by: number;
  seasons: Season[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

export default function SeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesOwnerId, setSeriesOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const [newSeasonNumber, setNewSeasonNumber] = useState("");
  const [seasonError, setSeasonError] = useState("");

  const [uploadSeasonId, setUploadSeasonId] = useState<number | null>(null);
  const [epNumber, setEpNumber] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [epFile, setEpFile] = useState<File | null>(null);
  const [epSubtitleFile, setEpSubtitleFile] = useState<File | null>(null);
  const [epError, setEpError] = useState("");
  const [epUploading, setEpUploading] = useState(false);

  const isSeriesOwner = seriesOwnerId !== null && seriesOwnerId === userId;

  const fetchSeries = () => {
    api
      .get<SeriesData>(`/series/${id}`)
      .then((res) => {
        setSeriesTitle(res.data.title);
        setSeriesOwnerId(res.data.added_by);
        setSeasons(res.data.seasons || []);
      })
      .finally(() => setLoading(false));
  };

  const fetchFavoriteWatchlistStatus = () => {
    api.get("/user/favorites").then((res) => {
      setIsFavorite(res.data.some((s: { id: number }) => s.id === Number(id)));
    });
    api.get("/user/watchlist").then((res) => {
      setIsInWatchlist(res.data.some((s: { id: number }) => s.id === Number(id)));
    });
  };

  useEffect(() => {
    fetchSeries();
    fetchFavoriteWatchlistStatus();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${id}`);
      } else {
        await api.post("/user/favorites", { series_id: Number(id) });
      }
      setIsFavorite(!isFavorite);
    } catch {
      alert("Erreur lors de la mise a jour des favoris");
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await api.delete(`/user/watchlist/${id}`);
      } else {
        await api.post("/user/watchlist", { series_id: Number(id) });
      }
      setIsInWatchlist(!isInWatchlist);
    } catch {
      alert("Erreur lors de la mise a jour de la watchlist");
    }
  };

  const handleDeleteSeries = async () => {
    if (!confirm("Supprimer cette serie et tout son contenu ?")) return;
    try {
      await api.delete(`/series/${id}`);
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de la serie");
    }
  };

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    setSeasonError("");
    try {
      await api.post("/series/seasons", {
        series_id: Number(id),
        season_number: Number(newSeasonNumber),
      });
      setNewSeasonNumber("");
      fetchSeries();
    } catch (err: any) {
      setSeasonError(err.response?.data?.message || "Erreur lors de l ajout");
    }
  };

  const handleDeleteSeason = async (seasonId: number) => {
    if (!confirm("Supprimer cette saison et tous ses episodes ?")) return;
    try {
      await api.delete(`/series/seasons/${seasonId}`);
      fetchSeries();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de la saison");
    }
  };

  const handleDeleteEpisode = async (episodeId: number) => {
    if (!confirm("Supprimer cet episode ?")) return;
    try {
      await api.delete(`/series/episodes/${episodeId}`);
      fetchSeries();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de l episode");
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    setEpError("");
    if (!uploadSeasonId || !epFile) {
      setEpError("Fichier video et saison obligatoires");
      return;
    }
    setEpUploading(true);
    try {
      const formData = new FormData();
      formData.append("season_id", String(uploadSeasonId));
      formData.append("episode_number", epNumber);
      if (epTitle) formData.append("title", epTitle);
      formData.append("video", epFile);
      if (epSubtitleFile) formData.append("subtitle", epSubtitleFile);

      await api.post("/series/episodes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEpNumber("");
      setEpTitle("");
      setEpFile(null);
      setEpSubtitleFile(null);
      setUploadSeasonId(null);
      fetchSeries();
    } catch (err: any) {
      setEpError(err.response?.data?.message || "Erreur lors de l upload");
    } finally {
      setEpUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{seriesTitle}</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-lg transition ${
              isFavorite
                ? "bg-accent-500 hover:bg-accent-600"
                : "bg-dark-700 hover:bg-dark-700/70"
            }`}
          >
            {isFavorite ? "\u2665 Favori" : "\u2661 Favori"}
          </button>
          <button
            onClick={toggleWatchlist}
            className={`px-4 py-2 rounded-lg transition ${
              isInWatchlist
                ? "bg-accent-500 hover:bg-accent-600"
                : "bg-dark-700 hover:bg-dark-700/70"
            }`}
          >
            {isInWatchlist ? "\u2713 Dans ma liste" : "+ A regarder"}
          </button>
          {isSeriesOwner && (
            <button
              onClick={handleDeleteSeries}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
            >
              Supprimer la serie
            </button>
          )}
        </div>
      </div>

      {seasons.map((season) => (
        <div key={season.id} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-accent-500">
              Saison {season.season_number}
            </h2>
            <div className="flex gap-2">
              {isSeriesOwner && (
                <>
                  <button
                    onClick={() =>
                      setUploadSeasonId(uploadSeasonId === season.id ? null : season.id)
                    }
                    className="text-sm px-3 py-1 rounded-lg bg-dark-700 hover:bg-dark-700/70 transition"
                  >
                    {uploadSeasonId === season.id ? "Annuler" : "+ Episode"}
                  </button>
                  <button
                    onClick={() => handleDeleteSeason(season.id)}
                    className="text-sm px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>

          {isSeriesOwner && uploadSeasonId === season.id && (
            <form
              onSubmit={handleAddEpisode}
              className="bg-dark-800 border border-dark-700 rounded-lg p-4 mb-3 flex flex-col gap-3"
            >
              {epError && (
                <div className="bg-red-500/10 text-red-400 p-2 rounded text-sm">
                  {epError}
                </div>
              )}
              <input
                type="number"
                placeholder="Numero de l episode"
                value={epNumber}
                onChange={(e) => setEpNumber(e.target.value)}
                className="bg-dark-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent-500"
                required
              />
              <input
                type="text"
                placeholder="Titre (optionnel)"
                value={epTitle}
                onChange={(e) => setEpTitle(e.target.value)}
                className="bg-dark-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent-500"
              />
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fichier video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEpFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent-500 file:text-white hover:file:bg-accent-600 file:cursor-pointer cursor-pointer"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Sous-titres .srt (optionnel)
                </label>
                <input
                  type="file"
                  accept=".srt"
                  onChange={(e) => setEpSubtitleFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-700 file:text-white hover:file:bg-dark-700/70 file:cursor-pointer cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={epUploading}
                className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 transition rounded-lg py-2 font-semibold"
              >
                {epUploading ? "Upload en cours..." : "Ajouter l episode"}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {season.episodes.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun episode.</p>
            ) : (
              season.episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-lg px-4 py-3 transition flex items-center gap-3"
                >
                  <Link
                    to={`/watch/${ep.id}`}
                    state={{
                      episodeTitle: ep.title || `Episode ${ep.episode_number}`,
                      seriesTitle,
                      seriesId: Number(id),
                    }}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="w-24 aspect-video bg-dark-700 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
                      {ep.thumbnail_url ? (
                        <img
                          src={ep.thumbnail_url}
                          alt={ep.title || `Episode ${ep.episode_number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl opacity-30">?</span>
                      )}
                    </div>
                    <span className="text-accent-500 font-mono text-sm">
                      E{ep.episode_number}
                    </span>
                    <span className="flex-1">{ep.title || `Episode ${ep.episode_number}`}</span>
                    {ep.duration_seconds && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(ep.duration_seconds)}
                      </span>
                    )}
                  </Link>
                  {isSeriesOwner && (
                    <button
                      onClick={() => handleDeleteEpisode(ep.id)}
                      className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {isSeriesOwner && (
        <div className="mt-8 pt-6 border-t border-dark-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Ajouter une saison
          </h3>
          {seasonError && (
            <div className="bg-red-500/10 text-red-400 p-2 rounded text-sm mb-2">
              {seasonError}
            </div>
          )}
          <form onSubmit={handleAddSeason} className="flex gap-2">
            <input
              type="number"
              placeholder="Numero de saison"
              value={newSeasonNumber}
              onChange={(e) => setNewSeasonNumber(e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-accent-500 flex-1"
              required
            />
            <button
              type="submit"
              className="bg-accent-500 hover:bg-accent-600 transition rounded-lg px-4 py-2 font-semibold"
            >
              Ajouter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}