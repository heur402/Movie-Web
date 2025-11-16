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

      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <thead className="bg-linear-to-r from-gray-600 to-black text-white">
            <tr>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Poster</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Title</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Genre</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Rating</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Year</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Trailer</th>
              <th className="p-4 text-left font-bold text-sm uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentMovies.map((movie, index) => (
              <tr 
                key={movie._id} 
                className={`border-b border-gray-100 hover:bg-linear-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-4">
                  {movie.image && (
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-16 h-20 object-cover rounded-lg shadow-md border border-gray-200"
                    />
                  )}
                </td>
                <td className="p-4 font-semibold text-gray-800">{movie.title}</td>
                <td className="p-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {movie.genre}
                  </span>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                    ⭐ {movie.rating}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-700">{movie.year}</td>
                <td className="p-4">
                  {movie.trailer ? (
                    <video
                      src={movie.trailer}
                      controls
                      className="w-32 h-20 rounded-lg shadow-md border border-gray-200"
                    />
                  ) : (
                    <span className="text-gray-400 italic bg-gray-100 px-3 py-1 rounded-lg">Not Available</span>
                  )}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(movie._id)}
                    className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {movies.length > moviesPerPage && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-white font-bold text-base px-4 py-2 bg-linearto-r from-gray-700 to-gray-800 rounded-xl shadow-md">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white p-3 rounded-xl disabled:opacity-50 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
