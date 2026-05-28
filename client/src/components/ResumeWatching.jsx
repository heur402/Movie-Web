// src/components/ResumeWatching.jsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const ResumeWatching = () => {
  const { t } = useTranslation();
  const { watchHistory, saveWatchProgress } = useApp();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const inProgress = watchHistory.filter((m) => m.progress > 0 && m.progress < 99);
  if (inProgress.length === 0) return null;

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 400, behavior: "smooth" });
  };

  const handleResume  = (movie) => navigate(`/watch/${movie._id}`);
  const handleRestart = (e, movie) => {
    e.stopPropagation();
    saveWatchProgress(movie, 0);
    navigate(`/watch/${movie._id}`);
  };

  return (
    <section className={`px-4 md:px-8 py-6 transition-colors duration-300 ${dark ? "bg-transparent" : "bg-gray-50"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clock size={18} className="text-red-500" />
          <h2 className={`text-lg font-semibold transition-colors duration-300 ${dark ? "text-white" : "text-gray-900"}`}>
            {t("home.resume_watching")}
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-300 ${dark ? "text-gray-500 bg-gray-800/50" : "text-white bg-red-500"}`}>
            {inProgress.length}
          </span>
        </div>

        {inProgress.length > 2 && (
          <div className="flex items-center gap-1.5">
            <button onClick={() => scroll(-1)}
              className={`p-1.5 rounded-md transition-all duration-300 ${dark ? "bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white" : "bg-gray-200/50 hover:bg-gray-300 text-gray-600 hover:text-gray-900"}`}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)}
              className={`p-1.5 rounded-md transition-all duration-300 ${dark ? "bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white" : "bg-gray-200/50 hover:bg-gray-300 text-gray-600 hover:text-gray-900"}`}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <AnimatePresence>
          {inProgress.map((movie, index) => (
            <RectangularBar key={movie._id} movie={movie} index={index}
              onResume={handleResume} onRestart={handleRestart} dark={dark} t={t} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

const RectangularBar = ({ movie, index, onResume, onRestart, dark, t }) => {
  const poster   = movie.posterUrls?.[0] || movie.image;
  const progress = Math.min(Math.round(movie.progress || 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => onResume(movie)}
      className={`group relative flex-shrink-0 w-80 md:w-96 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
        dark
          ? "bg-gradient-to-r from-gray-900/80 to-gray-800/50 hover:from-gray-800/90 hover:to-gray-700/60 border border-gray-700/50 hover:border-red-500/40"
          : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-300 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-center p-2.5 gap-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0">
          <div className={`w-14 h-20 rounded-md overflow-hidden shadow-md ${dark ? "bg-gray-800" : "bg-gray-100"}`}>
            {poster
              ? <img src={poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
              : <div className="w-full h-full flex items-center justify-center"><Clock size={20} className={dark ? "text-gray-600" : "text-gray-400"} /></div>
            }
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-sm font-semibold truncate transition-colors duration-300 group-hover:text-red-500 ${dark ? "text-white" : "text-gray-900"}`}>
              {movie.title}
            </h3>
            <span className={`text-xs font-medium flex-shrink-0 ${dark ? "text-gray-400" : "text-gray-600"}`}>
              {progress}%
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {movie.year && <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>{movie.year}</span>}
            {movie.genre && (
              <>
                <span className={`text-xs ${dark ? "text-gray-600" : "text-gray-400"}`}>•</span>
                <span className={`text-xs truncate ${dark ? "text-gray-500" : "text-gray-500"}`}>{movie.genre}</span>
              </>
            )}
          </div>

          <div className="mt-2">
            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {movie.duration && (
            <p className={`text-xs mt-1.5 ${dark ? "text-gray-600" : "text-gray-500"}`}>
              {t("history.minutes_remaining", { minutes: Math.floor((movie.duration * (100 - progress)) / 100) })}
            </p>
          )}
        </div>

        {/* Hover actions */}
        <div className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ${dark ? "bg-black/60" : "bg-white/80"}`}>
          <button
            onClick={(e) => { e.stopPropagation(); onResume(movie); }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-md text-xs font-semibold text-white flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-md"
          >
            <Play size={14} fill="white" />
            {t("history.resume")}
          </button>
          <button
            onClick={(e) => onRestart(e, movie)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all transform hover:scale-105 shadow-md ${dark ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            <RotateCcw size={14} />
            {t("history.restart")}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResumeWatching;
