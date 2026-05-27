// src/admin/Analytics.jsx — Analytics dashboard with charts
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Star, MessageCircle, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import DisplayAll from "./component/DisplayAll";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

const Analytics = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", genre: "", year: "", rating: "" });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
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
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this movie?")) return;
    try {
      const res = await fetch(`${API}/api/movies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMovies((prev) => prev.filter((m) => m._id !== id));
      // Reset to page 1 if current page becomes empty
      const newTotal = movies.length - 1;
      const maxPage = Math.ceil(newTotal / 5);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete movie");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    
    try {
      const res = await fetch(`${API}/api/movies/${editingMovie._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setMovies((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
      setEditingMovie(null);
    } catch (err) {
      console.error("Edit error:", err);
      alert("Failed to update movie");
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
    .map((m) => ({ 
      name: m.title.length > 12 ? m.title.slice(0, 12) + "…" : m.title, 
      rating: parseFloat(m.rating) 
    }));

  const totalComments = movies.reduce((acc, m) => acc + (m.comments?.length || 0), 0);

  // Calculate pagination
  const totalPages = Math.ceil(movies.length / 5);
  const startIndex = (currentPage - 1) * 5;
  const endIndex = startIndex + 5;
  const currentMovies = movies.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      <DisplayAll />

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
                <Pie 
                  data={genreData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                  labelLine={false}
                >
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
                <XAxis type="number" domain={[0, 5]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#d1d5db", fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="rating" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Movies table with pagination (5 per page) */}
      <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700/40 flex items-center justify-between">
          <h3 className="text-white font-semibold">All Movies</h3>
          
          {/* Page Navigation */}
          {movies.length > 5 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        
        {/* Scrollable container with max height */}
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '400px' }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Genre</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {currentMovies.map((movie) => (
                <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{movie.title}</td>
                  <td className="px-4 py-3">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-gray-300">
                      {movie.genre || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{movie.year || "N/A"}</td>
                  <td className="px-4 py-3 text-yellow-400 font-semibold">
                    ⭐ {movie.rating || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { 
                          setEditingMovie(movie); 
                          setEditForm({ 
                            title: movie.title, 
                            genre: movie.genre, 
                            year: movie.year, 
                            rating: movie.rating 
                          }); 
                        }}
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
          
          {/* Show message when no movies */}
          {movies.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No movies added yet</p>
            </div>
          )}
        </div>
        
        {/* Show total count and page info */}
        {movies.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-700/40 bg-gray-900/30 flex items-center justify-between">
            <p className="text-gray-500 text-xs">Total: {movies.length} movies</p>
            <p className="text-gray-500 text-xs">
              Showing {startIndex + 1} to {Math.min(endIndex, movies.length)} of {movies.length}
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-5">Edit Movie</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Genre</label>
                <input
                  type="text"
                  value={editForm.genre}
                  onChange={(e) => setEditForm((p) => ({ ...p, genre: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Year</label>
                <input
                  type="text"
                  value={editForm.year}
                  onChange={(e) => setEditForm((p) => ({ ...p, year: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={editForm.rating}
                  onChange={(e) => setEditForm((p) => ({ ...p, rating: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-600 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
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