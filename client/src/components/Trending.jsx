// src/components/Trending.jsx — Auto-trending hero (no manual Trending collection)
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Star, ChevronLeft, ChevronRight, Info, TrendingUp, Eye, Calendar, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const Trending = () => {
  const [movies, setMovies] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [views, setViews] = useState({});
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { toggleFavorite, isFavorite } = useApp();

  // Fetch trending movies
  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/movies/trending`);
      const data = await res.json();
      const trendingMovies = Array.isArray(data) ? data.slice(0, 6) : [];
      setMovies(trendingMovies);
      
      // Fetch view counts for trending movies
      const viewPromises = trendingMovies.map(movie => 
        fetch(`${API}/api/movies/${movie._id}/views`).catch(() => ({ json: () => ({ count: 0 }) }))
      );
      const viewResponses = await Promise.all(viewPromises);
      const viewCounts = {};
      viewResponses.forEach((res, idx) => {
        if (res && res.ok) {
          res.json().then(data => {
            viewCounts[trendingMovies[idx]._id] = data.count || 0;
          }).catch(() => {});
        }
      });
      setViews(viewCounts);
    } catch (err) {
      console.error("Trending fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Auto-advance with pause on hover
  useEffect(() => {
    if (!autoplay || movies.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [autoplay, movies.length]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplay(false);
  const handleMouseLeave = () => setAutoplay(true);

  // Manual navigation
  const nextSlide = useCallback(() => {
    setActiveIdx((i) => (i + 1) % movies.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 5000);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    setActiveIdx((i) => (i - 1 + movies.length) % movies.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 5000);
  }, [movies.length]);

  const active = movies[activeIdx];

  if (loading) {
    return (
      <div className={`relative h-[85vh] flex items-center justify-center ${
        dark ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={dark ? "text-gray-400" : "text-gray-600"}>Loading trending movies...</p>
        </div>
      </div>
    );
  }

  if (!active || movies.length === 0) {
    return (
      <div className={`relative h-[60vh] flex items-center justify-center ${
        dark ? "bg-gray-950" : "bg-gray-50"
      }`}>
        <div className="text-center">
          <TrendingUp size={48} className={`mx-auto mb-4 ${
            dark ? "text-gray-600" : "text-gray-400"
          }`} />
          <p className={`text-xl font-semibold ${dark ? "text-gray-300" : "text-gray-700"}`}>
            No movies yet
          </p>
          <p className={`text-sm mt-2 ${dark ? "text-gray-500" : "text-gray-500"}`}>
            Add movies from the admin panel to see them here
          </p>
        </div>
      </div>
    );
  }

  const bgImage = active.backdropUrl || active.posterUrls?.[0] || active.image;
  const avgRating = active.avgRating ||
    (active.ratings?.length > 0
      ? (active.ratings.reduce((s, r) => s + (r.score || r), 0) / active.ratings.length).toFixed(1)
      : active.rating || "N/A");

  // Format view count
  const formatViews = (count) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div 
      className="relative h-[85vh] min-h-[560px] max-h-[800px] overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Background with parallax effect ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          {bgImage ? (
            <img 
              src={bgImage} 
              alt={active.title} 
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          ) : (
            <div className={`w-full h-full ${dark ? "bg-gradient-to-br from-gray-900 to-black" : "bg-gradient-to-br from-gray-200 to-gray-300"}`} />
          )}
          {/* Enhanced gradients for better text readability - keep these dark for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-l from-black/30 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="bg-red-600 text-white text-xs font-bold px-3 py-1.5
                             rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
                >
                  <TrendingUp size={12} /> Trending #{activeIdx + 1}
                </motion.div>
                
                {active.genre && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-xs px-3 py-1.5
                                   rounded-full border border-white/20">
                    {active.genre}
                  </span>
                )}
                
                {active.year && (
                  <span className="bg-white/10 backdrop-blur-md text-white text-xs px-3 py-1.5
                                   rounded-full border border-white/20 flex items-center gap-1">
                    <Calendar size={10} /> {active.year}
                  </span>
                )}
              </div>

              {/* Title - always white because of dark background overlay */}
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl font-black text-white
                           leading-tight mb-4 drop-shadow-2xl tracking-tight"
              >
                {active.title}
              </motion.h1>

              {/* Meta row with enhanced info */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 mb-4 text-sm flex-wrap"
              >
                <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-bold">{avgRating}</span>
                  <span className="text-gray-300 text-xs">/10</span>
                </div>
                
                {views[active._id] > 0 && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Eye size={12} className="text-blue-400" />
                    <span className="text-blue-400 font-medium text-sm">
                      {formatViews(views[active._id])} views
                    </span>
                  </div>
                )}
                
                {active.duration && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Clock size={12} className="text-gray-300" />
                    <span className="text-gray-200 text-sm">{active.duration}</span>
                  </div>
                )}
              </motion.div>

              {/* Description - light gray for readability */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-200 text-base md:text-lg leading-relaxed mb-8
                           line-clamp-3 max-w-xl drop-shadow-md"
              >
                {active.description || "No description available. Click 'More Info' to learn about this movie."}
              </motion.p>

              {/* Action buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/watch/${active._id}`)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white
                             font-bold px-8 py-3.5 rounded-xl shadow-2xl shadow-red-600/40
                             transition-all duration-300 hover:shadow-red-500/50"
                >
                  <Play size={18} fill="white" /> Watch Now
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(active)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold
                              border transition-all duration-300 backdrop-blur-sm ${
                    isFavorite(active._id)
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <Heart size={18} className={isFavorite(active._id) ? "fill-red-500" : ""} />
                  {isFavorite(active._id) ? "Saved" : "Save"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/movie/${active._id}`)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20
                             border border-white/20 text-white font-semibold px-6 py-3.5
                             rounded-xl transition-all duration-300 backdrop-blur-sm"
                >
                  <Info size={18} /> More Info
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Thumbnail strip with hover effects ── */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-4 md:right-8 z-20 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20
                       rounded-full text-white transition-all backdrop-blur-md
                       hover:shadow-lg"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="flex gap-2">
            {movies.slice(0, 6).map((m, i) => (
              <motion.button
                key={m._id}
                onClick={() => setActiveIdx(i)}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.05 }}
                className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                  i === activeIdx
                    ? "w-16 h-20 ring-2 ring-red-500 ring-offset-2 ring-offset-black/50 opacity-100"
                    : "w-12 h-16 opacity-40 hover:opacity-80"
                }`}
              >
                <img
                  src={m.posterUrls?.[0] || m.image || "https://placehold.co/48x64?text=?"}
                  alt={m.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Hover tooltip */}
                {hoveredIndex === i && i !== activeIdx && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm
                                  text-white text-[10px] font-medium py-1 text-center truncate px-1">
                    {m.title.length > 15 ? m.title.slice(0, 15) + "…" : m.title}
                  </div>
                )}
                {/* Rank badge */}
                <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold
                               px-1.5 py-0.5 rounded-br-md">
                  #{i + 1}
                </div>
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20
                       rounded-full text-white transition-all backdrop-blur-md
                       hover:shadow-lg"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      )}

      {/* Progress indicators with animation */}
      {movies.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {movies.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="relative h-1 rounded-full transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 rounded-full ${
                i === activeIdx ? "w-8 bg-red-500" : "w-2 bg-white/30"
              }`} />
              {i === activeIdx && autoplay && (
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0 bg-red-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Pause indicator */}
      {!autoplay && movies.length > 1 && (
        <div className="absolute top-20 right-4 z-20 bg-black/60 backdrop-blur-sm
                       px-2 py-1 rounded-md text-white text-xs">
          Paused
        </div>
      )}
    </div>
  );
};

export default Trending;