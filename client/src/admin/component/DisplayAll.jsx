// src/admin/component/DisplayAll.jsx
import { useState, useEffect } from "react";
import { Film, Star, TrendingUp, Calendar, Clock, MessageCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const DisplayAll = () => {
  const { dark } = useTheme();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/api/movies`);
        const data = await res.json();
        setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate statistics
  const topRated = [...movies].sort(
    (a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
  )[0];

  const latestMovie = [...movies].sort(
    (a, b) => parseInt(b.year || 0) - parseInt(a.year || 0)
  )[0];
  
  const avgRatingAll = movies.length > 0
    ? (movies.reduce((acc, m) => acc + parseFloat(m.rating || 0), 0) / movies.length).toFixed(1)
    : "0";

  const totalComments = movies.reduce((acc, m) => acc + (m.comments?.length || 0), 0);

  const stats = [
    {
      label: "Total Movies",
      value: loading ? "..." : movies.length,
      icon: Film,
      color: "text-blue-400",
      bg: dark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200",
      textColor: dark ? "text-blue-400" : "text-blue-600",
      hoverBg: dark ? "hover:bg-blue-500/20" : "hover:bg-blue-100",
    },
    {
      label: "Average Rating",
      value: loading ? "..." : avgRatingAll,
      icon: Star,
      color: "text-yellow-400",
      bg: dark ? "bg-yellow-500/10 border-yellow-500/20" : "bg-yellow-50 border-yellow-200",
      textColor: dark ? "text-yellow-400" : "text-yellow-600",
      hoverBg: dark ? "hover:bg-yellow-500/20" : "hover:bg-yellow-100",
      suffix: "/10",
    },
    {
      label: "Total Comments",
      value: loading ? "..." : totalComments,
      icon: MessageCircle,
      color: "text-purple-400",
      bg: dark ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-200",
      textColor: dark ? "text-purple-400" : "text-purple-600",
      hoverBg: dark ? "hover:bg-purple-500/20" : "hover:bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
          Dashboard
        </h2>
        <p className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
          Overview of your movie platform
        </p>
      </div>

      {/* Stat Cards Grid - Now 3 cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, textColor, hoverBg, suffix }) => (
          <div
            key={label}
            className={`${bg} ${hoverBg} border rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>
                {label}
              </span>
              <Icon size={20} className={`${color} transition-transform group-hover:scale-110`} />
            </div>
            <p className={`text-3xl font-black ${textColor} flex items-baseline gap-1`}>
              {value}
              {suffix && <span className={`text-sm font-normal ${dark ? "text-gray-500" : "text-gray-400"}`}>
                {suffix}
              </span>}
            </p>
          </div>
        ))}
      </div>

      {/* Featured Movies Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Top Rated Spotlight */}
        {!loading && topRated && (
          <div className={`relative overflow-hidden rounded-2xl border ${
            dark 
              ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700" 
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-md"
          } p-5 transition-all hover:shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={topRated.image || topRated.posterUrls?.[0] || "https://placehold.co/80x120/111827/6b7280?text=?"}
                  alt={topRated.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/80x120/111827/6b7280?text=No+Image";
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1 shadow-lg">
                  <Star size={14} className="text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-yellow-500" />
                  <p className={`text-xs uppercase tracking-wider font-semibold ${
                    dark ? "text-yellow-500" : "text-yellow-600"
                  }`}>
                    Top Rated
                  </p>
                </div>
                <h3 className={`font-bold text-lg truncate mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
                  {topRated.title}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className={dark ? "text-gray-300" : "text-gray-700"}>
                      {topRated.rating || "N/A"}
                    </span>
                  </span>
                  <span className={dark ? "text-gray-400" : "text-gray-500"}>
                    {topRated.year || "N/A"}
                  </span>
                  {topRated.genre && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      dark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    }`}>
                      {topRated.genre}
                    </span>
                  )}
                </div>
                {topRated.description && (
                  <p className={`text-xs mt-2 line-clamp-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                    {topRated.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Latest Movie Spotlight */}
        {!loading && latestMovie && latestMovie._id !== topRated?._id && (
          <div className={`relative overflow-hidden rounded-2xl border ${
            dark 
              ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700" 
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-md"
          } p-5 transition-all hover:shadow-xl`}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={latestMovie.image || latestMovie.posterUrls?.[0] || "https://placehold.co/80x120/111827/6b7280?text=?"}
                  alt={latestMovie.title}
                  className="w-20 h-28 object-cover rounded-xl shadow-lg"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/80x120/111827/6b7280?text=No+Image";
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                  <Clock size={14} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-green-500" />
                  <p className={`text-xs uppercase tracking-wider font-semibold ${
                    dark ? "text-green-500" : "text-green-600"
                  }`}>
                    Latest Release
                  </p>
                </div>
                <h3 className={`font-bold text-lg truncate mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
                  {latestMovie.title}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className={dark ? "text-gray-300" : "text-gray-700"}>
                      {latestMovie.rating || "N/A"}
                    </span>
                  </span>
                  <span className={dark ? "text-gray-400" : "text-gray-500"}>
                    {latestMovie.year || "N/A"}
                  </span>
                  {latestMovie.genre && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      dark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                    }`}>
                      {latestMovie.genre}
                    </span>
                  )}
                </div>
                {latestMovie.description && (
                  <p className={`text-xs mt-2 line-clamp-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                    {latestMovie.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Movies Grid */}
      {!loading && movies.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>
              Recent Additions
            </h3>
            <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
              Showing latest {Math.min(6, movies.length)} movies
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {movies.slice(0, 6).map((movie) => (
              <div
                key={movie._id}
                className={`group rounded-xl overflow-hidden transition-all duration-300 ${
                  dark 
                    ? "bg-gray-800/50 hover:bg-gray-800" 
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="relative aspect-[2/3]">
                  <img
                    src={movie.image || movie.posterUrls?.[0] || "https://placehold.co/150x225/111827/6b7280?text=?"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = "https://placehold.co/150x225/111827/6b7280?text=No+Image";
                    }}
                  />
                  {movie.rating && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-yellow-500 fill-current" />
                        <span className="text-white text-xs font-bold">{movie.rating}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h4 className={`text-xs font-medium truncate ${dark ? "text-white" : "text-gray-900"}`}>
                    {movie.title}
                  </h4>
                  <p className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>
                    {movie.year || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={dark ? "text-gray-400" : "text-gray-600"}>Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && movies.length === 0 && (
        <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
          dark ? "border-gray-700 text-gray-400" : "border-gray-300 text-gray-500"
        }`}>
          <Film size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No movies yet</p>
          <p className="text-sm mt-1">Start by adding your first movie using the form above</p>
        </div>
      )}
    </div>
  );
};

export default DisplayAll;