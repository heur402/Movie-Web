import { useState, useEffect } from "react";

const DisplayAll = () => {
  const url = import.meta.env.VITE_API_NEW;
  const [movies, setMovies] = useState([]);

  
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch(`${url}/api/movies`);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    }
  };

  
  const totalMovies = movies.length;
  const totalRatings = movies.reduce((acc, m) => acc + parseFloat(m.rating || 0), 0).toFixed(1);
  const topRatedMovies = movies.filter((m) => parseFloat(m.rating) > 8.5);
  const mostViewed = movies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0];

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-red-500 flex flex-col">
          Welcome, Bonheur
        </h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search for movies..."
            className="bg-gray-900/90 backdrop-blur-sm text-white rounded-xl pl-12 pr-12 py-3 h-11 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-red-500/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-2xl text-base font-medium"
          />
          <div className="w-15 h-15 border-2 border-red-500/50 rounded-full">
            <img
              src="client/src/assets/chair.jpg"
              alt="Admin Avatar"
              className="rounded-full w-15 h-15"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass p-6 rounded-2xl shadow-lg hover:shadow-red-500/50 transition">
          <h2 className="text-white text-sm font-semibold">Total Movies</h2>
          <p className="text-4xl font-bold mt-2 text-white">{totalMovies}</p>
        </div>
        <div className="glass p-6 rounded-2xl shadow-lg hover:shadow-red-500/50 transition">
          <h2 className="text-white text-sm font-semibold">Total Ratings</h2>
          <p className="text-4xl font-bold mt-2 text-white">{totalRatings}</p>
        </div>
        <div className="glass p-6 rounded-2xl shadow-lg hover:shadow-red-500/50 transition">
          <h2 className="text-white text-sm font-semibold">Most Viewed</h2>
          <p className="text-4xl font-bold mt-2 text-white">{mostViewed?.title || "N/A"}</p>
        </div>
        <div className="glass p-6 rounded-2xl shadow-lg hover:shadow-red-500/50 transition">
          <h2 className="text-white text-sm font-semibold">Top Rated</h2>
          <p className="text-4xl font-bold mt-2 text-white">
            {topRatedMovies[0]?.title || "N/A"} ({topRatedMovies[0]?.rating || "0"})
          </p>
        </div>
      </div>

    </div>
  );
};

export default DisplayAll;