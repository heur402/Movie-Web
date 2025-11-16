import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { useNavigate } from "react-router-dom";

const Trending = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [activeMovie, setActiveMovie] = useState(null);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const navigate = useNavigate();

  // Fetch trending movies from API
  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/trending");
        const data = await res.json();
        setTrendingMovies(data);
        if (data.length > 0) {
          setActiveMovie(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch trending movies:", err);
      }
    };

    fetchTrendingMovies();
  }, []);

  const handleMouseEnter = (movie) => {
    setHoveredMovie(movie);
    setActiveMovie(movie);
  };

  const handleMouseLeave = () => {
    setHoveredMovie(null);
  };

  const handlePlay = () => {
    if (activeMovie) {
      navigate(`/movie/${activeMovie._id}`);
    }
  };

  return (
    <div className="bg-gray-950 text-white bg-cover bg-center bg-no-repeat md:bg-fixed"
      style={{
        backgroundImage:
          "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
      }}
    >
      {/* Navbar Section */}
      <Navbar />

      {/* Trending Section */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/60 to-black/90"></div>

        <div className="max-sm:mt-20 sm:max-md:mt-30 md:mt-20 lg:mt-120"></div>

        {/* Content Section */}
        <div className="relative z-10 w-full lg:w-1/2 space-y-4 sm:space-y-5 md:space-y-6 mb-6 sm:mb-8 lg:mb-0 lg:pr-8 xl:pr-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            {activeMovie?.title}
          </h2>
          <p className="text-gray-300 mb-10 text-sm sm:text-base md:text-lg lg:text-xl max-w-md sm:max-w-lg md:max-w-xl leading-relaxed">
            {activeMovie?.description}
          </p>
        </div>

        {/* Cards Section */}
        <div className="relative z-10 w-full lg:w-auto mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-2 md:gap-2 lg:gap-2 xl:gap-2 relative">
            
            {/* Left Card */}
            {trendingMovies[1] && (
              <div 
                className={`transform transition-all duration-500 ease-out ${
                  hoveredMovie?._id === trendingMovies[1]._id 
                    ? "scale-110 z-20 -translate-x-2 sm:-translate-x-3 md:-translate-x-4 lg:-translate-x-6" 
                    : "scale-95 opacity-80 z-10 -translate-x-4 sm:-translate-x-6 md:-translate-x-8 lg:-translate-x-12"
                } w-32 sm:w-36 md:w-44 lg:w-52 xl:w-60 2xl:w-64 cursor-pointer`}
                onMouseEnter={() => handleMouseEnter(trendingMovies[1])}
                onMouseLeave={handleMouseLeave}
              >
                <MovieCard movie={trendingMovies[1]} />
              </div>
            )}

            {/* Center Card (Main) */}
            {trendingMovies[0] && (
              <div 
                className={`transform transition-all duration-500 ease-out ${
                  hoveredMovie?._id === trendingMovies[0]._id 
                    ? "scale-125 z-30 translate-y-0" 
                    : "scale-105 opacity-90 z-20 -translate-y-2 sm:-translate-y-3 md:-translate-y-4"
                } w-36 sm:w-44 md:w-52 lg:w-60 xl:w-72 2xl:w-80 cursor-pointer`}
                onMouseEnter={() => handleMouseEnter(trendingMovies[0])}
                onMouseLeave={handleMouseLeave}
              >
                <MovieCard movie={trendingMovies[0]} />
              </div>
            )}

            {/* Right Card */}
            {trendingMovies[2] && (
              <div 
                className={`transform transition-all duration-500 ease-out ${
                  hoveredMovie?._id === trendingMovies[2]._id 
                    ? "scale-110 z-20 translate-x-2 sm:translate-x-3 md:translate-x-4 lg:translate-x-6" 
                    : "scale-95 opacity-80 z-10 translate-x-4 sm:translate-x-6 md:translate-x-8 lg:translate-x-12"
                } w-32 sm:w-36 md:w-44 lg:w-52 xl:w-60 2xl:w-64 cursor-pointer`}
                onMouseEnter={() => handleMouseEnter(trendingMovies[2])}
                onMouseLeave={handleMouseLeave}
              >
                <MovieCard movie={trendingMovies[2]} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;