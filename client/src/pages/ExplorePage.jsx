// src/pages/ExplorePage.jsx — Full explore page with dynamic filters + search
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, ChevronDown, Film } from "lucide-react";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const PAGE_SIZE = 20;

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state — initialized from URL
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeGenre, setActiveGenre] = useState(searchParams.get("genre") || "All");
  const [activeYear, setActiveYear] = useState(searchParams.get("year") || "");
  const [page, setPage] = useState(1);

  // Data state
  const [movies, setMovies] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter options from DB
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const searchInputRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch genres + years on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [gRes, yRes] = await Promise.all([
          fetch(`${API}/api/movies/genres`),
          fetch(`${API}/api/movies/years`),
        ]);
        const g = await gRes.json();
        const y = await yRes.json();
        setGenres(Array.isArray(g) ? g : []);
        setYears(Array.isArray(y) ? y : []);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Sync URL → state when URL changes externally (e.g. navbar search)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlGenre = searchParams.get("genre") || "All";
    const urlYear = searchParams.get("year") || "";
    setSearch(urlSearch);
    setActiveGenre(urlGenre);
    setActiveYear(urlYear);
    setPage(1);
  }, [searchParams.toString()]);

  // Fetch movies whenever filters change
  const fetchMovies = useCallback(
    async (currentPage = 1, append = false) => {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: PAGE_SIZE,
        });
        if (search.trim()) params.set("search", search.trim());
        if (activeGenre && activeGenre !== "All") params.set("genre", activeGenre);
        if (activeYear) params.set("year", activeYear);

        const res = await fetch(`${API}/api/movies/explore?${params}`);
        const data = await res.json();

        if (append) {
          setMovies((prev) => [...prev, ...(data.movies || [])]);
        } else {
          setMovies(data.movies || []);
        }
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Explore fetch error:", err);
        if (!append) setMovies([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, activeGenre, activeYear]
  );

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchMovies(1, false);
      // Sync URL
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (activeGenre !== "All") params.genre = activeGenre;
      if (activeYear) params.year = activeYear;
      setSearchParams(params);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, activeGenre, activeYear]);

  // Load more
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(next, true);
  };

  // Close year dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setActiveGenre("All");
    setActiveYear("");
    setSearchParams({});
  };

  const hasActiveFilters = search || activeGenre !== "All" || activeYear;

  // Primary genres to show as pills (rest go in "More" dropdown)
  const primaryGenres = ["All", ...genres.slice(0, 6)];
  const moreGenres = genres.slice(6);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 bg-gray-950/95 backdrop-blur-xl border-b border-white/5 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">

          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/8 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Genre pills */}
            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {primaryGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveGenre(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeGenre === g
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {g}
                </button>
              ))}

              {/* More genres dropdown */}
              {moreGenres.length > 0 && (
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      moreGenres.includes(activeGenre)
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10"
                    }`}
                  >
                    {moreGenres.includes(activeGenre) ? activeGenre : "More"}
                    <ChevronDown size={12} className={`transition-transform ${showYearDropdown ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showYearDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-40 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                      >
                        {moreGenres.map((g) => (
                          <button
                            key={g}
                            onClick={() => { setActiveGenre(g); setShowYearDropdown(false); }}
                            className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                              activeGenre === g
                                ? "bg-red-600/20 text-red-400"
                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Year filter */}
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 transition-all"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-400 text-sm">
              {total > 0 ? (
                <>
                  <span className="text-white font-semibold">{total}</span> movie{total !== 1 ? "s" : ""} found
                  {hasActiveFilters && (
                    <span className="text-gray-500">
                      {activeGenre !== "All" && ` in ${activeGenre}`}
                      {activeYear && ` · ${activeYear}`}
                      {search && ` · "${search}"`}
                    </span>
                  )}
                </>
              ) : (
                "No results"
              )}
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <EmptyState search={search} genre={activeGenre} onClear={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>

            {/* Load more */}
            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  {loadingMore ? "Loading..." : `Load more (${total - movies.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

const EmptyState = ({ search, genre, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
      <Film size={32} className="text-gray-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No movies found</h3>
    <p className="text-gray-400 text-sm max-w-sm mb-6">
      {search
        ? `No results for "${search}". Try different keywords.`
        : genre !== "All"
        ? `No movies in the "${genre}" genre yet.`
        : "No movies available. Check back later."}
    </p>
    <button
      onClick={onClear}
      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors"
    >
      Clear filters
    </button>
  </motion.div>
);

export default ExplorePage;
