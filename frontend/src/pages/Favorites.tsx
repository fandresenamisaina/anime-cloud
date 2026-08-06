import { useEffect, useState } from "react";
import api from "../api/client";
import SeriesCard from "../components/SeriesCard";

interface Series {
  id: number;
  title: string;
  cover_url?: string;
  genre?: string;
}

export default function Favorites() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/user/favorites")
      .then((res) => setSeries(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-3xl font-extrabold mb-8">Mes favoris</h1>
      {loading ? (
        <div className="p-12 text-center text-gray-400">Chargement...</div>
      ) : series.length === 0 ? (
        <div className="bg-dark-800/70 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-500">Aucune serie en favori pour le moment.</p>
        </div>
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
