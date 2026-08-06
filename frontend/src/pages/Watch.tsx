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
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => (state.seriesId ? navigate(`/series/${state.seriesId}`) : navigate(-1))}
          className="text-sm px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 transition"
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
      <div className="rounded-xl overflow-hidden bg-black">
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
      {startTime && startTime > 5 && (
        <p className="text-sm text-gray-500 mt-2">
          Reprise a {Math.floor(startTime / 60)}:{String(startTime % 60).padStart(2, "0")}
        </p>
      )}
    </div>
  );
}
