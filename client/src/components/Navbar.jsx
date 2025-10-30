import React, { useState } from "react";
import { Link } from "react-router-dom";


const Navbar = () => {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // toggle mobile search

  const movies = ["Avatar", "Inception", "Titanic", "The Batman", "Joker", "Dune"];

  const handleSearch = () => {
    if (query.trim() === "") return;
    const results = movies.filter((movie) =>
      movie.toLowerCase().includes(query.toLowerCase())
    );
    console.log("🔍 Search results:", results);
    alert(`Found ${results.length} movie(s): ${results.join(", ") || "None"}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    
      <div className="fixed top-0 left-0 w-full z-50 bg-black/5 backdrop-blur-md flex items-center justify-between px-4 md:px-8 py-3 text-white">

      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="text-4xl md:text-5xl">🎬</div>
        <span className={`text-xl md:text-2xl font-semibold ${searchOpen ?  "hidden md:block" : "hidden md:block" }`}>MovieWeb</span>
      </div>

      {/* Centered Search */}
      <div className="flex-1 flex justify-center md:justify-start mx-4">
        {/* Desktop & mobile expanded search */}
        <div className={`relative w-full max-w-xs md:max-w-md transition-all ${searchOpen ? "block" : "hidden md:block"}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            className="bg-black/70 text-white rounded-xl pl-10 pr-10 py-2 w-full h-12 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-red-600 transition text-sm md:text-base"
          />
    
          {/* Hide input icon on mobile */}
          <span
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer transition hidden sm:inline"
          >
            🔍
          </span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🎞️</span>
        </div>
      </div>

      {/* Right side buttons */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden p-2 rounded hover:bg-white/10 transition"
        >
          🔍
        </button>

        {/* WhatsApp Button hidden on mobile */}
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
              className={`block h-1 w-6 bg-white transition-transform ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block h-1 w-6 bg-white transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-1 w-6 bg-white transition-transform ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white backdrop-blur-md rounded-md shadow-lg py-2 z-50">
              {/* menu items here */}
              <div className="list-none cursor-pointer p-1 text-black">
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 "  >Action</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Indian</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Romance</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Cartoon</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Scifi</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Horror</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Drama</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >Comedy</li>
                <li className="hover:bg-pink-500/30 p-0.5 hover:text-red-600 " >
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
