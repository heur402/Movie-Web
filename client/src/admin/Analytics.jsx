// src/admin/Analytics.jsx — Analytics dashboard with charts
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Film, TrendingUp, Star, MessageCircle, BarChart2 } from "lucide-react";
import DisplayAll from "./component/DisplayAll";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

const Analytics = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", genre: "", year: "", rating: "" });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${API}/api/movies`);
        setMovies(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this movie?")) return;
    try {
      await fetch(`${API}/api/movies/${id}`, { method: "DELETE" });
      setMovies((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/movies/${editingMovie._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const updated = await res.json();
      setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      setEditingMovie(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Chart data
  const genreData = Object.entries(
    movies.reduce((acc, m) => {
      const g = m.genre || "Other";
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ratingData = movies
    .filter((m) => m.rating)
    .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    .slice(0, 10)
    .map((m) => ({ name: m.title.length > 12 ? m.title.slice(0, 12) + "…" : m.title, rating: parseFloat(m.rating) }));

  const totalComments = movies.reduce((acc, m) => acc + (m.comments?.length || 0), 0);
  const totalRatings = movies.reduce((acc, m) => acc + (m.ratings?.length || 0), 0);

  return (
    <div className="space-y-8">
      <DisplayAll />

      {/* Extra stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Total Comments", value: totalComments, icon: MessageCircle, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
          { label: "Total Ratings",  value: totalRatings,  icon: Star,          color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          { label: "Genres",         value: genreData.length, icon: BarChart2,  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} border rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{loading ? "..." : value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {!loading && movies.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Genre distribution */}
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-red-400" /> Movies by Genre
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {genreData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top rated */}
          <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Star size={16} className="text-yellow-400" /> Top Rated Movies
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" domain={[0, 10]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="rating" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Movies table */}
      <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700/40">
          <h3 className="text-white font-semibold">All Movies</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Genre</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {movies.map((movie) => (
                <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{movie.title}</td>
                  <td className="px-4 py-3">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-gray-300">{movie.genre}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{movie.year}</td>
                  <td className="px-4 py-3 text-yellow-400 font-semibold">⭐ {movie.rating || "N/A"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setEditingMovie(movie); setEditForm({ title: movie.title, genre: movie.genre, year: movie.year, rating: movie.rating }); }}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 rounded-lg text-xs transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 rounded-lg text-xs transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5">Edit Movie</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {[
                { label: "Title", key: "title", type: "text" },
                { label: "Genre", key: "genre", type: "text" },
                { label: "Year", key: "year", type: "text" },
                { label: "Rating", key: "rating", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-sm text-gray-400 mb-1 block">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingMovie(null)} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
