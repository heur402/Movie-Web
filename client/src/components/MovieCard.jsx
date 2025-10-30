import React, { useState } from "react";
import { Heart, Play } from "lucide-react";
import Watch from "./Watch";

const MovieCard = ({ movie }) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-gray-900 text-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-shadow">
      {/* Poster Section */}
      <div className="relative">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-40 object-cover"
        />

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 p-2 rounded-full"
        >
          <Heart
            size={20}
            className={liked ? "text-red-500 fill-red-500" : "text-white"}
          />
        </button>

        {/* Play Button Overlay */}
        <button className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition bg-black/50">
          <div className="bg-red-600 p-3 rounded-full">
            <Play size={24} />
          </div>
        </button>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h2 className="text-lg font-bold truncate">{movie.title}</h2>
        <p className="text-sm text-gray-400">{movie.genre}</p>

        <div className="flex justify-between items-center mt-3 text-sm">
          <span className="text-yellow-400 font-semibold">
            ⭐ {movie.rating}/10
          </span>
          <span className="text-gray-400">{movie.releaseDate}</span>
        </div>

        {/* Watch Trailer Button */}
        <Watch />
      </div>
    </div>
  );
};

export default MovieCard;
