// src/admin/component/DisplayAll.jsx
import { useState, useEffect } from "react";
import { Film, Star } from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const DisplayAll = () => {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res  = await fetch(`${API}/api/movies`);
        const data = await res.json();
        setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topRated = [...movies].sort(
    (a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
  )[0];

  const avgRatingAll = movies.length > 0
    ? (movies.reduce((acc, m) => acc + parseFloat(m.rating || 0), 0) / movies.length).toFixed(1)
    : "0";

  const stats = [
    {
      label : "Total Movies",
      value : loading ? "..." : movies.length,
      icon  : Film,
      color : "text-blue-400",
      bg    : "bg-blue-500/10 border-blue-500/20",
    },
    {
      label : "Avg Rating",
      value : loading ? "..." : avgRatingAll,
      icon  : Star,
      color : "text-yellow-400",
      bg    : "bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Overview of your movie platform</p>
      </div>

      {/* Stat cards — only Total Movies + Avg Rating */}
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} border rounded-2xl p-5 transition-all hover:scale-105`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-medium">{label}</span>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Top rated spotlight */}
      {!loading && topRated && (
        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 max-w-sm">
          <img
            src={topRated.posterUrls?.[0] || topRated.image || "https://placehold.co/48x64/111827/6b7280?text=?"}
            alt={topRated.title}
            className="w-12 h-16 object-cover rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-0.5">Top Rated</p>
            <p className="text-white font-bold truncate">{topRated.title}</p>
            <p className="text-yellow-400 text-sm">⭐ {topRated.rating} · {topRated.year}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayAll;
