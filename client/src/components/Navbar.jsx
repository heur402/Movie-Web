// src/components/Navbar.jsx
import { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Clock, X, ChevronDown, Film, Menu, Sun, Moon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const GENRES = [
  "Action", "Drama", "Comedy", "Horror",
  "Romance", "Sci-Fi", "Adventure", "Thriller",
  "Animation", "Cartoon", "Indian", "Others",
];

const Navbar = () => {
  // ── ALL hooks must come before any conditional return ──────────────────────
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const searchRef = useRef(null);
  const genreRef = useRef(null);
  const favoritesRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useApp();
  const { dark, toggle: toggleTheme } = useTheme();

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setShowGenres(false);
    setShowMobileMenu(false);
    setShowFavorites(false);
    setShowSearch(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMobileMenu]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && showMobileMenu) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showMobileMenu]);

  // Click outside to close
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchResults([]);
      }
      if (genreRef.current && !genreRef.current.contains(e.target)) {
        setShowGenres(false);
      }
      if (favoritesRef.current && !favoritesRef.current.contains(e.target)) {
        setShowFavorites(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchResults([]);
        setShowGenres(false);
        setShowFavorites(false);
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search with AbortController
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const abortController = new AbortController();
    setIsSearching(true);
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/api/movies/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: abortController.signal }
        );
        const movies = await res.json();
        setSearchResults(Array.isArray(movies) ? movies.slice(0, 8) : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [searchQuery]);

  // ── NOW it is safe to conditionally return ─────────────────────────────────
  const hidden =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/watch");

  if (hidden) return null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleGenreClick = (genre) => {
    navigate(`/explore?genre=${encodeURIComponent(genre)}`);
    setShowGenres(false);
    setShowMobileMenu(false);
  };

  const handleImageError = (movieId) => {
    setImageErrors(prev => ({ ...prev, [movieId]: true }));
  };

  const getImageUrl = (movie) => {
    if (imageErrors[movie._id]) {
      return "https://placehold.co/40x56/333/666?text=No+Image";
    }
    return movie.image || movie.posterUrls?.[0] || "https://placehold.co/40x56/333/666?text=?";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? dark
            ? "bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/50"
            : "bg-white/95 backdrop-blur-xl shadow-2xl shadow-gray-200"
          : dark
          ? "bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm"
          : "bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center
                          group-hover:bg-red-500 transition-colors">
            <Film size={18} className="text-white" />
          </div>
          <span className={`font-bold text-xl hidden sm:block tracking-tight ${
            dark ? "text-white" : "text-gray-900"
          }`}>
            Movie<span className="text-red-500">Web</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" dark={dark}>Home</NavLink>
          <NavLink to="/explore" dark={dark}>Explore</NavLink>

          {/* Genres dropdown */}
          <div className="relative" ref={genreRef}>
            <button
              onClick={() => setShowGenres(!showGenres)}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors 
                         rounded-lg hover:bg-white/10 ${
                           dark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                         }`}
              aria-expanded={showGenres}
              aria-haspopup="menu"
            >
              Genres
              <ChevronDown size={14} className={`transition-transform ${showGenres ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showGenres && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full left-0 mt-2 w-44 backdrop-blur-xl
                             border rounded-xl shadow-2xl overflow-hidden ${
                               dark 
                                 ? "bg-gray-900/98 border-gray-700/50" 
                                 : "bg-white/98 border-gray-200 shadow-gray-200"
                             }`}
                >
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => handleGenreClick(g)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        dark
                          ? "text-gray-300 hover:text-white hover:bg-red-600/20"
                          : "text-gray-700 hover:text-gray-900 hover:bg-red-600/10"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full" role="search">
            <Search size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                dark ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder="Search movies..."
              className={`w-full border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2
                         focus:ring-red-500/50 transition-all ${
                           dark
                             ? "bg-white/10 border-white/10 text-white placeholder-gray-400 focus:bg-white/15"
                             : "bg-gray-100/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white/80"
                         }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  dark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <X size={14} />
              </button>
            )}

            {/* Search dropdown */}
            <AnimatePresence>
              {showSearch && (searchResults.length > 0 || isSearching) && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-xl
                             border rounded-xl shadow-2xl overflow-hidden z-50
                             max-h-80 overflow-y-auto ${
                               dark
                                 ? "bg-gray-900/98 border-gray-700/50"
                                 : "bg-white/98 border-gray-200 shadow-gray-200"
                             }`}
                >
                  {isSearching ? (
                    <div className="px-4 py-8 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className={`mt-2 text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        Searching...
                      </p>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((movie) => (
                        <Link
                          key={movie._id}
                          to={`/movie/${movie._id}`}
                          onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearch(false); }}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                            dark ? "hover:bg-white/10" : "hover:bg-gray-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(movie)}
                            alt={movie.title}
                            className="w-10 h-14 object-cover rounded-lg shrink-0"
                            onError={() => handleImageError(movie._id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate transition-colors ${
                              dark ? "text-white group-hover:text-red-400" : "text-gray-900 group-hover:text-red-600"
                            }`}>
                              {movie.title}
                            </p>
                            <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                              {movie.genre} · {movie.year}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <button
                        onClick={handleSearchSubmit}
                        className={`w-full px-4 py-3 text-sm text-red-400 transition-colors
                                   text-center border-t ${
                                     dark ? "hover:bg-white/5 border-gray-700/50" : "hover:bg-gray-50 border-gray-200"
                                   }`}
                      >
                        See all results for "{searchQuery}"
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Favorites */}
          <div className="relative" ref={favoritesRef}>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`relative p-2 transition-colors rounded-lg hover:bg-white/10 ${
                dark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
              }`}
              aria-label="Favorites"
            >
              <Heart size={20} className={favorites.length > 0 ? "fill-red-500 text-red-500" : ""} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs
                                 rounded-full flex items-center justify-center font-bold">
                  {favorites.length > 9 ? "9+" : favorites.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showFavorites && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`absolute top-full right-0 mt-2 w-72 backdrop-blur-xl
                             border rounded-xl shadow-2xl overflow-hidden z-50 ${
                               dark
                                 ? "bg-gray-900/98 border-gray-700/50"
                                 : "bg-white/98 border-gray-200 shadow-gray-200"
                             }`}
                >
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    dark ? "border-gray-700/50" : "border-gray-200"
                  }`}>
                    <span className={`font-semibold text-sm ${dark ? "text-white" : "text-gray-900"}`}>
                      My Favorites
                    </span>
                    <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                      {favorites.length} movies
                    </span>
                  </div>
                  {favorites.length === 0 ? (
                    <div className={`px-4 py-6 text-center text-sm ${
                      dark ? "text-gray-400" : "text-gray-600"
                    }`}>
                      <Heart size={24} className="mx-auto mb-2 opacity-40" />
                      No favorites yet
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto">
                      {favorites.slice(0, 6).map((movie) => (
                        <Link
                          key={movie._id}
                          to={`/movie/${movie._id}`}
                          onClick={() => setShowFavorites(false)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            dark ? "hover:bg-white/10" : "hover:bg-gray-100"
                          }`}
                        >
                          <img
                            src={getImageUrl(movie)}
                            alt={movie.title}
                            className="w-8 h-12 object-cover rounded shrink-0"
                            onError={() => handleImageError(movie._id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${dark ? "text-white" : "text-gray-900"}`}>
                              {movie.title}
                            </p>
                            <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                              {movie.year}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className={`px-4 py-2 border-t ${
                    dark ? "border-gray-700/50" : "border-gray-200"
                  }`}>
                    <Link
                      to="/favorites"
                      onClick={() => setShowFavorites(false)}
                      className="text-red-400 text-xs hover:text-red-300 transition-colors"
                    >
                      View all favorites →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Continue Watching */}
          <Link
            to="/history"
            className={`hidden sm:flex p-2 transition-colors rounded-lg hover:bg-white/10 ${
              dark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
            }`}
            aria-label="Watch History"
          >
            <Clock size={20} />
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 transition-colors rounded-lg hover:bg-white/10 ${
              dark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
            }`}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`md:hidden p-2 transition-colors rounded-lg hover:bg-white/10 ${
              dark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
            }`}
            aria-label="Menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden backdrop-blur-xl border-t overflow-hidden ${
              dark ? "bg-black/98 border-gray-800" : "bg-white/98 border-gray-200"
            }`}
          >
            <div className="px-4 py-4 space-y-2">
              {/* Mobile search */}
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className={`w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none
                             focus:ring-2 focus:ring-red-500/50 ${
                               dark
                                 ? "bg-white/10 border-white/10 text-white placeholder-gray-400"
                                 : "bg-gray-100/50 border-gray-200 text-gray-900 placeholder-gray-500"
                             }`}
                />
              </form>

              <MobileNavLink to="/" onClick={() => setShowMobileMenu(false)} dark={dark}>
                Home
              </MobileNavLink>
              <MobileNavLink to="/explore" onClick={() => setShowMobileMenu(false)} dark={dark}>
                Explore
              </MobileNavLink>
              <MobileNavLink to="/favorites" onClick={() => setShowMobileMenu(false)} dark={dark}>
                Favorites ({favorites.length})
              </MobileNavLink>
              <MobileNavLink to="/history" onClick={() => setShowMobileMenu(false)} dark={dark}>
                Continue Watching
              </MobileNavLink>

              <div className={`pt-2 border-t ${dark ? "border-gray-800" : "border-gray-200"}`}>
                <p className={`text-xs uppercase tracking-wider mb-2 px-2 ${
                  dark ? "text-gray-500" : "text-gray-400"
                }`}>
                  Genres
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => { handleGenreClick(g); setShowMobileMenu(false); }}
                      className={`text-left px-3 py-2 text-sm transition-colors rounded-lg ${
                        dark
                          ? "text-gray-300 hover:text-white hover:bg-white/10"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const NavLink = memo(({ to, children, dark }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active
          ? dark
            ? "text-white bg-white/10"
            : "text-gray-900 bg-gray-200"
          : dark
          ? "text-gray-300 hover:text-white hover:bg-white/10"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {children}
    </Link>
  );
});

const MobileNavLink = memo(({ to, children, onClick, dark }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`block px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
      dark
        ? "text-gray-300 hover:text-white hover:bg-white/10"
        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    {children}
  </Link>
));

export default Navbar;