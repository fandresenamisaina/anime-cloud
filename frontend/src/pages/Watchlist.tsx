import { useEffect, useState } from "react";
import api from "../api/client";
import SeriesCard from "../components/SeriesCard";

interface Series {
  id: number;
  title: string;
  cover_url?: string;
  genre?: string;
}

export default function Watchlist() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/user/watchlist")
      .then((res) => setSeries(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">A regarder</h1>
      {loading ? (
        <div className="p-8 text-center text-gray-400">Chargement...</div>
      ) : series.length === 0 ? (
        <p className="text-gray-400">Aucune serie dans votre liste "a regarder".</p>
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
