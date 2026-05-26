// src/components/MovieWatch.jsx — Movie details page with trailer only
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play, Heart, Star, ArrowLeft, Share2, Download,
  MessageCircle, Send, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, User, Film
} from "lucide-react";
import { useApp } from "../context/AppContext";
import MovieCard from "./MovieCard";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────────
const toEmbedUrl = (url) => {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/") + "?autoplay=1&mute=1&rel=0";
  if (url.includes("youtu.be/"))            return url.replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1&mute=1&rel=0";
  if (url.includes("youtube.com/embed/"))   return url.includes("?") ? url + "&autoplay=1&mute=1" : url + "?autoplay=1&mute=1";
  return null; // not a YouTube URL
};

// ── Component ─────────────────────────────────────────────────────────────────
const MovieWatch = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();

  const [movie,         setMovie]         = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [comments,      setComments]      = useState([]);
  const [commentName,   setCommentName]   = useState("");
  const [commentText,   setCommentText]   = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [userRating,    setUserRating]    = useState(0);
  const [hoverRating,   setHoverRating]   = useState(0);
  const [avgRating,     setAvgRating]     = useState(0);
  const [showFullDesc,  setShowFullDesc]  = useState(false);
  const [viewCounted,   setViewCounted]   = useState(false);

  const relatedRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [mRes, rRes] = await Promise.all([
          fetch(`${API}/api/movies/${id}`),
          fetch(`${API}/api/movies/${id}/related`),
        ]);
        let found = mRes.ok ? await mRes.json() : null;
        if (!found) {
          const all = await (await fetch(`${API}/api/movies`)).json();
          found = all.find((m) => m._id === id) || null;
        }
        if (!found) { setLoading(false); return; }
        setMovie(found);
        setComments(found.comments || []);
        const r = found.ratings || [];
        setAvgRating(r.length > 0
          ? (r.reduce((s, x) => s + (x.score || x), 0) / r.length).toFixed(1)
          : found.rating || 0);
        if (rRes.ok) {
          const rel = await rRes.json();
          setRelatedMovies(Array.isArray(rel) ? rel : []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
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
      const res = await fetch(`${API}/api/movies/${id}/rate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      const updated = await res.json();
      const r = updated.ratings || [];
      setAvgRating(r.length > 0
        ? (r.reduce((s, x) => s + (x.score || x), 0) / r.length).toFixed(1)
        : score);
    } catch (e) { console.error(e); }
  };

  // ── Comment ────────────────────────────────────────────────────────────────
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/movies/${id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: commentName, text: commentText }),
      });
      const c = await res.json();
      setComments((p) => [c, ...p]);
      setCommentName(""); setCommentText("");
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  // ── Share ──────────────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: movie?.title, url: window.location.href });
    else { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }
  };

  const scrollRelated = (dir) => {
    relatedRef.current?.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  };

  // ── States ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!movie) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <Film size={56} className="text-gray-600" />
      <h2 className="text-2xl font-bold">Movie not found</h2>
      <Link to="/" className="px-6 py-3 bg-red-600 rounded-xl hover:bg-red-500 transition-colors font-semibold">
        Back to Home
      </Link>
    </div>
  );

  const poster      = movie.posterUrls?.[0] || movie.image;
  const desc        = movie.description || "";
  const isLong      = desc.length > 200;
  const embedUrl    = toEmbedUrl(movie.trailer);
  const hasFullMovie = !!(movie.videoUrl || movie.movieLink);
  const translatorDisplay = movie.translatorName
    ? movie.translatorName.charAt(0).toUpperCase() + movie.translatorName.slice(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Back */}
      <div className="fixed top-4 left-4 z-40">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-white/10
                     text-white px-4 py-2 rounded-xl hover:bg-black/90 transition-all text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ LEFT ══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Trailer player ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-red-500 rounded-full" />
                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Trailer</span>
              </div>

              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={`${movie.title} — Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : movie.trailer ? (
                  /* Non-YouTube trailer URL — play as video */
                  <video src={movie.trailer} controls muted autoPlay
                    className="w-full h-full" poster={poster} />
                ) : (
                  /* No trailer */
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900/80 gap-4">
                    {poster && <img src={poster} alt={movie.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-15" />}
                    <div className="relative z-10 text-center px-6">
                      <Film size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No trailer available</p>
                      <p className="text-gray-600 text-sm mt-1">Check back later</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Title + actions ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="text-2xl md:text-3xl font-black leading-tight">{movie.title}</h1>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400 flex-wrap">
                {movie.year  && <span>{movie.year}</span>}
                {movie.genre && <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{movie.genre}</span>}
                {movie.duration && <span className="text-gray-500">{movie.duration}</span>}
              </div>

              {translatorDisplay && (
                <div className="flex items-center gap-1.5 mt-2">
                  <User size={13} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">{translatorDisplay}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {/* Watch Full Movie → /watch/:id — uses Link for instant SPA navigation */}
                {hasFullMovie ? (
                  <Link
                    to={`/watch/${id}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600
                               hover:bg-red-500 text-white text-sm font-bold transition-all
                               shadow-lg shadow-red-600/30"
                  >
                    <Play size={16} fill="white" /> Watch Full Movie
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800
                                   border border-gray-700 text-gray-500 text-sm font-medium cursor-not-allowed">
                    <Film size={16} /> Full Movie Unavailable
                  </span>
                )}

                <button onClick={() => toggleFavorite(movie)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm
                              font-medium transition-all ${
                    isFavorite(movie._id)
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                  }`}>
                  <Heart size={15} className={isFavorite(movie._id) ? "fill-red-500" : ""} />
                  {isFavorite(movie._id) ? "Saved" : "Save"}
                </button>

                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10
                             bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all">
                  <Share2 size={15} /> Share
                </button>

                {hasFullMovie && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const url = movie.videoUrl || movie.movieLink;
                      const a   = document.createElement("a");
                      a.href     = url;
                      a.download = movie.title || "movie";
                      a.target   = "_blank";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10
                               bg-white/5 text-gray-300 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    <Download size={15} /> Download
                  </button>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => handleRate(s)}
                      onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125">
                      <Star size={22} className={`transition-colors ${
                        s <= (hoverRating || userRating || parseFloat(avgRating))
                          ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                      }`} />
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
                {userRating > 0 && <span className="text-green-400 text-xs ml-auto">✓ Rated {userRating}/5</span>}
              </div>

              {/* Story */}
              <div className="mt-5">
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
                  <button onClick={() => setShowFullDesc(!showFullDesc)}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm mt-2 transition-colors">
                    {showFullDesc ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
                  </button>
                )}
              </div>
            </motion.div>

            {/* ── Comments ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MessageCircle size={18} className="text-red-400" />
                Comments
                {comments.length > 0 && <span className="text-gray-400 text-sm font-normal">({comments.length})</span>}
              </h2>

              <form onSubmit={handleComment} className="space-y-3 mb-6">
                <input type="text" value={commentName} onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500
                             rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2
                             focus:ring-red-500/50 transition-all" />
                <div className="flex gap-2">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..." rows={2}
                    className="flex-1 bg-white/5 border border-white/10 text-white placeholder-gray-500
                               rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2
                               focus:ring-red-500/50 transition-all resize-none" />
                  <button type="submit"
                    disabled={submitting || !commentName.trim() || !commentText.trim()}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                               disabled:cursor-not-allowed text-white rounded-xl transition-colors self-end">
                    <Send size={16} />
                  </button>
                </div>
              </form>

              <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
                {comments.length === 0
                  ? <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
                  : comments.map((c, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-400 font-semibold text-sm">{c.name}</span>
                        <span className="text-gray-500 text-xs">
                          {new Date(c.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.text}</p>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </div>

          {/* ══ RIGHT: Related Movies ══════════════════════════════════════════ */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"
                  style={{ textShadow: "0 2px 12px rgba(239,68,68,0.5)" }}>
                <div className="w-1 h-5 bg-red-500 rounded-full" />
                Related Movies
              </h2>
              {relatedMovies.length > 2 && (
                <div className="flex gap-1">
                  <button onClick={() => scrollRelated("left")}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => scrollRelated("right")}
                    className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {relatedMovies.length === 0
              ? <p className="text-gray-500 text-sm">No related movies found.</p>
              : (
                <>
                  {/* Mobile: horizontal */}
                  <div ref={relatedRef}
                    className="lg:hidden flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide">
                    {relatedMovies.map((rel, i) => (
                      <div key={rel._id} className="shrink-0 w-36">
                        <MovieCard movie={rel} index={i} />
                      </div>
                    ))}
                  </div>

                  {/* Desktop: vertical */}
                  <div className="hidden lg:flex flex-col gap-3">
                    {relatedMovies.map((rel) => (
                      <Link key={rel._id} to={`/movie/${rel._id}`}
                        className="flex gap-3 bg-white/5 hover:bg-white/10 border border-white/5
                                   hover:border-white/10 rounded-xl p-3 transition-all group">
                        <img src={rel.posterUrls?.[0] || rel.image || "https://placehold.co/56x80?text=?"}
                          alt={rel.title}
                          className="w-14 h-20 object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-semibold truncate group-hover:text-red-400 transition-colors">
                            {rel.title}
                          </h3>
                          <p className="text-gray-400 text-xs mt-0.5">{rel.year}</p>
                          <p className="text-gray-500 text-xs mt-0.5 truncate">{rel.genre}</p>
                          {rel.translatorName && (
                            <p className="text-blue-400 text-xs mt-0.5 truncate flex items-center gap-1">
                              <User size={9} />
                              {rel.translatorName.charAt(0).toUpperCase() + rel.translatorName.slice(1)}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs">{rel.avgRating || rel.rating || "N/A"}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieWatch;
