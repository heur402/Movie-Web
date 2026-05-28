// src/components/MoviesGrid.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MovieCard from "./MovieCard";

const MoviesGrid = () => {
  const { t } = useTranslation();
  const url = import.meta.env.VITE_API_NEW;
  const [movies, setMovies]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res  = await fetch(`${url}/api/movies`);
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

  if (loading) return <p className="text-white p-6">{t("empty_states.loading_movies")}</p>;
  if (movies.length === 0) return <p className="text-white p-6">{t("empty_states.no_movies_period")}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {movies.map((movie) => <MovieCard key={movie._id} movie={movie} />)}
    </div>
  );
};

export default MoviesGrid;
