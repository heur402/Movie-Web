// src/components/MovieWatch.jsx — Full movie watch page
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Heart, Star, ArrowLeft, Share2, Eye,
  MessageCircle, Send, ChevronDown, ChevronUp
} from "lucide-react";
import { useApp } from "../context/AppContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const MovieWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, saveWatchProgress, getWatchProgress } = useApp();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrending, setIsTrending] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  // Fetch movie data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [movRes, trRes] = await Promise.all([
          fetch(`${API}/api/movies`),
          fetch(`${API}/api/trending`),
        ]);
        const allMovies = await movRes.json();
        const trending = await trRes.json();
        const combined = [...allMovies, ...trending];

        const found = combined.find((m) => m._id === id);
        if (!found) { setLoading(false); return; }

        setMovie(found);
        setIsTrending(trending.some((m) => m._id === id));
        setComments(found.comments || []);

        const ratings = found.ratings || [];
        const avg = ratings.length > 0
          ? (ratings.reduce((s, r) => s + (r.score || r), 0) / ratings.length).toFixed(1)
          : found.rating || 0;
        setAvgRating(avg);

        // Related by genre
        const related = combined
          .filter((m) => m.genre === found.genre && m._id !== found._id)
          .slice(0, 8);
        setRelatedMovies(related);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // Count view once
  useEffect(() => {
    if (!movie || viewCounted) return;
    const endpoint = isTrending
      ? `${API}/api/trending/${id}/view`
      : `${API}/api/movies/${id}/view`;
    fetch(endpoint, { method: "POST" }).catch(() => {});
    setViewCounted(true);
  }, [movie, isTrending, id, viewCounted]);

  const handleRate = async (score) => {
    setUserRating(score);
    const endpoint = isTrending
      ? `${API}/api/trending/${id}/rate`
      : `${API}/api/movies/${id}/rate`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      const updated = await res.json();
      const ratings = updated.ratings || [];
      const avg = ratings.length > 0
        ? (ratings.reduce((s, r) => s + (r.score || r), 0) / ratings.length).toFixed(1)
        : score;
      setAvgRating(avg);
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmittingComment(true);
    const endpoint = isTrending
      ? `${API}/api/trending/${id}/comments`
      : `${API}/api/movies/${id}/comments`;
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: commentName, text: commentText }),
      });
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentName("");
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: movie?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
        <div className="text-6xl">🎭</div>
        <h2 className="text-2xl font-bold">Movie not found</h2>
        <Link to="/" className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const poster = movie.posterUrls?.[0] || movie.image;
  const desc = movie.description || "";
  const isLong = desc.length > 200;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Back button */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-black/90 transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Player + Info ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video"
            >
              {movie.videoUrl ? (
                <video
                  src={movie.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={poster}
                  onTimeUpdate={(e) => {
                    const progress = Math.round((e.target.currentTime / e.target.duration) * 100);
                    if (progress > 0) saveWatchProgress(movie, progress);
                  }}
                />
              ) : movie.trailer ? (
                <iframe
                  src={movie.trailer.includes("youtube.com") || movie.trailer.includes("youtu.be")
                    ? movie.trailer.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
                    : movie.trailer}
                  title={movie.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 gap-4">
                  {poster && (
                    <img src={poster} alt={movie.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 text-center">
                    <Play size={48} className="text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No video available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Title + Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black leading-tight">{movie.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 flex-wrap">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.genre && (
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{movie.genre}</span>
                    )}
                    {movie.duration && <span>{movie.duration}</span>}
                    {movie.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {movie.views.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(movie)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      isFavorite(movie._id)
                        ? "bg-red-600/20 border-red-500 text-red-400"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Heart size={16} className={isFavorite(movie._id) ? "fill-red-500" : ""} />
                    {isFavorite(movie._id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={22}
                        className={`transition-colors ${
                          star <= (hoverRating || userRating || parseFloat(avgRating))
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-yellow-400 font-bold text-lg">{avgRating}</span>
                  <span className="text-gray-400 ml-1">/ 5</span>
                  {movie.ratings?.length > 0 && (
                    <span className="text-gray-500 ml-2">({movie.ratings.length} ratings)</span>
                  )}
                </div>
                {userRating > 0 && (
                  <span className="text-green-400 text-xs ml-auto">✓ You rated {userRating}/5</span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className={`text-gray-300 leading-relaxed text-sm md:text-base ${!showFullDesc && isLong ? "line-clamp-3" : ""}`}>
                  {desc || "No description available."}
                </p>
                {isLong && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm mt-2 transition-colors"
                  >
                    {showFullDesc ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-red-400" />
                Comments
                {comments.length > 0 && (
                  <span className="text-gray-400 text-sm font-normal">({comments.length})</span>
                )}
              </h2>

              {/* Comment form */}
              <form onSubmit={handleComment} className="space-y-3 mb-6">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentName.trim() || !commentText.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors self-end"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              {/* Comment list */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-400 font-semibold text-sm">{c.name}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(c.date).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Related Movies ── */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-red-500 rounded-full" />
              Related Movies
            </h2>
            <div className="space-y-3">
              {relatedMovies.length === 0 ? (
                <p className="text-gray-500 text-sm">No related movies found.</p>
              ) : (
                relatedMovies.map((rel) => (
                  <Link
                    key={rel._id}
                    to={`/movie/${rel._id}`}
                    className="flex gap-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all group"
                  >
                    <img
                      src={rel.posterUrls?.[0] || rel.image || "https://via.placeholder.com/64x90?text=?"}
                      alt={rel.title}
                      className="w-14 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">
                        {rel.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5">{rel.year}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{rel.genre}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-xs">
                          {rel.avgRating || rel.rating || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieWatch;
