import React, { useEffect, useState } from "react";
import MovieCard from "./MovieCard";

const MovieCategory = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <p className="text-white p-6">Loading movies...</p>;
  if (movies.length === 0) return <p className="text-white p-6">No movies found.</p>;

  // ✅ Group movies by genre
  const groupedMovies = movies.reduce((acc, movie) => {
    const genres = movie.genre ? movie.genre.split(/[,/]/).map((g) => g.trim()) : ["Other"];
    genres.forEach((genre) => {
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(movie);
    });
    return acc;
  }, {});

  return (
    <div className="bg-gray-950/15 text-white min-h-screen px-6 py-12">
      {Object.keys(groupedMovies).map((genre) => (
        <div key={genre} className="mb-12">
          <h2 className="text-2xl font-semibold text-pink-400">{genre}</h2>
          <div className="w-14 border-b-4 border-red-500 mb-4"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {groupedMovies[genre].map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieCategory;
 