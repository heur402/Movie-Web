// src/components/LatestMovies.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const LatestMovies = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${API}/api/movies/latest`);
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch latest movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

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
  }, [movies]);

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
      transition={{ duration: 0.5 }}
      className="px-6 md:px-10 py-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-yellow-500 rounded-full" />
          <h2 className="text-white text-xl font-bold">{t("home.latest_releases")}</h2>
          <Sparkles size={16} className="text-yellow-400" />
        </div>
        <div className="flex items-center gap-2">
          <Link to="/explore" className="flex items-center gap-1 text-gray-400 hover:text-yellow-400 text-sm transition-colors">
            {t("common.see_all")} <ArrowRight size={14} />
          </Link>
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="shrink-0 w-40 sm:w-44 md:w-48"><SkeletonCard /></div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>{t("home.no_movies_yet")}</p>
        </div>
      ) : (
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
      )}
    </motion.section>
  );
};

export default LatestMovies;
