import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { movies } from "../assets/assets";
import { Search } from "lucide-react";

const SearchMovie = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search when query changes
  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = movies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
    setShowResults(true);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      // You can add specific enter key behavior here if needed
      console.log("Search for:", query);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query) {
      setShowResults(true);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center mx-4" ref={searchRef}>
      {/* Search Container */}
      <div className="relative w-full max-w-lg">
        {/* Search Input */}
        <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : 'scale-100'}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Search for movies..."
            className="bg-gray-900/90 backdrop-blur-sm text-white rounded-2xl pl-12 pr-12 py-3 w-full h-14 
                      placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-red-500/50 
                      border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300
                      shadow-2xl text-base font-medium"
          />

          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <span className={`transition-colors duration-300 ${isFocused ? 'text-red-400' : 'text-gray-400'}`}>
              <Search />
            </span>
          </div>
          
          {/* Clear Button */}
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white 
                        transition-all duration-200 p-1 rounded-full hover:bg-gray-700/50"
            >
              <span className="text-lg">✕</span>
            </button>
          )}

          {/* Search Action Button */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-gray-400 hover:text-red-400 cursor-pointer transition-colors duration-200 p-1 block">
              
            </span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-gray-900/95 backdrop-blur-md rounded-2xl 
                         shadow-2xl border border-gray-700/50 max-h-96 overflow-y-auto z-50 
                         animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-3">
              {/* Results Count */}
              <div className="text-xs text-gray-400 px-3 py-2 border-b border-gray-700/50 flex items-center gap-2">
                <span>🎬</span>
                <span>Found {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''}</span>
              </div>
              
              {/* Results List */}
              {searchResults.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-4 p-3 hover:bg-gray-800/80 rounded-xl transition-all 
                           duration-200 group border border-transparent hover:border-gray-700/50"
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors 
                                 duration-200 truncate text-sm">
                      {movie.title}
                    </h4>
                    <p className="text-gray-400 text-xs truncate mt-1">{movie.genre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400 text-xs">⭐</span>
                      <span className="text-yellow-400 text-xs font-medium">{movie.rating}</span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{movie.year}</span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-gray-400 text-lg">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {showResults && query && searchResults.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-gray-900/95 backdrop-blur-md rounded-2xl 
                         shadow-2xl border border-gray-700/50 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🎭</div>
              <p className="text-gray-300 font-medium">
                No movies found for "<span className="text-red-400">{query}</span>"
              </p>
              <p className="text-gray-500 text-sm mt-2">Try different keywords or browse categories</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMovie;