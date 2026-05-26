// src/pages/HistoryPage.jsx — Continue Watching
import React from "react";
import { motion } from "framer-motion";
import { Clock, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Footer from "../components/Footer";

const HistoryPage = () => {
  const { watchHistory, clearHistory } = useApp();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={24} className="text-blue-400" />
              <h1 className="text-3xl font-black">Continue Watching</h1>
            </div>
            <p className="text-gray-400">
              {watchHistory.length > 0
                ? `${watchHistory.length} movie${watchHistory.length !== 1 ? "s" : ""} in progress`
                : "Movies you've started watching will appear here"}
            </p>
          </div>
          {watchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-xl text-sm transition-all"
            >
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </motion.div>

        {watchHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Clock size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nothing to continue</h3>
            <p className="text-gray-400 text-sm mb-6">
              Start watching a movie and it will appear here.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors"
            >
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchHistory.map((movie, i) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={movie.posterUrls?.[0] || movie.image || "https://via.placeholder.com/320x180?text=?"}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/movie/${movie._id}`}
                      className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-xl"
                    >
                      <Play size={20} fill="white" className="text-white ml-0.5" />
                    </Link>
                  </div>
                  {/* Progress bar */}
                  {movie.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${Math.min(movie.progress, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white font-semibold text-sm truncate">{movie.title}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-400 text-xs">{movie.year}</span>
                    {movie.progress > 0 && (
                      <span className="text-gray-500 text-xs">{movie.progress}% watched</span>
                    )}
                  </div>
                  <Link
                    to={`/movie/${movie._id}`}
                    className="mt-2 flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                  >
                    <Play size={12} /> Continue watching
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default HistoryPage;
