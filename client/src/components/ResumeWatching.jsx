// src/components/ResumeWatching.jsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, RotateCcw, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

const ResumeWatching = () => {
  const { watchHistory, saveWatchProgress } = useApp();
  const navigate  = useNavigate();
  const scrollRef = useRef(null);

  // Only show entries that have meaningful progress (1–98%)
  const inProgress = watchHistory.filter(
    (m) => m.progress > 0 && m.progress < 99
  );

  if (inProgress.length === 0) return null;

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  // ── Resume: go to watch page (WatchPage reads saved progress automatically) ─
  const handleResume = (movie) => {
    navigate(`/watch/${movie._id}`);
  };

  // ── Restart: zero out progress then navigate ────────────────────────────────
  const handleRestart = (e, movie) => {
    e.stopPropagation();
    saveWatchProgress(movie, 0);
    navigate(`/watch/${movie._id}`);
  };

  return (
    <section className="px-4 md:px-8 lg:px-12 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Clock size={18} className="text-red-500" />
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Resume Watching
          </h2>
          <span className="text-xs text-gray-500 font-normal mt-0.5">
            ({inProgress.length})
          </span>
        </div>

        {/* Scroll arrows — only useful when there are enough cards */}
        {inProgress.length > 3 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll(-1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                         text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
                         text-gray-400 hover:text-white transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Scrollable card row ── */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {inProgress.map((movie, i) => (
          <ResumeCard
            key={movie._id}
            movie={movie}
            index={i}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        ))}
      </div>
    </section>
  );
};

// ── Individual card ───────────────────────────────────────────────────────────
const ResumeCard = ({ movie, index, onResume, onRestart }) => {
  const poster = movie.posterUrls?.[0] || movie.image;
  const pct    = Math.min(Math.round(movie.progress || 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onClick={() => onResume(movie)}
      className="group relative flex w-44 bg-gray-500/20 border-l-3 rounded-xl cursor-pointer gap-2 md:mr-4"
    >
      {/* ── Poster ── */}
      <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden
                      border border-white/10 group-hover:border-red-500/50
                      transition-all duration-300 shadow-lg shadow-black/40">

        {/* Image */}
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105
                       transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Clock size={28} className="text-gray-600" />
          </div>
        )}

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50
                        transition-all duration-300" />

        {/* ── Hover action buttons ── */}
        <div className="absolute inset-0 flex items-center justify-center gap-3
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Resume */}
          <button
            onClick={(e) => { e.stopPropagation(); onResume(movie); }}
            title="Resume"
            className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full
                       flex items-center justify-center shadow-xl
                       transition-all scale-90 group-hover:scale-100"
          >
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </button>

          {/* Restart */}
          <button
            onClick={(e) => onRestart(e, movie)}
            title="Restart from beginning"
            className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full
                       flex items-center justify-center shadow-xl backdrop-blur-sm
                       transition-all scale-90 group-hover:scale-100 border border-white/20"
          >
            <RotateCcw size={14} className="text-white" />
          </button>
        </div>

        
      </div>

      {/* ── Info below poster ── */}
      <div className="mt-2 px-0.5 space-y-1.5 w-full">
        <p className="text-white text-xs font-semibold truncate leading-snug
                      group-hover:text-red-400 transition-colors">
          {movie.title}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          {movie.year && (
            <span className="text-gray-500 text-xs">{movie.year}</span>
          )}
          <span className="text-gray-400 text-xs font-medium ml-2">
            {pct}%
          </span>
        </div>
        {/* ── Progress bar (bottom of poster) ── */}
        <div className=" left-0 right-0">
          {/* Track */}
          <div className="h-1 bg-black/50">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeWatching;
