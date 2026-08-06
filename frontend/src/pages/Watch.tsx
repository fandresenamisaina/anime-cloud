import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../api/client";

interface LocationState {
  episodeTitle?: string;
  seriesTitle?: string;
  seriesId?: number;
}

interface EpisodeData {
  subtitle_url: string | null;
}

export default function Watch() {
  const { episodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const streamUrl = `http://localhost:4000/api/stream/${episodeId}?token=${token}`;

  useEffect(() => {
    api
      .get<EpisodeData>(`/series/episodes/${episodeId}`)
      .then((res) => setSubtitleUrl(res.data.subtitle_url))
      .catch(() => {});
  }, [episodeId]);

  useEffect(() => {
    setLoadingProgress(true);
    api
      .get(`/watch-history/${episodeId}`)
      .then((res) => {
        if (res.data && !res.data.completed) {
          setStartTime(res.data.progress_seconds);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProgress(false));
  }, [episodeId]);

  const saveProgress = (completed = false) => {
    const video = videoRef.current;
    if (!video || !episodeId) return;
    const progress = Math.floor(video.currentTime);
    if (progress <= 0) return;
    api
      .post("/watch-history", {
        episode_id: Number(episodeId),
        progress_seconds: progress,
        completed,
      })
      .catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(() => saveProgress(false), 10000);
    return () => {
      clearInterval(interval);
      saveProgress(false);
    };
  }, [episodeId]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && startTime && startTime > 5) {
      video.currentTime = startTime;
    }
  };

  const handleEnded = () => saveProgress(true);

  if (loadingProgress) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => (state.seriesId ? navigate(`/series/${state.seriesId}`) : navigate(-1))}
          className="text-sm px-3 py-2 rounded-xl bg-dark-800/70 backdrop-blur-xl border border-white/10 hover:bg-dark-700/60 transition"
        >
          &larr; Retour
        </button>
        {(state.seriesTitle || state.episodeTitle) && (
          <div className="text-sm text-gray-400">
            {state.seriesTitle}
            {state.episodeTitle ? ` - ${state.episodeTitle}` : ""}
          </div>
        )}
      </div>
      <div className="rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl shadow-black/40">
        <video
          ref={videoRef}
          src={streamUrl}
          controls
          autoPlay
          crossOrigin="anonymous"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPause={() => saveProgress(false)}
          className="w-full aspect-video"
        >
          {subtitleUrl && (
            <track
              kind="subtitles"
              src={subtitleUrl}
              srcLang="fr"
              label="Francais"
              default
            />
          )}
          Ton navigateur ne supporte pas la lecture video.
        </video>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Pour télécharger, cliquez sur les trois points verticaux
      </p>
      {startTime && startTime > 5 && (
        <p className="text-sm text-gray-500 mt-3">
          Reprise a {Math.floor(startTime / 60)}:{String(startTime % 60).padStart(2, "0")}
        </p>
      )}
    </div>
  );
}
