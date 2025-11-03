import React, { useState } from "react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { trendingMovies } from "../assets/assets";
import { Play } from "lucide-react";

const Trending = () => {
  const [activeMovie, setActiveMovie] = useState(trendingMovies[0]);

  const handleMouseEnter = (movie) => {
    setActiveMovie(movie);
  };

  const handleMouseLeave = () => {
    // Optional: revert to main movie when leaving all cards
    // setActiveMovie(trendingMovies[0]);
  };

  const handlePlay = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div className="bg-gray-950 text-white bg-cover bg-center bg-no-repeat mt-15"
      style={{
        backgroundImage:
          "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
      }}
    >
      {/* Navbar Section */}
      <Navbar />

      {/* Trending Section */}
      <div
        className="relative flex flex-col lg:flex-row items-center justify-between p-10 bg-cover bg-center bg-no-repeat"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90"></div>

        {/* Content */}
        <div className="relative z-10 lg:w-1/2 space-y-6">
          <h2 className="text-4xl font-bold">{activeMovie.title}</h2>
          <p className="text-gray-300 max-w-md">{activeMovie.description}</p>
        </div>

        {/* Right Side — Layered Movie Cards */}
        <div className="">
          {/* Left card */}
          <div
            className=""
            onMouseEnter={() => handleMouseEnter(trendingMovies[1])}
            onMouseLeave={handleMouseLeave}
          >
            <MovieCard movie={trendingMovies[1]} />
          </div>

          {/* Main front card */}
          <div
            className=""
            onMouseEnter={() => handleMouseEnter(trendingMovies[0])}
            onMouseLeave={handleMouseLeave}
          >
            <MovieCard movie={trendingMovies[0]} />
          </div>

          {/* Right card */}
          <div
            className=""
            onMouseEnter={() => handleMouseEnter(trendingMovies[2])}
            onMouseLeave={handleMouseLeave}
          >
            <MovieCard movie={trendingMovies[2]} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Trending;