// src/context/AppContext.jsx
// Global context for favorites and watch history (localStorage-based, no auth required)
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppContext = createContext(null);

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mw_favorites") || "[]");
    } catch {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mw_watch_history") || "[]");
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("mw_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("mw_watch_history", JSON.stringify(watchHistory));
  }, [watchHistory]);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f._id === movie._id);
      if (exists) return prev.filter((f) => f._id !== movie._id);
      return [movie, ...prev];
    });
  }, []);

  const isFavorite = useCallback(
    (movieId) => favorites.some((f) => f._id === movieId),
    [favorites]
  );

  const saveWatchProgress = useCallback((movie, progress) => {
    setWatchHistory((prev) => {
      const filtered = prev.filter((h) => h._id !== movie._id);
      return [{ ...movie, progress, watchedAt: Date.now() }, ...filtered].slice(0, 20);
    });
  }, []);

  const getWatchProgress = useCallback(
    (movieId) => {
      const entry = watchHistory.find((h) => h._id === movieId);
      return entry?.progress || 0;
    },
    [watchHistory]
  );

  const clearHistory = useCallback(() => setWatchHistory([]), []);

  return (
    <AppContext.Provider
      value={{
        favorites,
        watchHistory,
        toggleFavorite,
        isFavorite,
        saveWatchProgress,
        getWatchProgress,
        clearHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
