// src/components/Movies.jsx
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";
import Footer from "./Footer";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const Movies = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const genre = new URLSearchParams(location.search).get("genre") || "";

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API}/api/movies`);
        const data = await res.json();

        const withAvg = data.map((m) => {
          const ratings = m.ratings || [];
          const avg = ratings.length > 0
            ? (ratings.reduce((s, r) => s + (r.score || r), 0) / ratings.length).toFixed(1)
            : 0;
          return { ...m, avgRating: avg };
        });

        if (!genre) { setMovies(withAvg); return; }

        const target   = genre.toLowerCase();
        const filtered = target === "others"
          ? withAvg.filter((m) => {
              const main = ["action","romance","comedy","horror","drama","sci-fi","indian","cartoon","animation"];
              const mg   = (m.genre || "").toLowerCase().split(/[,/]/);
              return !mg.some((g) => main.some((mn) => g.includes(mn)));
            })
          : withAvg.filter((m) => {
              const mg = (m.genre || "").toLowerCase().split(/[,/]/);
              return mg.some((g) => g.includes(target) || target.includes(g.trim()));
            });

        setMovies(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black">
            {genre
              ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`
              : t("empty_states.no_movies_found")}
          </h1>
          {!loading && (
            <p className="text-gray-400 mt-1">
              {movies.length} movie{movies.length !== 1 ? "s" : ""} found
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-xl font-bold mb-2">{t("errors.no_movies_genre")}</p>
            <p className="text-gray-400 mb-6">{t("errors.no_movies_sub")}</p>
            <Link to="/explore" className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors">
              {t("empty_states.explore_all")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie, i) => <MovieCard key={movie._id} movie={movie} index={i} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Movies;
