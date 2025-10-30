import React from "react";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

const Trending = () => {
  const trendingMovies = [
    {
      id: 1,
      title: "Dune: Part Two",
      image:
        "https://image.tmdb.org/t/p/w500/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg",
      year: "2024",
      rating: "8.9",
      description:
        "Paul Atreides unites with the Fremen to wage war against the House that destroyed his family.",
    },
    {
      id: 2,
      title: "Deadpool & Wolverine",
      image:
        "https://image.tmdb.org/t/p/w500/f5kpPlWybFwczGXwnQJniJcMhj8.jpg",
      year: "2024",
      rating: "8.5",
      description:
        "Deadpool teams up with Wolverine for a multiverse-shattering adventure.",
    },
    {
      id: 3,
      title: "Inside Out 2",
      image:
        "https://image.tmdb.org/t/p/w500/gkF6j3KgbcUSp9P6URq3C5EX2vV.jpg",
      year: "2024",
      rating: "8.7",
      description:
        "Riley’s mind is growing up — and new emotions are joining the party.",
    },
  ];

  const mainMovie = trendingMovies[0];

  return (
    <div className="bg-gray-950 text-white bg-cover bg-center bg-no-repeat"
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
        <h2 className="text-4xl font-bold">{mainMovie.title}</h2>
        <p className="text-gray-300 max-w-md">{mainMovie.description}</p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-all">
          ▶ Watch Now
        </button>
      </div>

      {/* Right Side — Layered Movie Cards */}
      <div className="relative z-10 lg:w-1/2 flex justify-center items-center mt-10 lg:mt-0">
        {/* Left card */}
        <div className="absolute -left-10 top-8 opacity-70 scale-90">
          <MovieCard movie={trendingMovies[1]} />
        </div>

        {/* Main front card */}
        <div className="z-20 scale-105 shadow-2xl">
          <MovieCard movie={mainMovie} />
        </div>

        {/* Right card */}
        <div className="absolute right-1 top-3 opacity-70 scale-109">
          <MovieCard movie={trendingMovies[2]} />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Trending;
