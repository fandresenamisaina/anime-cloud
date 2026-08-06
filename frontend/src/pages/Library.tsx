import { useEffect, useState } from "react";
import api from "../api/client";
import SeriesCard from "../components/SeriesCard";
import ContinueWatchingCard from "../components/ContinueWatchingCard";

interface Series {
  id: number;
  title: string;
  cover_url?: string;
  genre?: string;
}

interface ContinueItem {
  episode_id: number;
  episode_number: number;
  episode_title: string;
  duration_seconds: number | null;
  progress_seconds: number;
  season_id: number;
  season_number: number;
  series_id: number;
  series_title: string;
  cover_url: string | null;
}

export default function Library() {
  const [series, setSeries] = useState<Series[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchSeries = (query: string) => {
    setLoading(true);
    api
      .get("/series", { params: query ? { search: query } : {} })
      .then((res) => setSeries(res.data))
      .catch(() => setError("Impossible de charger la bibliotheque"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api
      .get("/watch-history/continue-watching")
      .then((res) => setContinueWatching(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchSeries(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Bibliotheque</h1>
        <input
          type="text"
          placeholder="Rechercher une serie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500 w-full max-w-xs"
        />
      </div>

      {continueWatching.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">
            Continuer a regarder
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {continueWatching.map((item) => (
              <ContinueWatchingCard key={item.episode_id} item={item} />
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-400">Chargement...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-400">{error}</div>
      ) : series.length === 0 ? (
        <p className="text-gray-400">
          {search ? "Aucun resultat pour cette recherche." : "Aucune serie pour le moment."}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {series.map((s) => (
            <SeriesCard key={s.id} id={s.id} title={s.title} coverUrl={s.cover_url} />
          ))}
        </div>
      )}
    </div>
  );
}
