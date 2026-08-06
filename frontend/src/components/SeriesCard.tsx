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
      className="group relative rounded-2xl overflow-hidden bg-dark-800/70 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition aspect-[2/3] flex flex-col shadow-lg shadow-black/20"
      style={{ '--card-accent': '#7c3aed' } as React.CSSProperties}
    >
      <div className="flex-1 bg-dark-900/60 flex items-center justify-center relative overflow-hidden">
        {coverUrl ? (
          <img 
            src={coverUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            onLoad={(e) => {
              const img = e.currentTarget;
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              if (ctx) {
                canvas.width = 50;
                canvas.height = 50;
                ctx.drawImage(img, 0, 0, 50, 50);
                const imageData = ctx.getImageData(0, 0, 50, 50).data;
                let r = 0, g = 0, b = 0, count = 0;
                for (let i = 0; i < imageData.length; i += 4) {
                  r += imageData[i];
                  g += imageData[i + 1];
                  b += imageData[i + 2];
                  count++;
                }
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                const color = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
                img.closest('a')?.style.setProperty('--card-accent', color);
              }
            }}
          />
        ) : (
          <span className="text-4xl opacity-20">?</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3 border-t border-white/5">
        <p className="font-medium text-sm truncate group-hover:text-[var(--card-accent)] transition">
          {title}
        </p>
      </div>
    </Link>
  );
}
