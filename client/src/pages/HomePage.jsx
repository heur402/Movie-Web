// src/pages/HomePage.jsx
import React from "react";
import Trending from "../components/Trending";
import LatestMovies from "../components/LatestMovies";
import MovieCategories from "../components/MovieCategories";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero / Trending Banner */}
      <Trending />

      {/* Latest Releases */}
      <LatestMovies />

      {/* Divider */}
      <div className="mx-6 md:mx-10 border-t border-white/5" />

      {/* All Movies by Genre */}
      <MovieCategories />

      <Footer />
    </div>
  );
};

export default HomePage;
