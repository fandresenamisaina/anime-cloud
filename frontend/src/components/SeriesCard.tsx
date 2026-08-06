import { Link } from "react-router-dom";

interface SeriesCardProps {
  id: number;
  title: string;
  coverUrl?: string;
}

export default function SeriesCard({ id, title, coverUrl }: SeriesCardProps) {
  return (
    <Link
      to={`/series/${id}`}
      className="group relative rounded-xl overflow-hidden bg-dark-800 border border-dark-700 hover:border-accent-500 transition aspect-[2/3] flex flex-col"
    >
      <div className="flex-1 bg-dark-700 flex items-center justify-center">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-30">?</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium text-sm truncate group-hover:text-accent-500 transition">
          {title}
        </p>
      </div>
    </Link>
  );
}
