import React from "react";
import MovieCard from "./MovieCard";

const movies = [
  {
    title: "Inception",
    genre: "Sci-Fi",
    description: "A thief steals secrets through dream-sharing technology.",
    poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
    rating: 8.8,
    releaseDate: "2010",
  },
  {
    title: "Avatar",
    genre: "Action",
    description: "A Marine on Pandora becomes torn between two worlds.",
    poster: "https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg",
    rating: 7.8,
    releaseDate: "2009",
  },
  {
    title: "The Dark Knight",
    genre: "Action/Crime",
    description:
      "Batman faces the Joker, who brings chaos to Gotham City.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 9.0,
    releaseDate: "2008",
  },
];

const MoviesGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {movies.map((movie, i) => (
        <MovieCard key={i} movie={movie} />
      ))}
    </div>
  );
};

export default MoviesGrid;
