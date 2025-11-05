import React, { useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const avgRating = movie.ratings && movie.ratings.length > 0
    ? (
        movie.ratings.reduce((sum, r) => sum + (r.score || r), 0) /
        movie.ratings.length
      ).toFixed(1)
    : 0;

  const handlePlay = () => {
    navigate(`/movie/${movie._id}`);
  };

  return (
    <div
      className="
        bg-gray-900 text-white rounded-2xl overflow-hidden 
        shadow-lg transition-all duration-300 transform hover:scale-105
        hover:shadow-red-600
      "
    >
      <div className="relative">
        <img
          src={movie.image || "https://via.placeholder.com/300x400?text=No+Image"}
          alt={movie.title}
          className="w-full h-52 object-cover"
        />

        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50"
        >
          <div className="bg-linear-to-r from-red-600 to-red-950 p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
            <Play size={24} className="text-white" />
          </div>
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold truncate">{movie.title}</h2>
        <p className="text-sm text-gray-400">{movie.genre}</p>

        <div className="flex justify-between items-center mt-3 text-sm">
          <span className="text-yellow-400 font-semibold">
            ⭐ {avgRating}
          </span>
          <span className="text-gray-400">{movie.year}</span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
