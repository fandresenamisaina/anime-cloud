import { Link } from "react-router-dom";

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

export default function ContinueWatchingCard({ item }: { item: ContinueItem }) {
  const percent =
    item.duration_seconds && item.duration_seconds > 0
      ? Math.min(100, Math.round((item.progress_seconds / item.duration_seconds) * 100))
      : 0;

  return (
    <Link
      to={`/watch/${item.episode_id}`}
      state={{
        episodeTitle: item.episode_title || `Episode ${item.episode_number}`,
        seriesTitle: item.series_title,
        seriesId: item.series_id,
      }}
      className="group relative rounded-2xl overflow-hidden bg-dark-800/70 backdrop-blur-xl border border-white/10 hover:border-red-600/50 transition flex-shrink-0 w-56 shadow-lg shadow-black/20"
    >
      <div className="aspect-video bg-dark-900/60 flex items-center justify-center relative overflow-hidden">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.series_title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-20">?</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-red-700 to-red-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="p-3 border-t border-white/5">
        <p className="font-medium text-sm truncate group-hover:text-red-500 transition">
          {item.series_title}
        </p>
        <p className="text-xs text-gray-400 truncate">
          E{item.episode_number} {item.episode_title ? `- ${item.episode_title}` : ""}
        </p>
      </div>
    </Link>
  );
}
