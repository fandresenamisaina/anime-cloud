import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  uploaded_by: number | null;
}

interface Season {
  id: number;
  season_number: number;
  episodes: Episode[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
}

export default function SeriesDetail() {
  const { id } = useParams();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [seriesOwnerId, setSeriesOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

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

  const fetchSeries = () => {
    api
      .get(`/series/${id}`)
      .then((res) => {
        setSeriesTitle(res.data.title);
        setSeriesOwnerId(res.data.added_by);
        setSeasons(res.data.seasons || []);
      })
      .finally(() => setLoading(false));
  };

  const fetchUser = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.userId ?? null);
      } catch {
        setUserId(null);
      }
    }
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
    fetchUser();
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
    } catch {
      alert("Erreur lors de la suppression de la saison");
    }
  };

  const handleDeleteEpisode = async (episodeId: number) => {
    if (!confirm("Supprimer cet episode ?")) return;
    try {
      await api.delete(`/series/episodes/${episodeId}`);
      fetchSeries();
    } catch {
      alert("Erreur lors de la suppression de l episode");
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
        // Pas de limite de temps : un upload video + traitement ffmpeg cote serveur
        // peut prendre plusieurs minutes. Un timeout par defaut (souvent 30-60s dans
        // les clients axios) coupe la connexion en plein transfert, ce qui provoque
        // une erreur "Request aborted" cote backend sans jamais renvoyer d'erreur utile.
        timeout: 0,
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

  if (loading) return <div className="p-12 text-center text-gray-400">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold">{seriesTitle}</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-xl border transition text-sm font-medium ${
              isFavorite
                ? "bg-gradient-to-r from-red-600 via-red-700 to-red-500 border-transparent"
                : "bg-dark-900/60 border-white/10 hover:bg-dark-700/60"
            }`}
          >
            {isFavorite ? "\u2665 Favori" : "\u2661 Favori"}
          </button>
          <button
            onClick={toggleWatchlist}
            className={`px-4 py-2 rounded-xl border transition text-sm font-medium ${
              isInWatchlist
                ? "bg-gradient-to-r from-red-600 via-red-700 to-red-500 border-transparent"
                : "bg-dark-900/60 border-white/10 hover:bg-dark-700/60"
            }`}
          >
            {isInWatchlist ? "\u2713 Dans ma liste" : "+ A regarder"}
          </button>
        </div>
      </div>

      {seasons.map((season) => {
        const isOwner = userId === seriesOwnerId;
        return (
        <div key={season.id} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-red-500">
              Saison {season.season_number}
            </h2>
            {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setUploadSeasonId(uploadSeasonId === season.id ? null : season.id)
                }
                className="text-sm px-3 py-1.5 rounded-lg bg-dark-900/60 border border-white/10 hover:bg-dark-700/60 transition"
              >
                {uploadSeasonId === season.id ? "Annuler" : "+ Episode"}
              </button>
              <button
                onClick={() => handleDeleteSeason(season.id)}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
              >
                Supprimer
              </button>
            </div>
            )}
          </div>

          {isOwner && uploadSeasonId === season.id && (
            <form
              onSubmit={handleAddEpisode}
              className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-3 flex flex-col gap-3"
            >
              {epError && (
                <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-2 rounded-lg text-sm">
                  {epError}
                </div>
              )}
              <input
                type="number"
                placeholder="Numero de l episode"
                value={epNumber}
                onChange={(e) => setEpNumber(e.target.value)}
                className="bg-dark-900/60 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
                required
              />
              <input
                type="text"
                placeholder="Titre (optionnel)"
                value={epTitle}
                onChange={(e) => setEpTitle(e.target.value)}
                className="bg-dark-900/60 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
              />
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Fichier video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setEpFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-red-600 file:via-red-700 file:to-red-500 file:text-white hover:file:opacity-90 file:cursor-pointer cursor-pointer"
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
                  className="text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-dark-700 file:text-white hover:file:bg-dark-700/70 file:cursor-pointer cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={epUploading}
                className="bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 disabled:opacity-50 transition rounded-xl py-2.5 font-semibold shadow-lg shadow-red-900/30"
              >
                {epUploading ? "Upload en cours..." : "Ajouter l episode"}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2">
            {season.episodes.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucun episode.</p>
            ) : (
              season.episodes.map((ep) => {
                const canDelete = userId === ep.uploaded_by;
                return (
                  <div
                    key={ep.id}
                    className="bg-dark-800/70 backdrop-blur-xl hover:border-red-600/60 border border-white/10 rounded-2xl px-4 py-3 transition flex items-center gap-3"
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
                      <div className="w-24 aspect-video bg-dark-700 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
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
                      <span className="text-red-500 font-mono text-sm">
                        E{ep.episode_number}
                      </span>
                      <span className="flex-1">{ep.title || `Episode ${ep.episode_number}`}</span>
                      {ep.duration_seconds && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(ep.duration_seconds)}
                        </span>
                      )}
                    </Link>
                    <Link
                      to={`/watch/${ep.id}`}
                      state={{
                        episodeTitle: ep.title || `Episode ${ep.episode_number}`,
                        seriesTitle,
                        seriesId: Number(id),
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 transition"
                    >
                      Voir
                    </Link>
                    {canDelete && (
                      <button
                        onClick={() => handleDeleteEpisode(ep.id)}
                        className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        );
      })}

      {userId === seriesOwnerId && (
      <div className="mt-10 pt-6 border-t border-white/10">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          Ajouter une saison
        </h3>
        {seasonError && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-2 rounded-lg text-sm mb-2">
            {seasonError}
          </div>
        )}
        <form onSubmit={handleAddSeason} className="flex gap-2">
          <input
            type="number"
            placeholder="Numero de saison"
            value={newSeasonNumber}
            onChange={(e) => setNewSeasonNumber(e.target.value)}
            className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition flex-1"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 via-red-700 to-red-500 hover:opacity-90 transition rounded-xl px-4 py-2 font-semibold shadow-lg shadow-red-900/30"
          >
            Ajouter
          </button>
        </form>
      </div>
      )}
    </div>
  );
}