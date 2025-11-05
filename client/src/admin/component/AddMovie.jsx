import { useState, useEffect } from "react";

const AddMovie = () => {

  const [movies, setMovies] = useState([]);
  const [newMovie, setNewMovie] = useState({
    title: "",
    year: "",
    rating: "",
    genre: "",
    image: "",
    description: "",
    trailer: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 5;

  // Fetch movies from DB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();
        setMovies(data);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    };
    fetchMovies();
  }, []);

  const handleAdd = async () => {
    if (!newMovie.title || !newMovie.genre) return alert("Please fill all required fields.");

    try {
      const res = await fetch("http://localhost:5000/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie),
      });
      if (!res.ok) throw new Error("Failed to add movie");

      const savedMovie = await res.json();
      setMovies([...movies, savedMovie]);
      setNewMovie({
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
      const res = await fetch(`http://localhost:5000/api/movies/${_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete movie");
      setMovies(movies.filter((m) => m._id !== _id));
    } catch (err) {
      alert(err.message);
    }
  };

    const inputClass =
    "bg-black/30 border border-gray-700 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";


  return (
    <div>
    {/* Add new movie form */}
      <div className="bg-linear-to-b from-gray-900 via-black to-gray-900 text-white p-6 rounded-2xl shadow-2xl border border-red-900/40 backdrop-blur-md transition-all duration-500 hover:shadow-red-500/20 hover:border-red-500/40">
            <h3 className="text-2xl font-bold mb-5 text-center tracking-wider text-red-500 drop-shadow-lg">
                Add New Movie
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Movie details */}
            <input
                type="text"
                placeholder="Title"
                className={inputClass}
                value={newMovie.title}
                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
            />

            <input
                list="genres"
                type="text"
                placeholder="Genre"
                className={inputClass}
                value={newMovie.genre}
                onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
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
                value={newMovie.year}
                onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
            />

            <input
                type="text"
                placeholder="Rating"
                className={inputClass}
                value={newMovie.rating}
                onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
            />

            <textarea
                name="description"
                value={newMovie.description}
                onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                placeholder="Enter movie description"
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
                    value={newMovie.trailer}
                    onChange={(e) => setNewMovie({ ...newMovie, trailer: e.target.value })}
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
                        setNewMovie({ ...newMovie, trailer: videoUrl });
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
                    value={newMovie.image}
                    onChange={(e) => setNewMovie({ ...newMovie, image: e.target.value })}
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
                        setNewMovie({ ...newMovie, image: imageUrl });
                        }
                    }}
                    />
                </label>
                </div>
                <div className="flex flex-wrap justify-between">
                {newMovie.image && (
                    <img
                    src={newMovie.image}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-700"
                    />
                )}
                {newMovie.trailer && (
                    <video
                    src={newMovie.trailer}
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
            + Add Movie
            </button>
      </div>
    </div>
  )
}

export default AddMovie