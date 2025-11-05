import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Trendings = () => {
  const [trendings, setTrendings] = useState([]);
  const [newTrending, setNewTrending] = useState({
    title: "",
    year: "",
    rating: "",
    genre: "",
    image: "",
    description: "",
    trailer: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 4;

  // Fetch trending movies from DB
  useEffect(() => {
    const fetchTrendings = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/trending");
        const data = await res.json();
        setTrendings(data);
      } catch (err) {
        console.error("Failed to fetch trendings:", err);
      }
    };
    fetchTrendings();
  }, []);

  const handleAdd = async () => {
    if (!newTrending.title || !newTrending.genre) return alert("Please fill all required fields.");

    try {
      const res = await fetch("http://localhost:5000/api/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrending),
      });
      if (!res.ok) throw new Error("Failed to add trending movie");

      const savedMovie = await res.json();
      setTrendings([...trendings, savedMovie]);
      setNewTrending({
        title: "",
        year: "",
        rating: "",
        genre: "",
        image: "",
        trailer: "",
        description: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (_id) => {
    if (!_id) return alert("Invalid movie ID");
    
    try {
      const res = await fetch(`http://localhost:5000/api/trending/${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete movie");
      setTrendings(trendings.filter((m) => m._id !== _id));
    } catch (err) {
      alert(err.message);
    }
  };

  // Pagination logic
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentTrendings = trendings.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(trendings.length / moviesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const inputClass =
    "bg-black/30 border border-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Manage Trending Movies</h2>

      {/* Add Movie Form */}
      <div className="bg-linear-to-b from-gray-900 via-black to-gray-900 text-white p-6 rounded-2xl shadow-2xl border border-red-900/40 backdrop-blur-md transition-all duration-500 hover:shadow-red-500/20 hover:border-red-500/40">
        <h3 className="text-2xl font-bold mb-5 text-center tracking-wider text-red-500 drop-shadow-lg">
          Add New Trending Movie
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Movie details */}
          <input
            type="text"
            placeholder="Title"
            className={inputClass}
            value={newTrending.title}
            onChange={(e) => setNewTrending({ ...newTrending, title: e.target.value })}
          />

          <input
            list="genres"
            type="text"
            placeholder="Genre"
            className={inputClass}
            value={newTrending.genre}
            onChange={(e) => setNewTrending({ ...newTrending, genre: e.target.value })}
          />
          <datalist id="genres">
            <option value="Action" />
            <option value="Drama" />
            <option value="Comedy" />
            <option value="Horror" />
            <option value="Romance" />
            <option value="Sci-Fi" />
            <option value="Adventure" />
            <option value="Thriller" />
            <option value="Others" />
          </datalist>

          <input
            type="text"
            placeholder="Year"
            className={inputClass}
            value={newTrending.year}
            onChange={(e) => setNewTrending({ ...newTrending, year: e.target.value })}
          />

          <input
            type="text"
            placeholder="Rating"
            className={inputClass}
            value={newTrending.rating}
            onChange={(e) => setNewTrending({ ...newTrending, rating: e.target.value })}
          />

          <textarea
            placeholder="Description"
            value={newTrending.description}
            onChange={(e) => setNewTrending({ ...newTrending, description: e.target.value })}
            className={inputClass}
            rows="3"
          />

          {/* Trailer input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300">Trailer</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste trailer URL or choose file"
                className={inputClass + " flex-1"}
                value={newTrending.trailer}
                onChange={(e) => setNewTrending({ ...newTrending, trailer: e.target.value })}
              />
              <label className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transition-all">
                Choose
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const videoUrl = URL.createObjectURL(file);
                      setNewTrending({ ...newTrending, trailer: videoUrl });
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Poster input */}
          <div className="flex flex-col gap-2 col-span-1 sm:col-span-2 md:col-span-3">
            <label className="text-sm text-gray-300">Poster</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Paste image URL or choose file"
                className={inputClass + " flex-1"}
                value={newTrending.image}
                onChange={(e) => setNewTrending({ ...newTrending, image: e.target.value })}
              />
              <label className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transition-all">
                Choose
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const imageUrl = URL.createObjectURL(file);
                      setNewTrending({ ...newTrending, image: imageUrl });
                    }
                  }}
                />
              </label>
            </div>
            <div className="flex flex-wrap justify-between">
              {newTrending.image && (
                <img
                  src={newTrending.image}
                  alt="Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-700"
                />
              )}
              {newTrending.trailer && (
                <video
                  src={newTrending.trailer}
                  controls
                  className="mt-2 rounded-lg w-48 h-28 border border-gray-700"
                />
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-105"
        >
          + Add Trending Movie
        </button>
      </div>

      {/* Movie Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">Poster</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Genre</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Year</th>
              <th className="p-3 text-left">Trailer</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTrendings.map((movie) => (
              <tr key={movie._id} className="border-b hover:bg-gray-100">
                <td className="p-3">
                  {movie.image && (
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                </td>
                <td className="p-3">{movie.title}</td>
                <td className="p-3">{movie.genre}</td>
                <td className="p-3">{movie.rating}</td>
                <td className="p-3">{movie.year}</td>
                <td className="p-3">
                  {movie.trailer ? (
                    <video
                      src={movie.trailer}
                      controls
                      className="w-32 h-20 rounded"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trendings.length > moviesPerPage && (
          <div className="flex justify-center items-center gap-2 mt-4 text-sm">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-white font-medium text-sm px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded disabled:opacity-50 flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trendings;