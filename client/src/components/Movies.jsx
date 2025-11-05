// Movies.js
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Play } from "lucide-react";
import Watch from "./Watch";

const Movies = () => {
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState({});
  const location = useLocation();

  // ✅ Get genre from URL query (e.g. /movies?genre=action)
  const getGenreFromURL = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("genre") || "";
  };

  // ❤️ Toggle like
  const toggleLike = (movieId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedMovies((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  };

  // ✅ Fetch movies from backend (MongoDB)
  useEffect(() => {
    const genre = getGenreFromURL();
    setLoading(true);

    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/movies");
        const data = await response.json();

        // 🧠 Compute avgRating for every movie first
        const withAvg = data.map((movie) => {
          const ratings = movie.ratings || [];
          const avg =
            ratings.length > 0
              ? (
                  ratings.reduce((sum, r) => sum + (r.score || r), 0) /
                  ratings.length
                ).toFixed(1)
              : 0;
          return { ...movie, avgRating: avg };
        });

        let results = [];

        if (genre) {
          if (genre.toLowerCase() === "others") {
            const mainGenres = [
              "action",
              "romance",
              "comedy",
              "horror",
              "drama",
              "scifi",
              "indian",
              "cartoon",
            ];
            results = withAvg.filter((movie) => {
              if (!movie.genre) return true;
              const movieGenres = movie.genre.toLowerCase().split("/");
              const hasMainGenre = movieGenres.some((mg) =>
                mainGenres.some((main) => mg.includes(main))
              );
              return !hasMainGenre;
            });
          } else {
            const targetGenre = genre.toLowerCase();
            results = withAvg.filter((movie) => {
              if (!movie.genre) return false;
              const movieGenres = movie.genre.toLowerCase().split("/");
              return movieGenres.some(
                (g) => g.includes(targetGenre) || targetGenre.includes(g)
              );
            });
          }
        } else {
          results = withAvg;
        }

        // ✅ Finally store the movies with avgRating
        setFilteredMovies(results);
      } catch (error) {
        console.error("❌ Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchMovies();
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
          {genre
            ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} Movies`
            : "All Movies"}
        </h1>
        {genre && (
          <p className="text-lg text-gray-400 mt-2">
            {filteredMovies.length} movie
            {filteredMovies.length !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {filteredMovies.length === 0 ? (
        <div className="text-white text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <p className="text-xl mb-2">
            No movies found in the "{genre}" genre.
          </p>
          <p className="text-gray-400">
            Try selecting a different genre from the menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-xl"
            >
              {/* Poster */}
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />


                {/* Play overlay */}
                <Link
                  to={`/movie/${movie._id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50"
                >
                  <div className="bg-red-600 p-3 rounded-full hover:bg-red-500 transition-colors">
                    <Play size={24} />
                  </div>
                </Link>
              </div>

              {/* Info */}
              <div className="p-4">
                <h2 className="text-lg font-bold truncate mb-1">
                  {movie.title}
                </h2>
                <p className="text-sm text-gray-400 mb-3">{movie.genre}</p>

                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-yellow-400 font-semibold flex items-center gap-1">
                    ⭐ {movie.avgRating || 0}
                  </span>
                  <span className="text-gray-400">{movie.year}</span>
                </div>

                
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Movies;
