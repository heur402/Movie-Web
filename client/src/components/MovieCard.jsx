// src/components/MovieCard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Heart, Star, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "../context/AppContext";

const MovieCard = ({ movie, index = 0 }) => {
  const { t } = useTranslation();
  const { toggleFavorite, isFavorite } = useApp();
  const [imgError, setImgError]         = useState(false);
  const [currentPoster, setCurrentPoster] = useState(0);

  const posters = movie.posterUrls?.length > 0
    ? movie.posterUrls
    : [movie.image].filter(Boolean);

  const poster = imgError
    ? "https://placehold.co/300x450/111827/6b7280?text=No+Image"
    : posters[currentPoster] || posters[0] || "https://placehold.co/300x450/111827/6b7280?text=No+Image";

  const avgRating =
    movie.avgRating ||
    (movie.ratings?.length > 0
      ? (movie.ratings.reduce((s, r) => s + (r.score || r), 0) / movie.ratings.length).toFixed(1)
      : movie.rating || 0);

  const favorited = isFavorite(movie._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg
                 hover:shadow-2xl hover:shadow-black/70 transition-all duration-300
                 hover:-translate-y-1.5 cursor-pointer"
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play button */}
        <Link
          to={`/movie/${movie._id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          aria-label={t("movie.watch_aria", { title: movie.title })}
        >
          <motion.div
            whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.92 }}
            className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/60"
          >
            <Play size={22} className="text-white ml-1" fill="white" />
          </motion.div>
        </Link>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(movie); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 z-10"
          aria-label={favorited ? t("movie.remove_from_favorites") : t("movie.add_to_favorites")}
        >
          <Heart size={15} className={`transition-colors ${favorited ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        {/* Multi-poster dots */}
        {posters.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {posters.map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setCurrentPoster(i)}
                onClick={(e) => { e.preventDefault(); setCurrentPoster(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentPoster ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Star size={10} className="text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold">{avgRating}</span>
        </div>
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

export default MovieCard;
