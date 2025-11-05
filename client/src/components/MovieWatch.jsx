import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const MovieWatch = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [username, setUsername] = useState("");
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [isTrending, setIsTrending] = useState(false);

  const isAdmin = false; // simulate admin

  // Fetch movie and related movies
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Fetch all movies from both endpoints
        const [moviesRes, trendingRes] = await Promise.all([
          fetch("http://localhost:5000/api/movies"),
          fetch("http://localhost:5000/api/trending")
        ]);
        
        const moviesData = await moviesRes.json();
        const trendingData = await trendingRes.json();
        
        // Combine both arrays
        const allMovies = [...moviesData, ...trendingData];
        
        // Find current movie from combined array
        const current = allMovies.find((m) => m._id === id);
        if (current) {
          setMovie(current);

          // Check if it's a trending movie
          const isTrendingMovie = trendingData.some(m => m._id === id);
          setIsTrending(isTrendingMovie);

          // Related movies by genre, exclude current movie
          const related = allMovies
            .filter((m) => m.genre === current.genre && m._id !== current._id)
            .slice(0, 10);
          setRelatedMovies(related);

          // Initialize ratings
          setRatings(current.ratings || []);

          setComments(current.comments || []);
        } else {
          setMovie(null);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMovie();
  }, [id]);

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <h2 className="text-3xl font-bold mb-4">Movie not found</h2>
        <Link
          to="/"
          className="px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 transition"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !username.trim()) return;

    try {
      // Use different endpoint based on whether it's a trending movie
      const endpoint = isTrending 
        ? `http://localhost:5000/api/trending/${id}/comments`
        : `http://localhost:5000/api/movies/${id}/comments`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, text: newComment }),
      });

      if (!res.ok) throw new Error("Failed to add comment");

      const newCommentObj = await res.json();

      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setUsername("");
    } catch (err) {
      console.error(err);
      alert("Error adding comment");
    }
  };

  const handleRating = async (value) => {
    setUserRating(value);
    setRatings([...ratings, value]);
    
    try {
      // Use different endpoint based on whether it's a trending movie
      const endpoint = isTrending 
        ? `http://localhost:5000/api/trending/${id}/rate`
        : `http://localhost:5000/api/movies/${id}/rate`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: value }),
      });

      if (!res.ok) throw new Error("Failed to add rating");

      const updatedMovie = await res.json();
      setRatings(updatedMovie.ratings.map(r => r.score));
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    }
  };

  const averageRating = movie.avgRating || (
    ratings && ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + (r.score || r), 0) / ratings.length
        ).toFixed(1)
      : 0
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
            <iframe
              src={movie.trailer || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title={movie.title}
              className="w-full h-[450px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="text-3xl font-bold mt-4">{movie.title}</h1>
          <p className="text-gray-400">{movie.year}</p>

          {/* ⭐ Rating Section */}
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`text-2xl transition ${
                  star <= userRating ? "text-yellow-400" : "text-gray-500"
                } hover:text-yellow-400`}
              >
                ★
              </button>
            ))}

            {/* ✅ Display average rating on the right of the stars */}
            <span className="text-yellow-400 font-semibold ml-2">
              {averageRating}
            </span>

            {isAdmin && (
              <span className="text-gray-500 text-sm ml-2">
                ({ratings.length} users rated)
              </span>
            )}
          </div>

          <p className="mt-4 text-gray-300">{movie.description}</p>

          <button className="mt-4 px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-semibold shadow-md">
            Download Movie
          </button>

          {/* Comment Section */}
          <div className="mt-8 bg-gray-800/50 p-5 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-3">Leave a Comment</h2>
            <form onSubmit={handleAddComment} className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name..."
                className="w-full bg-gray-900 text-gray-200 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className="w-full bg-gray-900 text-gray-200 p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                Post Comment
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
              ) : (
                comments.map((c, index) => (
                  <div key={index} className="bg-gray-900/70 p-3 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-red-400 font-semibold text-sm">{c.name}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(c.date).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-gray-300">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-1 space-y-5">
          <h2 className="text-2xl font-semibold mb-2 border-b border-gray-700 pb-2">
            Related Movies
          </h2>

          {relatedMovies.map((rel) => (
            <Link
              key={rel._id}
              to={`/movie/${rel._id}`}
              className="flex gap-3 items-center bg-gray-800/60 hover:bg-gray-800 rounded-xl p-3 transition"
            >
              <img
                src={rel.image}
                alt={rel.title}
                className="w-16 h-20 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{rel.title}</h3>
                <p className="text-gray-400 text-xs">{rel.year}</p>
                <span className="text-yellow-400 text-xs">⭐ {rel.rating}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieWatch;