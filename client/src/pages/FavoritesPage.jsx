// src/pages/FavoritesPage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Heart, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useApp();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart size={24} className="text-red-500 fill-red-500" />
            <h1 className="text-3xl font-black">My Favorites</h1>
          </div>
          <p className="text-gray-400">
            {favorites.length > 0
              ? `${favorites.length} saved movie${favorites.length !== 1 ? "s" : ""}`
              : "Your saved movies will appear here"}
          </p>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
            <p className="text-gray-400 text-sm mb-6">
              Browse movies and click the heart icon to save them here.
            </p>
            <Link
              to="/explore"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
            >
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((movie, i) => (
              <MovieCard key={movie._id} movie={movie} index={i} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
