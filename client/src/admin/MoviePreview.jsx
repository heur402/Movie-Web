// src/admin/MoviePreview.jsx — Admin view of all movies as cards (client-style)
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Star, User, ExternalLink, Search, X, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const MoviePreview = () => {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/movies`);
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  const filtered = movies.filter((m) =>
    !search.trim() ||
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.genre?.toLowerCase().includes(search.toLowerCase()) ||
    m.translatorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Movie Preview</h2>
          <p className="text-gray-400 text-sm mt-1">
            All {movies.length} movies — as seen by users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMovies}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400
                       hover:text-white rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30
                       border border-red-500/30 text-red-400 rounded-xl text-sm font-medium
                       transition-all"
          >
            <ExternalLink size={15} /> Open Site
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, genre, translator…"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                     rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none
                     focus:ring-2 focus:ring-red-500/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-white/10" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-white/10 rounded w-3/4" />
                <div className="h-2.5 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-semibold">No movies found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((movie, i) => (
            <AdminMovieCard key={movie._id} movie={movie} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Card (mirrors client MovieCard but with admin edit link) ──────────────────
const AdminMovieCard = ({ movie, index }) => {
  const [imgError, setImgError] = useState(false);

  const poster = imgError
    ? "https://placehold.co/300x450/111827/6b7280?text=No+Image"
    : movie.posterUrls?.[0] || movie.image
      || "https://placehold.co/300x450/111827/6b7280?text=No+Image";

  const avgRating =
    movie.avgRating ||
    (movie.ratings?.length > 0
      ? (movie.ratings.reduce((s, r) => s + (r.score || r), 0) / movie.ratings.length).toFixed(1)
      : movie.rating || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
      className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg
                 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300
                 hover:-translate-y-1 border border-white/5 hover:border-white/10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10
                        to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Actions on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2
                        opacity-0 group-hover:opacity-100 transition-all duration-300">
          {/* View on site */}
          <Link
            to={`/movie/${movie._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-red-600 hover:bg-red-500 rounded-full shadow-xl transition-all
                       hover:scale-110"
            title="View on site"
          >
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </Link>
          {/* View detail in admin */}
          <Link
            to={`/admin/movies/${movie._id}`}
            className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full
                       shadow-xl transition-all hover:scale-110"
            title="View movie details"
          >
            <ExternalLink size={14} className="text-white" />
          </Link>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70
                        backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{avgRating}</span>
        </div>

        {/* Has full movie indicator */}
        {(movie.videoUrl || movie.movieLink) && (
          <div className="absolute top-2 right-2 bg-green-500/80 backdrop-blur-sm
                          px-1.5 py-0.5 rounded-full">
            <span className="text-white text-xs font-bold">▶</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate leading-tight">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-xs truncate">{movie.genre}</span>
          <span className="text-gray-500 text-xs shrink-0 ml-1">{movie.year}</span>
        </div>
        {movie.translatorName && (
          <div className="flex items-center gap-1 mt-1.5">
            <User size={9} className="text-blue-400 shrink-0" />
            <span className="text-blue-400 text-xs truncate">
              {movie.translatorName.charAt(0).toUpperCase() + movie.translatorName.slice(1)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MoviePreview;
