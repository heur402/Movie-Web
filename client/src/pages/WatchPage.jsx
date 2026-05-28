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
import { useTheme } from "../context/ThemeContext";

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
  const { dark } = useTheme();

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
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

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

  useEffect(() => { resetHideTimer(); }, [playing, resetHideTimer]);
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

  const handleVolumeUp = () => {
    const v = videoRef.current;
    if (!v) return;
    const newVolume = Math.min(1, v.volume + 0.1);
    v.volume = newVolume;
    setVolume(newVolume);
    setMuted(false);
    v.muted = false;
  };

  const handleVolumeDown = () => {
    const v = videoRef.current;
    if (!v) return;
    const newVolume = Math.max(0, v.volume - 0.1);
    v.volume = newVolume;
    setVolume(newVolume);
    setMuted(newVolume === 0);
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

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      
      switch(e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeUp();
          setShowCtrl(true);
          resetHideTimer();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeDown();
          setShowCtrl(true);
          resetHideTimer();
          break;
        case "KeyM":
          toggleMute();
          setShowCtrl(true);
          resetHideTimer();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyS":
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [playing, showSettings, resetHideTimer]);

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
            <div className={`w-20 h-20 backdrop-blur-sm rounded-full flex items-center justify-center ${
              dark ? 'bg-black/60' : 'bg-gray-800/60'
            }`}>
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
            {/* Gradient - adjusted for light mode */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none ${
              !dark && 'opacity-90'
            }`} />

            {/* Title bar */}
            <div className="relative px-4 pt-4 pb-1">
              <p className="text-white font-bold text-sm md:text-base truncate drop-shadow">{title}</p>
            </div>

            {/* Progress bar */}
            <div className="relative px-4 py-2">
              <div
                className={`relative h-1.5 rounded-full cursor-pointer group/bar hover:h-2.5 transition-all ${
                  dark ? 'bg-white/20' : 'bg-white/30'
                }`}
                onClick={handleSeek}
              >
                {/* Buffered */}
                <div className="absolute inset-y-0 left-0 bg-white/40 rounded-full"
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

              {/* Volume with slider popup */}
              <div 
                className="relative flex items-center gap-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button onClick={toggleMute} className="text-white hover:text-red-400 transition-colors">
                  {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                
                {/* Volume slider - appears on hover */}
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 80 }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={muted ? 0 : volume}
                        onChange={handleVolume}
                        className="w-20 h-1 accent-red-500 cursor-pointer"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Time */}
              <span className={`text-white text-xs font-mono ml-1 hidden sm:block ${
                !dark && 'drop-shadow-md'
              }`}>
                {fmtTime(current)} / {fmtTime(duration)}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Keyboard shortcuts hint */}
              <div className="hidden md:flex items-center gap-2 text-xs text-white/50">
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑↓</span>
                <span className="text-[10px]">Vol</span>
                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">←→</span>
                <span className="text-[10px]">Skip</span>
              </div>

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
                      className={`absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden shadow-2xl min-w-[120px] ${
                        dark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}>
                      <p className={`text-xs px-3 py-2 border-b ${
                        dark ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
                      }`}>
                        Playback Speed
                      </p>
                      {SPEEDS.map((s) => (
                        <button key={s} onClick={() => {
                          const v = videoRef.current;
                          if (v) v.playbackRate = s;
                          setPlaybackRate(s);
                          setShowSettings(false);
                        }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            playbackRate === s
                              ? dark 
                                ? "text-red-400 bg-red-600/10"
                                : "text-red-600 bg-red-100"
                              : dark
                                ? "text-gray-300 hover:bg-white/10"
                                : "text-gray-700 hover:bg-gray-100"
                          }`}>
                          {s === 1 ? "Normal" : `${s}×`}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtitles button (placeholder) */}
              <button className="text-white hover:text-red-400 transition-colors opacity-60 hover:opacity-100">
                <Subtitles size={18} />
              </button>

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
  const { dark } = useTheme();

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
    <div className={`min-h-screen ${dark ? 'bg-gray-950' : 'bg-gray-100'} flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-red-600 animate-spin" />
        <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Loading movie…</p>
      </div>
    </div>
  );

  if (!movie) return (
    <div className={`min-h-screen ${dark ? 'bg-gray-950' : 'bg-gray-100'} flex flex-col items-center justify-center gap-4 ${
      dark ? 'text-white' : 'text-gray-900'
    }`}>
      <Film size={56} className="text-gray-600" />
      <h2 className="text-2xl font-bold">Movie not found</h2>
      <Link to="/" className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors font-semibold text-white">
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
    <div className={`min-h-screen ${dark ? 'bg-gray-950' : 'bg-gray-100'} ${
      dark ? 'text-white' : 'text-gray-900'
    }`}>
      {/* Back button */}
      <div className="fixed top-4 left-4 z-40">
        <button onClick={() => navigate(`/movie/${id}`)}
          className={`flex items-center gap-2 backdrop-blur-sm border px-4 py-2 rounded-xl transition-all text-sm font-medium ${
            dark 
              ? 'bg-black/70 border-white/10 text-white hover:bg-black/90'
              : 'bg-white/90 border-gray-300 text-gray-900 hover:bg-white shadow-md'
          }`}>
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
            <div className={`aspect-video rounded-2xl flex flex-col items-center
                            justify-center gap-4 border ${dark ? 'bg-gray-900 border-gray-800' : 'bg-gray-200 border-gray-300'}`}>
              {poster && <img src={poster} alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-2xl" />}
              <div className="relative z-10 text-center px-6">
                <AlertTriangle size={52} className="text-yellow-500 mx-auto mb-4" />
                <h3 className={`text-xl font-bold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Full Movie Unavailable
                </h3>
                <p className={`text-sm max-w-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                <h1 className={`text-2xl md:text-3xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {movie.title}
                </h1>
                <div className={`flex items-center gap-3 mt-2 text-sm flex-wrap ${
                  dark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {movie.year  && <span>{movie.year}</span>}
                  {movie.genre && <span className={`px-2 py-0.5 rounded-full text-xs ${
                    dark ? 'bg-white/10' : 'bg-gray-200'
                  }`}>{movie.genre}</span>}
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
                      ? dark
                        ? "bg-red-600/20 border-red-500 text-red-400"
                        : "bg-red-100 border-red-500 text-red-600"
                      : dark
                        ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}>
                  <Star size={15} className={isFavorite(movie._id) ? "fill-red-500 text-red-500" : ""} />
                  {isFavorite(movie._id) ? "Saved" : "Save"}
                </button>
                {videoSrc && (
                  <a href={videoSrc} download
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      dark
                        ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    ↓ Download
                  </a>
                )}
              </div>
            </div>

            {/* Resume indicator */}
            {resumeAt > 0 && resumeAt < 98 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${
                dark ? 'bg-red-600/10 border border-red-500/20' : 'bg-red-100 border border-red-300'
              }`}>
                <div className="flex-1">
                  <p className={`text-xs font-medium mb-1 ${dark ? 'text-red-400' : 'text-red-700'}`}>
                    Resuming from {resumeAt}%
                  </p>
                  <div className={`h-1 rounded-full ${dark ? 'bg-white/10' : 'bg-gray-300'}`}>
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${resumeAt}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Story */}
            {movie.description && (
              <div>
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  Story
                </h2>
                <p className={`leading-relaxed text-sm md:text-base ${
                  dark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {movie.description}
                </p>
              </div>
            )}
          </motion.div>

          {/* Related */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }} className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full" />
              Up Next
            </h2>
            <div className="flex flex-col gap-3">
              {related.length === 0
                ? <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-500'}`}>No related movies.</p>
                : related.map((rel) => (
                  <Link key={rel._id} to={`/movie/${rel._id}`}
                    className={`flex gap-3 rounded-xl p-3 transition-all group ${
                      dark
                        ? 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                        : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
                    }`}>
                    <img src={rel.posterUrls?.[0] || rel.image || "https://placehold.co/56x80?text=?"}
                      alt={rel.title}
                      className="w-14 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold truncate transition-colors ${
                        dark 
                          ? 'text-white group-hover:text-red-400'
                          : 'text-gray-900 group-hover:text-red-600'
                      }`}>
                        {rel.title}
                      </h3>
                      <p className={`text-xs mt-0.5 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rel.year} · {rel.genre}
                      </p>
                      {rel.translatorName && (
                        <p className={`text-xs mt-0.5 flex items-center gap-1 ${
                          dark ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          <User size={9} />
                          {rel.translatorName.charAt(0).toUpperCase() + rel.translatorName.slice(1)}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-xs">{rel.avgRating || rel.rating || "N/A"}</span>
                      </div>
                      {(rel.videoUrl || rel.movieLink) && (
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs ${
                          dark ? 'text-green-400' : 'text-green-600'
                        }`}>
                          <Play size={9} fill="currentColor" /> Available
                        </span>
                      )}
                    </div>
                    <ChevronRight size={16} className={`self-center shrink-0 ${
                      dark ? 'text-gray-600 group-hover:text-red-400' : 'text-gray-400 group-hover:text-red-600'
                    }`} />
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