import { useState, useEffect } from "react";

const Analytics = () => {
  const url = import.meta.env.VITE_API_NEW;
  const [movies, setMovies] = useState([]);
  const [editingMovie, setEditingMovie] = useState(null); 
  const [editForm, setEditForm] = useState({
    title: "",
    genre: "",
    year: "",
    rating: "",
  });

  // Fetch movies from DB
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

  // Calculate stats dynamically
  const totalMovies = movies.length;
  const totalRatings = movies.reduce((acc, m) => acc + parseFloat(m.rating || 0), 0).toFixed(1);
  const topRatedMovies = movies.filter((m) => parseFloat(m.rating) > 8.5);
  const mostViewed = movies.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))[0]; // placeholder for "most viewed"

  // Delete movie
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete movie");
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Start editing movie
  const handleEditClick = (movie) => {
    setEditingMovie(movie);
    setEditForm({
      title: movie.title,
      genre: movie.genre,
      year: movie.year,
      rating: movie.rating,
    });
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/movies/${editingMovie._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update movie");
      const updatedMovie = await res.json();
      setMovies(movies.map((m) => (m._id === updatedMovie._id ? updatedMovie : m)));
      setEditingMovie(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Upper Div with Stats */}
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

      {/* Movies Table */}
      <div className="overflow-x-auto text-white mt-5">
        <table className="min-w-full text-left border border-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-sm uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 border-b border-gray-700">Title</th>
              <th className="py-3 px-4 border-b border-gray-700">Genre</th>
              <th className="py-3 px-4 border-b border-gray-700">Year</th>
              <th className="py-3 px-4 border-b border-gray-700">Rating</th>
              <th className="py-3 px-4 border-b border-gray-700 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id} className="hover:bg-gray-800/50 transition">
                <td className="py-3 px-4 border-b border-gray-800">{movie.title}</td>
                <td className="py-3 px-4 border-b border-gray-800">{movie.genre}</td>
                <td className="py-3 px-4 border-b border-gray-800">{movie.year}</td>
                <td className="py-3 px-4 border-b border-gray-800">{movie.rating}</td>
                <td className="py-3 px-4 border-b border-gray-800 text-center">
                  <button
                    className="text-blue-400 hover:text-blue-300 mr-3"
                    onClick={() => handleEditClick(movie)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(movie._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingMovie && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <form
            className="bg-gray-900 p-6 rounded-2xl w-96 text-white"
            onSubmit={handleEditSubmit}
          >
            <h2 className="text-xl font-bold mb-4">Edit Movie</h2>

            {/* Title */}
            <label className="text-sm font-semibold mb-1 block">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800"
            />

            {/* Genre */}
            <label className="text-sm font-semibold mb-1 block">Genre</label>
            <input
              type="text"
              value={editForm.genre}
              onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800"
            />

            {/* Year */}
            <label className="text-sm font-semibold mb-1 block">Year</label>
            <input
              type="text"
              value={editForm.year}
              onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800"
            />

            {/* ✅ Rating */}
            <label className="text-sm font-semibold mb-1 block">Rating</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={editForm.rating}
              onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-800"
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
                onClick={() => setEditingMovie(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}


    </div>
  );
};

export default Analytics;
