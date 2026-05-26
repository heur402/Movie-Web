// src/components/MovieWatch.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Heart, Star, ArrowLeft, Share2,
  MessageCircle, Send, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, User, Download
} from "lucide-react";
import { useApp } from "../context/AppContext";
import MovieCard from "./MovieCard";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const MovieWatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite, saveWatchProgress } = useApp();

  const [movie,         setMovie]         = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading,       setLoading]       = useState(true);

  const [comments,          setComments]          = useState([]);
  const [commentName,       setCommentName]       = useState("");
  const [commentText,       setCommentText]       = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [userRating,  setUserRating]  = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [avgRating,   setAvgRating]   = useState(0);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [viewCounted,  setViewCounted]  = useState(false);

  const relatedScrollRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch movie by ID directly, then related separately
        const [movieRes, relatedRes] = await Promise.all([
          fetch(`${API}/api/movies/${id}`),
          fetch(`${API}/api/movies/${id}/related`),
        ]);

        let found = null;
        if (movieRes.ok) {
          found = await movieRes.json();
        } else {
          // Fallback: search all movies
          const allRes = await fetch(`${API}/api/movies`);
          const all    = await allRes.json();
          found = all.find((m) => m._id === id) || null;
        }

        if (!found) { setLoading(false); return; }

        setMovie(found);
        setComments(found.comments || []);

        const ratings = found.ratings || [];
        const avg = ratings.length > 0
          ? (ratings.reduce((s, r) => s + (r.score || r), 0) / ratings.length).toFixed(1)
          : found.rating || 0;
        setAvgRating(avg);

        // Related movies
        if (relatedRes.ok) {
          const rel = await relatedRes.json();
          setRelatedMovies(Array.isArray(rel) ? rel : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  // ── View count ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!movie || viewCounted) return;
    fetch(`${API}/api/movies/${id}/view`, { method: "POST" }).catch(() => {});
    setViewCounted(true);
  }, [movie, id, viewCounted]);

  // ── Rate ───────────────────────────────────────────────────────────────────
  const handleRate = async (score) => {
    setUserRating(score);
    try {
      const res     = await fetch(`${API}/api/movies/${id}/rate`, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ score }),
      });
      const updated = await res.json();
      const ratings = updated.ratings || [];
      setAvgRating(
        ratings.length > 0
          ? (ratings.reduce((s, r) => s + (r.score || r), 0) / ratings.length).toFixed(1)
          : score
      );
    } catch (err) { console.error(err); }
  };

  // ── Comment ────────────────────────────────────────────────────────────────
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res        = await fetch(`${API}/api/movies/${id}/comments`, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ name: commentName, text: commentText }),
      });
      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentName("");
      setCommentText("");
    } catch (err) { console.error(err); }
    finally { setSubmittingComment(false); }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: movie?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  // ── Related scroll ─────────────────────────────────────────────────────────
  const scrollRelated = (dir) => {
    const el = relatedScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  };

  // ── Loading / not found ────────────────────────────────────────────────────
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
  const desc   = movie.description || "";
  const isLong = desc.length > 200;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* back */}
      <div className="fixed top-4 left-4 z-40">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10
                     text-white px-4 py-2 rounded-xl hover:bg-black/90 transition-all text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ LEFT: Player + Info ══════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Trailer player (YouTube) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video"
            >
              {movie.trailer ? (
                <iframe
                  src={(() => {
                    const t = movie.trailer;
                    if (t.includes("youtube.com") || t.includes("youtu.be")) {
                      return t
                        .replace("watch?v=", "embed/")
                        .replace("youtu.be/", "youtube.com/embed/");
                    }
                    return t;
                  })()}
                  title={`${movie.title} — Trailer`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 gap-4">
                  {poster && (
                    <img src={poster} alt={movie.title}
                         className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  )}
                  <div className="relative z-10 text-center">
                    <Play size={48} className="text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No trailer available</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Full movie player */}
            {(movie.videoUrl || movie.movieLink) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-2"
              >
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  Full Movie
                </h2>
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                  <video
                    src={movie.videoUrl || movie.movieLink}
                    controls
                    className="w-full h-full"
                    poster={poster}
                    onTimeUpdate={(e) => {
                      const pct = Math.round((e.target.currentTime / e.target.duration) * 100);
                      if (pct > 0) saveWatchProgress(movie, pct);
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Title + actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl md:text-3xl font-black leading-tight">{movie.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 flex-wrap">
                    {movie.year  && <span>{movie.year}</span>}
                    {movie.genre && (
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{movie.genre}</span>
                    )}
                  </div>

                  {/* Translator — just the name, first letter capitalised */}
                  {movie.translatorName && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <User size={13} className="text-blue-400" />
                      <span className="text-blue-400 text-sm font-medium">
                        {movie.translatorName.charAt(0).toUpperCase() + movie.translatorName.slice(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Watch Full Movie button */}
                  {(movie.videoUrl || movie.movieLink) && (
                    <a
                      href={movie.videoUrl || movie.movieLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border
                                 bg-red-600 border-red-500 text-white text-sm font-bold
                                 hover:bg-red-500 transition-all shadow-lg shadow-red-600/30"
                    >
                      <Play size={15} fill="white" /> Watch Full Movie
                    </a>
                  )}
                  <button
                    onClick={() => toggleFavorite(movie)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm
                                font-medium transition-all ${
                      isFavorite(movie._id)
                        ? "bg-red-600/20 border-red-500 text-red-400"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Heart size={15} className={isFavorite(movie._id) ? "fill-red-500" : ""} />
                    {isFavorite(movie._id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                               bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    <Share2 size={15} /> Share
                  </button>
                  {/* Download button */}
                  {(movie.videoUrl || movie.movieLink) && (
                    <a
                      href={movie.videoUrl || movie.movieLink}
                      download
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                                 bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all"
                    >
                      <Download size={15} /> Download
                    </a>
                  )}
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
                  <span className="text-green-400 text-xs ml-auto">✓ Rated {userRating}/5</span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2"
                    style={{ textShadow: "0 2px 12px rgba(239,68,68,0.5)" }}>
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  Story
                </h2>
                <p className={`text-gray-300 leading-relaxed text-sm md:text-base
                               ${!showFullDesc && isLong ? "line-clamp-3" : ""}`}>
                  {desc || "No description available."}
                </p>
                {isLong && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300
                               text-sm mt-2 transition-colors"
                  >
                    {showFullDesc
                      ? <><ChevronUp size={14} /> Show less</>
                      : <><ChevronDown size={14} /> Read more</>}
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

              <form onSubmit={handleComment} className="space-y-3 mb-6">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 text-white
                             placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
                <div className="flex gap-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="flex-1 bg-white/5 border border-white/10 text-white
                               placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-red-500/50
                               transition-all resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !commentName.trim() || !commentText.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                               disabled:cursor-not-allowed text-white rounded-xl
                               transition-colors self-end"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-400 font-semibold text-sm">{c.name}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(c.date).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
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

          {/* ══ RIGHT: Related Movies (horizontal carousel) ══════════════════ */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"
                  style={{ textShadow: "0 2px 12px rgba(239,68,68,0.5)" }}>
                <div className="w-1 h-5 bg-red-500 rounded-full" />
                Related Movies
              </h2>
              {relatedMovies.length > 2 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => scrollRelated("left")}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10
                               rounded-lg text-gray-400 hover:text-white transition-all"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => scrollRelated("right")}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10
                               rounded-lg text-gray-400 hover:text-white transition-all"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {relatedMovies.length === 0 ? (
              <p className="text-gray-500 text-sm">No related movies found.</p>
            ) : (
              <>
                {/* Mobile / tablet: horizontal scroll carousel */}
                <div
                  ref={relatedScrollRef}
                  className="lg:hidden flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide"
                >
                  {relatedMovies.map((rel, i) => (
                    <div key={rel._id} className="shrink-0 w-36">
                      <MovieCard movie={rel} index={i} />
                    </div>
                  ))}
                </div>

                {/* Desktop: vertical list */}
                <div className="hidden lg:flex flex-col gap-3">
                  {relatedMovies.map((rel) => (
                    <Link
                      key={rel._id}
                      to={`/movie/${rel._id}`}
                      className="flex gap-3 bg-white/5 hover:bg-white/10 border border-white/5
                                 hover:border-white/10 rounded-xl p-3 transition-all group"
                    >
                      <img
                        src={rel.posterUrls?.[0] || rel.image || "https://placehold.co/56x80?text=?"}
                        alt={rel.title}
                        className="w-14 h-20 object-cover rounded-lg shrink-0
                                   group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-sm font-semibold truncate
                                       group-hover:text-red-400 transition-colors">
                          {rel.title}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">{rel.year}</p>
                        <p className="text-gray-500 text-xs mt-0.5 truncate">{rel.genre}</p>
                        {rel.translatorName && (
                          <p className="text-blue-400 text-xs mt-0.5 truncate flex items-center gap-1">
                            <User size={9} /> {rel.translatorName}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 text-xs">
                            {rel.avgRating || rel.rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieWatch;
