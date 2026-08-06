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
      className="group relative rounded-xl overflow-hidden bg-dark-800 border border-dark-700 hover:border-accent-500 transition flex-shrink-0 w-56"
    >
      <div className="aspect-video bg-dark-700 flex items-center justify-center relative">
        {item.cover_url ? (
          <img src={item.cover_url} alt={item.series_title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-30">?</span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div className="h-full bg-accent-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate group-hover:text-accent-500 transition">
          {item.series_title}
        </p>
        <p className="text-xs text-gray-400 truncate">
          E{item.episode_number} {item.episode_title ? `- ${item.episode_title}` : ""}
        </p>
      </div>
    </Link>
  );
}
