// Movies.js
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Heart, Import, Play } from "lucide-react";
import Watch from "./Watch";
import { movies } from "../assets/assets";
import Footer from '../components/Footer'

const Movies = () => {
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState({});
  const location = useLocation();

  // Function to extract genre from URL query parameters
  const getGenreFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('genre') || '';
  };

  // Toggle like for a movie
  const toggleLike = (movieId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedMovies(prev => ({
      ...prev,
      [movieId]: !prev[movieId]
    }));
  };

  useEffect(() => {
    const genre = getGenreFromURL();
    setLoading(true);
    
    const timer = setTimeout(() => {
      let results = [];
      
      if (genre) {
        if (genre.toLowerCase() === "others") {
          // For "others", show movies that don't fit the main single-word genres
          const mainGenres = ["action", "romance", "comedy", "horror", "drama", "scifi", "indian", "cartoon"];
          
          results = movies.filter(movie => {
            if (!movie.genre) return true;
            
            const movieGenres = movie.genre.toLowerCase().split('/');
            // Check if any of the movie's genres match main genres
            const hasMainGenre = movieGenres.some(mg => 
              mainGenres.some(mainGenre => mg.includes(mainGenre))
            );
            return !hasMainGenre;
          });
        } else {
          // Filter movies that contain the selected genre (case-insensitive, partial match)
          const targetGenre = genre.toLowerCase();
          
          results = movies.filter(movie => {
            if (!movie.genre) return false;
            
            const movieGenres = movie.genre.toLowerCase().split('/');
            // Check if any of the movie's genres contain the target genre
            return movieGenres.some(movieGenre => 
              movieGenre.includes(targetGenre) || targetGenre.includes(movieGenre)
            );
          });
        }
      } else {
        // If no genre specified, show all movies
        results = movies;
      }
      
      setFilteredMovies(results);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.search]);

  const genre = getGenreFromURL();

  if (loading) {
    return (
      <div className="pt-20 p-4 text-white text-center min-h-screen bg-gray-900">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 p-4 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {genre ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies` : 'All Movies'}
        </h1>
        {genre && (
          <p className="text-lg text-gray-400 mt-2">
            {filteredMovies.length} movie{filteredMovies.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
      
      {filteredMovies.length === 0 ? (
        <div className="text-white text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-xl mb-2">No movies found in the "{genre}" genre.</p>
          <p className="text-gray-400">Try selecting a different genre from the menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-xl"
            >
              {/* Poster Section */}
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />

                {/* Like Button */}
                <button
                  onClick={(e) => toggleLike(movie.id, e)}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                >
                  <Heart
                    size={20}
                    className={likedMovies[movie.id] ? "text-red-500 fill-red-500" : "text-white"}
                  />
                </button>

                {/* Play Button Overlay */}
                <Link
                  to={`/movie/${movie.id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50"
                >
                  <div className="bg-red-600 p-3 rounded-full hover:bg-red-500 transition-colors">
                    <Play size={24} />
                  </div>
                </Link>
              </div>

              {/* Movie Info */}
              <div className="p-4">
                <h2 className="text-lg font-bold truncate mb-1">{movie.title}</h2>
                <p className="text-sm text-gray-400 mb-3">{movie.genre}</p>

                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-yellow-400 font-semibold flex items-center gap-1">
                    ⭐ {movie.rating}/10
                  </span>
                  <span className="text-gray-400">{movie.year}</span>
                </div>

                {/* Watch Trailer Button */}
                <Watch movieId={movie.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    
  );
};

export default Movies;