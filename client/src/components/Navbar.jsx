import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SearchMovie from "./SearchMovie";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 👈 gives current path

  // 🚫 Don't show Navbar on admin pages
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const handleGenreClick = (genre) => {
    setMenuOpen(false);
    navigate(`/movies?genre=${genre.toLowerCase()}`);
  };

  const genres = [
    "Action", "Drama", "Comedy", "Horror",
    "Romance", "Sci-Fi", "Adventure", "Thriller", "Others"
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black/5 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-3 text-white">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="text-4xl md:text-5xl cursor-pointer">
          <Link to="/">🎬</Link>
        </div>
        <span className={`text-xl md:text-2xl font-semibold ${searchOpen ? "hidden md:block" : "hidden md:block"}`}>
          MovieWeb
        </span>
      </div>

      {/* Centered Search */}
      <SearchMovie />

      {/* Right side buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden md:flex bg-red-600 px-3 py-2 rounded-md hover:bg-red-500 transition cursor-pointer text-sm md:text-base">
          <a
            href="https://wa.me/250783450857"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
          >
            WhatsApp
          </a>
        </div>

        {/* Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col justify-center items-center w-10 h-10 gap-1 p-2 hover:bg-white/10 rounded transition"
          >
            <span
              className={`block h-1 w-6 bg-white transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block h-1 w-6 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-1 w-6 bg-white transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white backdrop-blur-md rounded-md shadow-lg py-2 z-50">
              <div className="list-none cursor-pointer p-1 text-black">
                {genres.map((genre) => (
                  <li
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 transition-colors"
                  >
                    {genre}
                  </li>
                ))}
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600">
                  <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                </li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600">
                  <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                </li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600">
                  <Link to="/terms" onClick={() => setMenuOpen(false)}>Terms & Condition</Link>
                </li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600">
                  <Link to="/privacy" onClick={() => setMenuOpen(false)}>Privacy Policy</Link>
                </li>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
