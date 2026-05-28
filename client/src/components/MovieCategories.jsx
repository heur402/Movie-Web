// src/components/MovieCategories.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const MovieCategories = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API}/api/movies`);
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="px-6 py-10 space-y-12">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, j) => <SkeletonCard key={j} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="px-6 py-20 text-center text-gray-400">
        <p className="text-xl">{t("empty_states.no_movies_found")}</p>
        <p className="text-sm mt-2">{t("home.no_movies_yet")}</p>
      </div>
    );
  }

  const grouped = movies.reduce((acc, movie) => {
    const genres = movie.genre
      ? movie.genre.split(/[,/]/).map((g) => g.trim()).filter(Boolean)
      : ["Other"];
    genres.forEach((genre) => {
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(movie);
    });
    return acc;
  }, {});

  return (
    <div className="py-8 space-y-12">
      {Object.entries(grouped).map(([genre, genreMovies], idx) => (
        <CategoryRow key={genre} genre={genre} movies={genreMovies} index={idx} />
      ))}
    </div>
  );
};

const CategoryRow = ({ genre, movies, index }) => {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, []);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth * 0.75 : -el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="px-6 md:px-10"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-red-500 rounded-full" />
          <h2 className="text-white text-xl font-bold">{genre}</h2>
          <span className="text-gray-500 text-sm">({movies.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/explore?genre=${encodeURIComponent(genre)}`}
            className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            {t("common.see_all")} <ArrowRight size={14} />
          </Link>
          <button onClick={() => scroll("left")} disabled={!canScrollLeft}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll("right")} disabled={!canScrollRight}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie, i) => (
          <div key={movie._id} className="shrink-0 w-40 sm:w-44 md:w-48">
            <MovieCard movie={movie} index={i} />
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default MovieCategories;
