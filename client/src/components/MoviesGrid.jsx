import React from "react";
import MovieCard from "./MovieCard";
import { movies } from "../assets/assets";

const MoviesGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
      {movies.map((movie, i) => (
        <MovieCard key={i} movie={movie} />
      ))}
    </div>
  );
};

export default MoviesGrid;
