// src/admin/Movies.jsx
import { useState } from "react";
import { trendingMovies } from "../assets/assets";

const Movies = () => {
  const [movies, setMovies] = useState(trendingMovies);
  const [newMovie, setNewMovie] = useState({
    title: "",
    year: "",
    rating: "",
    genre: "",
    image: "",
  });

  const handleAdd = () => {
    if (!newMovie.title || !newMovie.genre) return alert("Please fill all fields.");
    setMovies([...movies, { id: Date.now(), ...newMovie }]);
    setNewMovie({ title: "", year: "", rating: "", genre: "", image: "" });
  };

  const handleDelete = (id) => {
    setMovies(movies.filter((m) => m.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Movies</h2>

      {/* Add new movie form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Add Movie</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Title"
            className="border p-2 rounded"
            value={newMovie.title}
            onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
          />
          <input type="text" placeholder="Genre"
            className="border p-2 rounded"
            value={newMovie.genre}
            onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
          />
          <input type="text" placeholder="Year"
            className="border p-2 rounded"
            value={newMovie.year}
            onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
          />
          <input type="text" placeholder="Rating"
            className="border p-2 rounded"
            value={newMovie.rating}
            onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
          />
          <input type="text" placeholder="Image URL"
            className="border p-2 rounded col-span-2"
            value={newMovie.image}
            onChange={(e) => setNewMovie({ ...newMovie, image: e.target.value })}
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Add Movie
        </button>
      </div>

      {/* Movie table */}
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Genre</th>
            <th className="p-3 text-left">Rating</th>
            <th className="p-3 text-left">Year</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie.id} className="border-b hover:bg-gray-100">
              <td className="p-3">{movie.title}</td>
              <td className="p-3">{movie.genre}</td>
              <td className="p-3">{movie.rating}</td>
              <td className="p-3">{movie.year}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Movies;
