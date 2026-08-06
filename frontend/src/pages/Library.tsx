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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Catalogue partage</h1>
          <p className="text-gray-400 text-sm mt-1">
            Tout ce que la communaute a mis en ligne, gratuitement.
          </p>
        </div>
      </div>

      <div className="relative mb-10">
        <svg
          className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un anime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition placeholder:text-gray-500"
        />
      </div>

      {continueWatching.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-gray-200">
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
        <div className="p-12 text-center text-gray-400">Chargement...</div>
      ) : error ? (
        <div className="p-12 text-center text-red-400">{error}</div>
      ) : series.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
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
