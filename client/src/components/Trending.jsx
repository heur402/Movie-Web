// src/components/Trending.jsx — Modern editorial / magazine-style trending hero
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Star, ChevronLeft, ChevronRight, Info, TrendingUp, Eye, Calendar, Clock, Maximize2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const Trending = () => {
  const [movies, setMovies] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [expandedInfo, setExpandedInfo] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { dark } = useTheme();
  const { toggleFavorite, isFavorite } = useApp();

  const fetchTrending = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/movies/trending`);
      const data = await res.json();
      const trendingMovies = Array.isArray(data) ? data.slice(0, 6) : [];
      setMovies(trendingMovies);
    } catch (err) {
      console.error("Trending fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    if (!autoplay || movies.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [autoplay, movies.length]);

  const nextSlide = useCallback(() => {
    setActiveIdx((i) => (i + 1) % movies.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 3000);
  }, [movies.length]);

  const prevSlide = useCallback(() => {
    setActiveIdx((i) => (i - 1 + movies.length) % movies.length);
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 3000);
  }, [movies.length]);

  const active = movies[activeIdx];

  if (loading) {
    return (
      <div className={`relative h-[90vh] flex items-center justify-center ${
        dark ? "bg-black" : "bg-white"
      }`}>
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-2 border-red-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className={`text-xs tracking-[0.2em] uppercase font-medium ${dark ? "text-gray-600" : "text-gray-400"}`}>
            Curating selections
          </p>
        </div>
      </div>
    );
  }

  if (!active || movies.length === 0) {
    return (
      <div className={`relative h-[70vh] flex items-center justify-center ${
        dark ? "bg-black" : "bg-white"
      }`}>
        <div className="text-center px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <TrendingUp size={36} className="text-gray-400" />
          </div>
          <h3 className={`text-xl font-light mb-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
            No trending content
          </h3>
          <p className="text-sm text-gray-400">Add movies to start the collection</p>
        </div>
      </div>
    );
  }

  const bgImage = active.backdropUrl || active.posterUrls?.[0] || active.image;
  const avgRating = active.avgRating ||
    (active.ratings?.length > 0
      ? (active.ratings.reduce((s, r) => s + (r.score || r), 0) / active.ratings.length).toFixed(1)
      : active.rating || "N/A");

  const gradientFrom = dark ? "#000000" : "#ffffff";
  const gradientTo = dark ? "#0a0a0a" : "#fafafa";

  return (
    <div className="relative min-h-[90vh] overflow-hidden mt-auto">
      {/* ── Dual-layer background system ── */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {bgImage && (
              <>
                <img 
                  src={bgImage} 
                  alt="" 
                  className="w-full h-full object-cover object-center"
                />
                {/* Dramatic vignette */}
                {dark && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                  </>
                )}
                
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Split-screen content layout ── */}
      <div className="relative z-10 min-h-[90vh] flex items-center mt-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT COLUMN - Text Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Trend Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <TrendingUp size={14} className="text-red-500" />
                  <span className="text-white text-xs font-medium tracking-wider">
                    #{activeIdx + 1} TRENDING THIS WEEK
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  {active.title}
                  <span className="block text-2xl font-light text-white/50 mt-2">
                    {active.year}
                  </span>
                </h1>

                {/* Rating & Quick Stats */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Star size={15} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm">{avgRating}/5</span>
                  </div>
                  
                  {active.duration && (
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <div className="w-px h-4 bg-white/20 mr-2" />
                        <Clock size={14} />
                        <span>{active.duration}</span>
                      </div>
                    )}
                  
                </div>

                {/* Description */}
                <p className={`${dark ? 'text-base text-white/70' : 'text-black'}  leading-relaxed max-w-md
                              ${expandedInfo ? '' : 'line-clamp-3'}`}>
                  {active.description || "An extraordinary cinematic experience that redefines storytelling. Immerse yourself in a world of wonder, emotion, and breathtaking visuals."}
                </p>

                {/* Expand/Collapse Toggle */}
                {active.description?.length > 150 && (
                  <button
                    onClick={() => setExpandedInfo(!expandedInfo)}
                    className="text-white/50 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors"
                  >
                    {expandedInfo ? "Show less" : "Read more"}
                  </button>
                )}

                {/* Action Buttons - Minimal Design */}
                <div className="flex items-center gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/watch/${active._id}`)}
                    className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-red-600/25 flex items-center gap-2"
                  >
                    <Play size={18} fill="white" />
                    Watch
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/movie/${active._id}`)}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-full border border-white/20 transition-all duration-300 flex items-center gap-2"
                  >
                    <Info size={18} />
                    Details
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleFavorite(active)}
                    className={`p-3 rounded-full transition-all duration-300 ${
                      isFavorite(active._id)
                        ? "bg-red-600/20 text-red-400 border border-red-500/30"
                        : "bg-white/10 text-white/70 hover:text-white border border-white/20"
                    }`}
                  >
                    <Heart size={18} className={isFavorite(active._id) ? "fill-red-500" : ""} />
                  </motion.button>
                </div>

                {/* Meta Information Row */}
                <div className="pt-6 flex flex-wrap gap-4 text-xs text-white/40">
                  {active.genre && (
                    <span className="uppercase tracking-wider">{active.genre}</span>
                  )}
                  {active.director && (
                    <>
                      <span className="text-white/20">|</span>
                      <span className="uppercase tracking-wider">Dir. {active.director}</span>
                    </>
                  )}
                  {active.language && (
                    <>
                      <span className="text-white/20">|</span>
                      <span className="uppercase tracking-wider">{active.language}</span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* RIGHT COLUMN - Poster/Visual Preview */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, x: 40, rotateY: 15 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ opacity: 0, x: -40, rotateY: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="hidden lg:flex justify-center items-center"
              >
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Poster Frame */}
                  <div className="relative w-80 rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                    <img 
                      src={active.posterUrls?.[0] || active.image || "https://placehold.co/400x600?text=Poster"} 
                      alt={active.title}
                      className="w-full h-auto object-cover"
                    />
                    
                    {/* Overlay with rating */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-bold text-sm">{avgRating}</span>
                          <span className="text-white/50 text-xs">/5</span>
                        </div>
                        <div className="text-white/60 text-xs uppercase tracking-wider">
                          #{activeIdx + 1} Trending
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play overlay on hover */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => navigate(`/watch/${active._id}`)}
                  >
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={24} fill="white" className="ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      

      {/* ── Slide Counter Indicator ── */}
      <div className="absolute top-8 right-8 z-20 mt-10">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5">
          <span className="text-white text-xs font-mono">
            {String(activeIdx + 1).padStart(2, '0')}
            <span className="text-white/40">/{String(movies.length).padStart(2, '0')}</span>
          </span>
        </div>
      </div>

      {/* ── Autoplay Toggle ── */}
      <button
        onClick={() => setAutoplay(!autoplay)}
        className="absolute bottom-24 right-8 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all"
      >
        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
          autoplay ? "bg-green-500" : "bg-red-500"
        }`} />
      </button>
    </div>
  );
};

export default Trending;