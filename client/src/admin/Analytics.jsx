import { useState, useEffect } from "react";
import DisplayAll from "./component/DisplayAll";

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

      <DisplayAll />

      {/* Movies Table with Actions */}
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

      {/* Edit Modal */}
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

            {/* Rating */}
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