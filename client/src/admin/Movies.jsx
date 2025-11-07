import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AddMovie from "./component/AddMovie";


const Movies = () => {
  const url = import.meta.env.VITE_API_NEW;

  console.log(url)
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
  const moviesPerPage = 4;

  // Fetch movies from DB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch(`${url}/api/movies`);
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



  // Pagination logic
  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white">Manage Movies</h2>

      <AddMovie />

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
            {currentMovies.map((movie) => (
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

        {movies.length > moviesPerPage && (
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

export default Movies;
