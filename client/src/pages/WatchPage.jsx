// src/pages/WatchPage.jsx — Dedicated full-movie streaming page
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, RotateCcw, RotateCw,
  Film, AlertTriangle, Loader2, User, Star,
  ChevronRight, Settings, Subtitles
} from "lucide-react";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

// ── Format seconds → mm:ss or hh:mm:ss ───────────────────────────────────────
const fmtTime = (s) => {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${m}:${String(sec).padStart(2,"0")}`;
};

// ── Custom Video Player ───────────────────────────────────────────────────────
const VideoPlayer = ({ src, poster, title, onProgress, resumeAt = 0 }) => {
  const videoRef    = useRef(null);
  const containerRef = useRef(null);
  const hideTimer   = useRef(null);

  const [playing,    setPlaying]    = useState(false);
  const [muted,      setMuted]      = useState(false);
  const [volume,     setVolume]     = useState(1);
  const [current,   setCurrent]    = useState(0);
  const [duration,  setDuration]   = useState(0);
  const [buffered,  setBuffered]   = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [showCtrl,  setShowCtrl]   = useState(true);
  const [loading,   setLoading]    = useState(true);
  const [error,     setError]      = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Resume from saved progress
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !resumeAt || resumeAt <= 0) return;
    const onLoaded = () => {
      const t = (resumeAt / 100) * v.duration;
      if (t > 10) v.currentTime = t;
    };
    v.addEventListener("loadedmetadata", onLoaded);
    return () => v.removeEventListener("loadedmetadata", onLoaded);
  }, [resumeAt]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowCtrl(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (playing) setShowCtrl(false); }, 3000);
  }, [playing]);

  useEffect(() => { resetHideTimer(); }, [playing]);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolume = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const val = parseFloat(e.target.value);
    v.volume = val;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const skip = (secs) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + secs));
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space")       { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowRight")  skip(10);
      if (e.code === "ArrowLeft")   skip(-10);
      if (e.code === "KeyM")        toggleMute();
      if (e.code === "KeyF")        toggleFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playing]);

  const progressPct  = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct  = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video rounded-2xl overflow-hidden
                 select-none group"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowCtrl(false); }}
      onClick={togglePlay}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => { setDuration(e.target.duration); setLoading(false); }}
        onTimeUpdate={(e) => {
          setCurrent(e.target.currentTime);
          const buf = e.target.buffered;
          if (buf.length > 0) setBuffered(buf.end(buf.length - 1));
          const pct = Math.round((e.target.currentTime / e.target.duration) * 100);
          if (pct > 0) onProgress?.(pct);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        playsInline
      />

      {/* Buffering spinner */}
      <AnimatePresence>
        {loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <Loader2 size={48} className="text-red-500 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <p className="text-white font-bold text-lg">Unable to load video</p>
          <p className="text-gray-400 text-sm text-center max-w-xs">
            The video source may be unavailable or the format is not supported by your browser.
          </p>
        </div>
      )}

      {/* Big play/pause indicator */}
      <AnimatePresence>
        {!playing && !loading && !error && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play size={36} className="text-white ml-1" fill="white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showCtrl && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            {/* Title bar */}
            <div className="relative px-4 pt-4 pb-1">
              <p className="text-white font-bold text-sm md:text-base truncate drop-shadow">{title}</p>
            </div>

            {/* Progress bar */}
            <div className="relative px-4 py-2">
              <div
                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/bar hover:h-2.5 transition-all"
                onClick={handleSeek}
              >
                {/* Buffered */}
                <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                     style={{ width: `${bufferedPct}%` }} />
                {/* Played */}
                <div className="absolute inset-y-0 left-0 bg-red-500 rounded-full"
                     style={{ width: `${progressPct}%` }} />
                {/* Thumb */}
                <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-red-500 rounded-full
                                shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
                     style={{ left: `calc(${progressPct}% - 7px)` }} />
              </div>
            </div>

            {/* Bottom controls */}
            <div className="relative flex items-center gap-3 px-4 pb-4">
              {/* Play/Pause */}
              <button onClick={togglePlay}
                className="text-white hover:text-red-400 transition-colors">
                {playing ? <Pause size={22} /> : <Play size={22} fill="currentColor" />}
              </button>

              {/* Skip */}
              <button onClick={() => skip(-10)} className="text-white hover:text-red-400 transition-colors">
                <RotateCcw size={18} />
              </button>
              <button onClick={() => skip(10)} className="text-white hover:text-red-400 transition-colors">
                <RotateCw size={18} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white hover:text-red-400 transition-colors">
                  {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-20 h-1 accent-red-500 cursor-pointer hidden sm:block" />
              </div>

              {/* Time */}
              <span className="text-white text-xs font-mono ml-1 hidden sm:block">
                {fmtTime(current)} / {fmtTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Settings (playback speed) */}
              <div className="relative">
                <button onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-red-400 transition-colors">
                  <Settings size={18} />
                </button>
                <AnimatePresence>
                  {showSettings && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-gray-700
                                 rounded-xl overflow-hidden shadow-2xl min-w-[120px]">
                      <p className="text-gray-400 text-xs px-3 py-2 border-b border-gray-700">Speed</p>
                      {SPEEDS.map((s) => (
                        <button key={s} onClick={() => {
                          const v = videoRef.current;
                          if (v) v.playbackRate = s;
                          setPlaybackRate(s);
                          setShowSettings(false);
                        }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            playbackRate === s
                              ? "text-red-400 bg-red-600/10"
                              : "text-gray-300 hover:bg-white/10"
                          }`}>
                          {s === 1 ? "Normal" : `${s}×`}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen}
                className="text-white hover:text-red-400 transition-colors">
                {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── WatchPage ─────────────────────────────────────────────────────────────────
const WatchPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { saveWatchProgress, getWatchProgress, toggleFavorite, isFavorite } = useApp();

  const [movie,   setMovie]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, rRes] = await Promise.all([
          fetch(`${API}/api/movies/${id}`),
          fetch(`${API}/api/movies/${id}/related`),
        ]);
        const found = mRes.ok ? await mRes.json() : null;
        setMovie(found);
        if (rRes.ok) {
          const rel = await rRes.json();
          setRelated(Array.isArray(rel) ? rel.slice(0, 6) : []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  // Count view
  useEffect(() => {
    if (!movie) return;
    fetch(`${API}/api/movies/${id}/view`, { method: "POST" }).catch(() => {});
  }, [movie, id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-red-600 animate-spin" />
        <p className="text-gray-400 text-sm">Loading movie…</p>
      </div>
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <Film size={56} className="text-gray-600" />
      <h2 className="text-2xl font-bold">Movie not found</h2>
      <Link to="/" className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors font-semibold">
        Back to Home
      </Link>
    </div>
  );

  const videoSrc = movie.videoUrl || movie.movieLink;
  const poster   = movie.posterUrls?.[0] || movie.image;
  const resumeAt = getWatchProgress(movie._id);
  const translatorDisplay = movie.translatorName
    ? movie.translatorName.charAt(0).toUpperCase() + movie.translatorName.slice(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-40">
        <button onClick={() => navigate(`/movie/${id}`)}
          className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10
                     text-white px-4 py-2 rounded-xl hover:bg-black/90 transition-all text-sm font-medium">
          <ArrowLeft size={16} /> Back to Details
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-16">

        {/* ── Player section ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          {videoSrc ? (
            <VideoPlayer
              src={videoSrc}
              poster={poster}
              title={movie.title}
              resumeAt={resumeAt}
              onProgress={(pct) => saveWatchProgress(movie, pct)}
            />
          ) : (
            /* No video source */
            <div className="aspect-video bg-gray-900 rounded-2xl flex flex-col items-center
                            justify-center gap-4 border border-gray-800">
              {poster && <img src={poster} alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-2xl" />}
              <div className="relative z-10 text-center px-6">
                <AlertTriangle size={52} className="text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Full Movie Unavailable</h3>
                <p className="text-gray-400 text-sm max-w-sm">
                  The full movie source hasn't been added yet. Check back later or watch the trailer.
                </p>
                <button onClick={() => navigate(`/movie/${id}`)}
                  className="mt-5 flex items-center gap-2 mx-auto px-5 py-2.5 bg-red-600
                             hover:bg-red-500 text-white rounded-xl font-semibold transition-colors">
                  <Play size={16} /> Watch Trailer
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Movie info + related ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-4">

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-black">{movie.title}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 flex-wrap">
                  {movie.year  && <span>{movie.year}</span>}
                  {movie.genre && <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{movie.genre}</span>}
                  {movie.duration && <span>{movie.duration}</span>}
                </div>
                {translatorDisplay && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <User size={13} className="text-blue-400" />
                    <span className="text-blue-400 text-sm font-medium">{translatorDisplay}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => toggleFavorite(movie)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isFavorite(movie._id)
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}>
                  <Star size={15} className={isFavorite(movie._id) ? "fill-red-500 text-red-500" : ""} />
                  {isFavorite(movie._id) ? "Saved" : "Save"}
                </button>
                {videoSrc && (
                  <a href={videoSrc} download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                               bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all">
                    ↓ Download
                  </a>
                )}
              </div>
            </div>

            {/* Resume indicator */}
            {resumeAt > 0 && resumeAt < 98 && (
              <div className="flex items-center gap-3 p-3 bg-red-600/10 border border-red-500/20 rounded-xl">
                <div className="flex-1">
                  <p className="text-red-400 text-xs font-medium mb-1">Resuming from {resumeAt}%</p>
                  <div className="h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${resumeAt}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Story */}
            {movie.description && (
              <div>
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2"
                    style={{ textShadow: "0 2px 12px rgba(239,68,68,0.5)" }}>
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  Story
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                  {movie.description}
                </p>
              </div>
            )}
          </motion.div>

          {/* Related */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }} className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ textShadow: "0 2px 12px rgba(239,68,68,0.5)" }}>
              <div className="w-1 h-5 bg-red-500 rounded-full" />
              Up Next
            </h2>
            <div className="flex flex-col gap-3">
              {related.length === 0
                ? <p className="text-gray-500 text-sm">No related movies.</p>
                : related.map((rel) => (
                  <Link key={rel._id} to={`/movie/${rel._id}`}
                    className="flex gap-3 bg-white/5 hover:bg-white/10 border border-white/5
                               hover:border-white/10 rounded-xl p-3 transition-all group">
                    <img src={rel.posterUrls?.[0] || rel.image || "https://placehold.co/56x80?text=?"}
                      alt={rel.title}
                      className="w-14 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">
                        {rel.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">{rel.year} · {rel.genre}</p>
                      {rel.translatorName && (
                        <p className="text-blue-400 text-xs mt-0.5 flex items-center gap-1">
                          <User size={9} />
                          {rel.translatorName.charAt(0).toUpperCase() + rel.translatorName.slice(1)}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-xs">{rel.avgRating || rel.rating || "N/A"}</span>
                      </div>
                      {(rel.videoUrl || rel.movieLink) && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs text-green-400">
                          <Play size={9} fill="currentColor" /> Available
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-600 group-hover:text-red-400 transition-colors self-center shrink-0" />
                  </Link>
                ))
              }
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default WatchPage;
