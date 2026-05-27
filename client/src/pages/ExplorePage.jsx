// src/pages/ExplorePage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown, Film, User } from "lucide-react";
import MovieCard    from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import Footer       from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const API       = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const PAGE_SIZE = 20;

const ExplorePage = () => {
  const { dark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter state (synced with URL) ─────────────────────────────────────────
  const [search,           setSearch]           = useState(searchParams.get("search")     || "");
  const [activeGenre,      setActiveGenre]      = useState(searchParams.get("genre")      || "All");
  const [activeYear,       setActiveYear]       = useState(searchParams.get("year")       || "");
  const [activeTranslator, setActiveTranslator] = useState(searchParams.get("translator") || "");
  const [translatorSearch, setTranslatorSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showMoreGenres,   setShowMoreGenres]   = useState(false);
  const [showTranslators,  setShowTranslators]  = useState(false);

  // ── Data state ─────────────────────────────────────────────────────────────
  const [movies,      setMovies]      = useState([]);
  const [total,       setTotal]       = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Filter options from DB ─────────────────────────────────────────────────
  const [genres,      setGenres]      = useState([]);
  const [years,       setYears]       = useState([]);
  const [translators, setTranslators] = useState([]);

  const debounceRef      = useRef(null);
  const moreGenresRef    = useRef(null);
  const translatorRef    = useRef(null);

  // ── Fetch filter options on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [gRes, yRes, tRes] = await Promise.all([
          fetch(`${API}/api/movies/genres`),
          fetch(`${API}/api/movies/years`),
          fetch(`${API}/api/movies/translators`),
        ]);
        const [g, y, t] = await Promise.all([gRes.json(), yRes.json(), tRes.json()]);
        setGenres(Array.isArray(g) ? g : []);
        setYears(Array.isArray(y)  ? y : []);
        setTranslators(Array.isArray(t) ? t : []);
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // ── Sync URL → state on external navigation ────────────────────────────────
  useEffect(() => {
    setSearch(searchParams.get("search")     || "");
    setActiveGenre(searchParams.get("genre") || "All");
    setActiveYear(searchParams.get("year")   || "");
    setActiveTranslator(searchParams.get("translator") || "");
    setPage(1);
  }, [searchParams.toString()]);

  // ── Close dropdowns on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (moreGenresRef.current && !moreGenresRef.current.contains(e.target))
        setShowMoreGenres(false);
      if (translatorRef.current && !translatorRef.current.contains(e.target))
        setShowTranslators(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch movies ───────────────────────────────────────────────────────────
  const fetchMovies = useCallback(async (currentPage = 1, append = false) => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: PAGE_SIZE });
      if (search.trim())           params.set("search",     search.trim());
      if (activeGenre !== "All")   params.set("genre",      activeGenre);
      if (activeYear)              params.set("year",        activeYear);
      if (activeTranslator)        params.set("translator",  activeTranslator);

      const res  = await fetch(`${API}/api/movies/explore?${params}`);
      const data = await res.json();

      if (append) setMovies((prev) => [...prev, ...(data.movies || [])]);
      else        setMovies(data.movies || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Explore fetch error:", err);
      if (!append) setMovies([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, activeGenre, activeYear, activeTranslator]);

  // ── Debounce filter changes → fetch + sync URL ────────────────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchMovies(1, false);
      const p = {};
      if (search.trim())         p.search     = search.trim();
      if (activeGenre !== "All") p.genre      = activeGenre;
      if (activeYear)            p.year       = activeYear;
      if (activeTranslator)      p.translator = activeTranslator;
      setSearchParams(p);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, activeGenre, activeYear, activeTranslator]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchMovies(next, true);
  };

  const clearFilters = () => {
    setSearch(""); setActiveGenre("All");
    setActiveYear(""); setActiveTranslator("");
    setTranslatorSearch("");
    setSearchParams({});
  };

  const hasActiveFilters = search || activeGenre !== "All" || activeYear || activeTranslator;

  const primaryGenres = ["All", ...genres.slice(0, 6)];
  const moreGenres    = genres.slice(6);

  const filteredTranslators = translators.filter((t) =>
    t.toLowerCase().includes(translatorSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* ── Sticky filter bar with theme support ── */}
      <div className={`sticky top-16 z-30 backdrop-blur-xl border-b shadow-xl transition-all duration-300 ${
        dark 
          ? "bg-gray-950/95 border-white/5" 
          : "bg-white/95 border-gray-200 shadow-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-3">

          {/* Search */}
          <div className="relative">
            <Search size={17} className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${
              dark ? "text-gray-400" : "text-gray-500"
            }`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description…"
              className={`w-full rounded-xl pl-11 pr-10 py-3 text-sm focus:outline-none
                         focus:ring-2 focus:ring-red-500/50 transition-all ${
                dark
                  ? "bg-white/5 border border-white/10 text-white placeholder-gray-500"
                  : "bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400"
              }`}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                  dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* DESKTOP: Original pill-style filters */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Genre pills */}
              <div className="flex items-center gap-1.5 flex-wrap flex-1">
                {primaryGenres.map((g) => (
                  <button key={g} onClick={() => setActiveGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      activeGenre === g
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : dark
                          ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
                    }`}>
                    {g}
                  </button>
                ))}

                {/* More genres */}
                {moreGenres.length > 0 && (
                  <div className="relative" ref={moreGenresRef}>
                    <button onClick={() => setShowMoreGenres(!showMoreGenres)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                  transition-all border ${
                        moreGenres.includes(activeGenre)
                          ? "bg-red-600 text-white border-red-600"
                          : dark
                            ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border-gray-200"
                      }`}>
                      {moreGenres.includes(activeGenre) ? activeGenre : "More"}
                      <ChevronDown size={12} className={`transition-transform ${showMoreGenres ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showMoreGenres && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className={`absolute top-full left-0 mt-1 w-40 border rounded-xl shadow-2xl 
                                     overflow-hidden z-50 max-h-52 overflow-y-auto ${
                            dark 
                              ? "bg-gray-900 border-white/10" 
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {moreGenres.map((g) => (
                            <button key={g}
                              onClick={() => { setActiveGenre(g); setShowMoreGenres(false); }}
                              className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                                activeGenre === g
                                  ? dark
                                    ? "bg-red-600/20 text-red-400"
                                    : "bg-red-100 text-red-600"
                                  : dark
                                    ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}>
                              {g}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Year select */}
              <select value={activeYear} onChange={(e) => setActiveYear(e.target.value)}
                className={`rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 
                           focus:ring-red-500/50 cursor-pointer transition-all ${
                  dark
                    ? "bg-white/5 border border-white/10 text-gray-300"
                    : "bg-gray-100 border border-gray-200 text-gray-700"
                }`}>
                <option value="">All Years</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Translator filter */}
              <div className="relative" ref={translatorRef}>
                <button
                  onClick={() => setShowTranslators(!showTranslators)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                              transition-all border ${
                    activeTranslator
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                      : dark
                        ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                        : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  <User size={12} />
                  {activeTranslator || "Translator"}
                  <ChevronDown size={11} className={`transition-transform ${showTranslators ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showTranslators && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full right-0 mt-1 w-52 border rounded-xl shadow-2xl 
                                 overflow-hidden z-50 ${
                        dark 
                          ? "bg-gray-900 border-white/10" 
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className={`p-2 border-b ${dark ? "border-white/10" : "border-gray-200"}`}>
                        <div className="relative">
                          <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${
                            dark ? "text-gray-500" : "text-gray-400"
                          }`} />
                          <input
                            type="text"
                            value={translatorSearch}
                            onChange={(e) => setTranslatorSearch(e.target.value)}
                            placeholder="Search translator…"
                            className={`w-full rounded-lg pl-7 pr-3 py-1.5 text-xs focus:outline-none
                                       focus:ring-1 focus:ring-blue-500/50 ${
                              dark
                                ? "bg-white/5 border border-white/10 text-white placeholder-gray-500"
                                : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="max-h-48 overflow-y-auto">
                        {activeTranslator && (
                          <button
                            onClick={() => { setActiveTranslator(""); setTranslatorSearch(""); setShowTranslators(false); }}
                            className="w-full text-left px-4 py-2.5 text-xs text-red-400
                                       hover:bg-red-600/10 transition-colors flex items-center gap-2"
                          >
                            <X size={11} /> Clear translator
                          </button>
                        )}

                        {filteredTranslators.length === 0 ? (
                          <p className={`px-4 py-4 text-xs text-center ${
                            dark ? "text-gray-500" : "text-gray-400"
                          }`}>
                            {translatorSearch ? `No match for "${translatorSearch}"` : "No translators in DB yet"}
                          </p>
                        ) : (
                          filteredTranslators.map((t) => (
                            <button key={t}
                              onClick={() => {
                                setActiveTranslator(t);
                                setTranslatorSearch("");
                                setShowTranslators(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs transition-colors
                                          flex items-center gap-2 ${
                                activeTranslator === t
                                  ? dark
                                    ? "bg-blue-600/20 text-blue-400"
                                    : "bg-blue-100 text-blue-600"
                                  : dark
                                    ? "text-gray-300 hover:bg-white/10 hover:text-white"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              }`}
                            >
                              <User size={10} />
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400
                             hover:text-red-300 bg-red-600/10 hover:bg-red-600/20
                             border border-red-500/20 transition-all">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>

            {/* Active translator badge */}
            {activeTranslator && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  Showing movies translated by:
                </span>
                <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30
                                 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
                  <User size={10} />
                  {activeTranslator.charAt(0).toUpperCase() + activeTranslator.slice(1)}
                  <button onClick={() => setActiveTranslator("")}
                    className="ml-1 hover:text-white transition-colors">
                    <X size={10} />
                  </button>
                </span>
              </div>
            )}
          </div>

          {/* MOBILE: Compact select dropdowns */}
          <div className="md:hidden grid grid-cols-1 gap-2">
            {/* Genre Select */}
            <select
              value={activeGenre}
              onChange={(e) => setActiveGenre(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-red-500/50 cursor-pointer transition-all ${
                dark
                  ? "bg-white/5 border border-white/10 text-gray-300"
                  : "bg-gray-100 border border-gray-200 text-gray-700"
              }`}
            >
              <option value="All">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-red-500/50 cursor-pointer transition-all ${
                dark
                  ? "bg-white/5 border border-white/10 text-gray-300"
                  : "bg-gray-100 border border-gray-200 text-gray-700"
              }`}
            >
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            {/* Translator Select */}
            <select
              value={activeTranslator}
              onChange={(e) => setActiveTranslator(e.target.value)}
              className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none
                         focus:ring-2 focus:ring-red-500/50 cursor-pointer transition-all ${
                dark
                  ? "bg-white/5 border border-white/10 text-gray-300"
                  : "bg-gray-100 border border-gray-200 text-gray-700"
              }`}
            >
              <option value="">All Translators</option>
              {translators.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Clear all button on mobile */}
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm text-red-400
                           hover:text-red-300 bg-red-600/10 hover:bg-red-600/20
                           border border-red-500/20 transition-all"
              >
                <X size={14} /> Clear all filters
              </button>
            )}

            {/* Active translator badge on mobile */}
            {activeTranslator && (
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  Showing:
                </span>
                <span className="flex items-center gap-1.5 bg-blue-600/15 border border-blue-500/30
                                 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
                  <User size={10} />
                  {activeTranslator.charAt(0).toUpperCase() + activeTranslator.slice(1)}
                  <button onClick={() => setActiveTranslator("")}
                    className="ml-1 hover:text-white transition-colors">
                    <X size={10} />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {!loading && (
          <div className="mb-6">
            <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
              {total > 0 ? (
                <>
                  <span className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
                    {total}
                  </span>{" "}
                  movie{total !== 1 ? "s" : ""} found
                  {hasActiveFilters && (
                    <span className={`text-xs ml-2 ${dark ? "text-gray-500" : "text-gray-400"}`}>
                      {activeGenre !== "All" && `in ${activeGenre}`}
                      {activeYear && ` · ${activeYear}`}
                      {activeTranslator && ` · by ${activeTranslator}`}
                      {search && ` · "${search}"`}
                    </span>
                  )}
                </>
              ) : "No results"}
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(PAGE_SIZE).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <EmptyState
            search={search}
            genre={activeGenre}
            translator={activeTranslator}
            onClear={clearFilters}
            dark={dark}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((movie, i) => (
                <MovieCard key={movie._id} movie={movie} index={i} />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <button onClick={handleLoadMore} disabled={loadingMore}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium
                             transition-all disabled:opacity-50 ${
                    dark
                      ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900"
                  }`}>
                  {loadingMore && (
                    <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                      dark ? "border-white" : "border-gray-900"
                    }`} />
                  )}
                  {loadingMore ? "Loading…" : `Load more (${total - movies.length} remaining)`}
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

// ── Empty state with theme support ────────────────────────────────────────────
const EmptyState = ({ search, genre, translator, onClear, dark }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 text-center">
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
      dark ? "bg-white/5" : "bg-gray-100"
    }`}>
      {translator
        ? <User size={32} className={dark ? "text-gray-500" : "text-gray-400"} />
        : <Film size={32} className={dark ? "text-gray-500" : "text-gray-400"} />
      }
    </div>
    <h3 className={`text-xl font-bold mb-2 ${dark ? "text-white" : "text-gray-900"}`}>
      No movies found
    </h3>
    <p className={`text-sm max-w-sm mb-6 ${dark ? "text-gray-400" : "text-gray-600"}`}>
      {translator
        ? `No movies translated by "${translator}" yet.`
        : search
        ? `No results for "${search}". Try different keywords.`
        : genre !== "All"
        ? `No movies in the "${genre}" genre yet.`
        : "No movies available. Check back later."}
    </p>
    <button onClick={onClear}
      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors">
      Clear filters
    </button>
  </motion.div>
);

export default ExplorePage;