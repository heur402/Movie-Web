// src/components/Trending.jsx — Auto-trending hero (no manual Trending collection)
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Star, ChevronLeft, ChevronRight, Info, TrendingUp } from "lucide-react";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const Trending = () => {
  const [movies, setMovies]     = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    const fetch_ = async () => {
      try {
        // Use the new auto-trending endpoint
        const res  = await fetch(`${API}/api/movies/trending`);
        const data = await res.json();
        setMovies(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error("Trending fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  // Auto-advance every 6 s
  useEffect(() => {
    if (movies.length <= 1) return;
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % movies.length), 6000);
    return () => clearInterval(t);
  }, [movies.length]);

  const active = movies[activeIdx];

  if (loading) {
    return (
      <div className="relative h-[85vh] bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="relative h-[60vh] bg-gray-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl font-semibold">No movies yet</p>
          <p className="text-sm mt-2 text-gray-500">Add movies from the admin panel to see them here</p>
        </div>
      </div>
    );
  }

  const bgImage  = active.posterUrls?.[0] || active.image;
  const avgRating =
    active.avgRating ||
    (active.ratings?.length > 0
      ? (active.ratings.reduce((s, r) => s + (r.score || r), 0) / active.ratings.length).toFixed(1)
      : active.rating || "N/A");

  return (
    <div className="relative h-[85vh] min-h-[520px] overflow-hidden">
      {/* ── Background ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {bgImage
            ? <img src={bgImage} alt={active.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
          }
          <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.45 }}
              className="max-w-2xl"
            >
              {/* badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1
                                 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={11} /> Trending #{activeIdx + 1}
                </span>
                {active.genre && (
                  <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1
                                   rounded-full border border-white/20">
                    {active.genre}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white
                             leading-tight mb-4 drop-shadow-2xl">
                {active.title}
              </h1>

              {/* meta row */}
              <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold">{avgRating}</span>
                </div>
                {active.year     && <span className="text-gray-300">{active.year}</span>}
              </div>

              <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-8
                            line-clamp-3 max-w-xl">
                {active.description}
              </p>

              {/* actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/movie/${active._id}`)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white
                             font-bold px-8 py-3.5 rounded-xl shadow-2xl shadow-red-600/40
                             transition-colors"
                >
                  <Play size={18} fill="white" /> Watch Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(active)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold
                              border transition-all ${
                    isFavorite(active._id)
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart size={18} className={isFavorite(active._id) ? "fill-red-500" : ""} />
                  {isFavorite(active._id) ? "Saved" : "Save"}
                </motion.button>

                <button
                  onClick={() => navigate(`/movie/${active._id}`)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                             border border-white/20 text-white font-semibold px-6 py-3.5
                             rounded-xl transition-all backdrop-blur-sm"
                >
                  <Info size={18} /> More Info
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 right-6 md:right-10 z-10 flex items-center gap-3">
          <button
            onClick={() => setActiveIdx((i) => (i - 1 + movies.length) % movies.length)}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20
                       rounded-full text-white transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {movies.slice(0, 5).map((m, i) => (
              <button
                key={m._id}
                onClick={() => setActiveIdx(i)}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                  i === activeIdx
                    ? "w-16 h-20 ring-2 ring-red-500 opacity-100"
                    : "w-12 h-16 opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={m.posterUrls?.[0] || m.image || "https://placehold.co/48x64?text=?"}
                  alt={m.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveIdx((i) => (i + 1) % movies.length)}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20
                       rounded-full text-white transition-all backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* progress dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIdx ? "w-8 bg-red-500" : "w-2 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Trending;
