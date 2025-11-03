import React from "react";
import { movies } from "../assets/assets";
import MovieCard from "./MovieCard";

const MovieCategory = () => {
  // Group movies by genre (handling multiple genres)
const groupedMovies = movies.reduce((acc, movie) => {
  // Split by both comma and slash, then trim spaces
  const genres = movie.genre.split(/[,/]/).map((g) => g.trim());
  
  // Optional: Filter out empty strings if any
  const cleanGenres = genres.filter(genre => genre.length > 0);

  cleanGenres.forEach((genre) => {
    if (!acc[genre]) acc[genre] = [];
    acc[genre].push(movie);
  });

  return acc;
}, {});

  return (
    <div className="bg-gray-950 text-white min-h-screen px-6 py-12">

      {Object.keys(groupedMovies).map((genre) => (
        <div key={genre} className="mb-12">
          <h2 className="text-2xl font-semibold text-pink-400">
            {genre}
          </h2>
          <div className="w-14 border-b-4 border-red-500 mb-4"></div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {groupedMovies[genre].map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieCategory;
