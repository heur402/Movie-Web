// src/admin/AdminMovieDetail.jsx — Full detail view for a single movie in the admin panel
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Eye,
  Heart,
  TrendingUp,
  Play,
  Clock,
  Calendar,
  Tag,
  User,
  MessageCircle,
  Video,
  VideoOff,
  ExternalLink,
  RefreshCw,
  Film,
  BarChart2,
  Hash,
} from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => (n ?? 0).toLocaleString();

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const fullDate = (dateStr) =>
  new Date(dateStr).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

// ── Main Component ────────────────────────────────────────────────────────────
const AdminMovieDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [movie,    setMovie]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [imgError, setImgError] = useState(false);
  const [tab,      setTab]      = useState("info"); // "info" | "analytics" | "comments"

  const fetchMovie = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/movies/${id}`);
      if (!res.ok) throw new Error("Movie not found");
      const data = await res.json();
      setMovie(data);
    } catch (err) {
      console.error(err);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovie(); }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading movie details…</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Film size={48} className="text-gray-600" />
        <p className="text-white text-lg font-semibold">Movie not found</p>
        <button
          onClick={() => navigate("/admin/movies")}
          className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30
                     border border-red-500/30 text-red-400 rounded-xl text-sm transition-all"
        >
          <ArrowLeft size={15} /> Back to Movies
        </button>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const poster = imgError
    ? "https://placehold.co/300x450/111827/6b7280?text=No+Image"
    : movie.posterUrls?.[0] || movie.image
      || "https://placehold.co/300x450/111827/6b7280?text=No+Image";

  const hasVideo   = !!(movie.videoUrl || movie.movieLink);
  const avgRating  = movie.avgRating
    || (movie.ratings?.length > 0
      ? (movie.ratings.reduce((s, r) => s + (r.score || 0), 0) / movie.ratings.length).toFixed(1)
      : null);

  const ratingCount = movie.ratings?.length || 0;
  const commentCount = movie.comments?.length || 0;

  // Star distribution (1-5)
  const starDist = [5, 4, 3, 2, 1].map((star) => {
    const count = movie.ratings?.filter((r) => Math.round(r.score) === star).length || 0;
    const pct   = ratingCount > 0 ? Math.round((count / ratingCount) * 100) : 0;
    return { star, count, pct };
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMovie}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400
                       hover:text-white rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <Link
            to={`/movie/${movie._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30
                       border border-red-500/30 text-red-400 rounded-xl text-sm font-medium
                       transition-all"
          >
            <ExternalLink size={14} /> View on Site
          </Link>
          <Link
            to={`/admin/movies`}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10
                       border border-white/10 text-gray-300 rounded-xl text-sm font-medium
                       transition-all"
          >
            Manage Movies
          </Link>
        </div>
      </div>

      {/* ── Hero section ── */}
      <div className="flex flex-col md:flex-row gap-6 bg-gray-900/50 border border-white/5
                      rounded-2xl p-5 md:p-6">
        {/* Poster */}
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="relative w-40 md:w-48 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
            <img
              src={poster}
              alt={movie.title}
              onError={() => setImgError(true)}
              className="w-full aspect-[2/3] object-cover"
            />
            {/* Video badge */}
            <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full
                             text-xs font-bold backdrop-blur-sm
                             ${hasVideo
                               ? "bg-green-500/80 text-white"
                               : "bg-gray-700/80 text-gray-300"}`}>
              {hasVideo ? <Video size={10} /> : <VideoOff size={10} />}
              {hasVideo ? "Video" : "No Video"}
            </div>
          </div>
        </div>

        {/* Core info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {movie.status && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                  ${movie.status === "published"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"}`}>
                  {movie.status}
                </span>
              )}
              {movie.genre && (
                <span className="px-2.5 py-0.5 bg-white/10 text-gray-300 rounded-full text-xs">
                  {movie.genre}
                </span>
              )}
              {movie.year && (
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Calendar size={11} /> {movie.year}
                </span>
              )}
              {movie.duration && (
                <span className="flex items-center gap-1 text-gray-400 text-xs">
                  <Clock size={11} /> {movie.duration}
                </span>
              )}
            </div>
          </div>

          {/* Rating row */}
          <div className="flex flex-wrap items-center gap-4">
            {(avgRating || movie.rating) && (
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  {avgRating || movie.rating}
                </span>
                {ratingCount > 0 && (
                  <span className="text-gray-500 text-xs">({ratingCount} ratings)</span>
                )}
              </div>
            )}
            {movie.translatorName && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-blue-400" />
                <span className="text-blue-400 text-sm">
                  {movie.translatorName.charAt(0).toUpperCase() + movie.translatorName.slice(1)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {movie.description && (
            <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
              {movie.description}
            </p>
          )}

          {/* Tags */}
          {movie.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {movie.tags.map((tag) => (
                <span key={tag}
                  className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10
                             text-gray-400 rounded-full text-xs">
                  <Hash size={9} /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {[
              { icon: Eye,        label: "Views",      value: fmt(movie.views)      },
              { icon: Heart,      label: "Likes",      value: fmt(movie.likes)      },
              { icon: Play,       label: "Watches",    value: fmt(movie.watchCount) },
              { icon: TrendingUp, label: "Trend Score",value: fmt(movie.trendingScore) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}
                className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-center">
                <Icon size={14} className="text-gray-500 mx-auto mb-0.5" />
                <p className="text-white font-bold text-sm">{value}</p>
                <p className="text-gray-500 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white/5 border border-white/5 rounded-xl p-1 w-fit">
        {[
          { key: "info",      label: "Details",   icon: Film         },
          { key: "analytics", label: "Analytics", icon: BarChart2    },
          { key: "comments",  label: `Comments (${commentCount})`, icon: MessageCircle },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all ${tab === key
                          ? "bg-red-600 text-white shadow"
                          : "text-gray-400 hover:text-white"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Details ── */}
      {tab === "info" && (
        <motion.div
          key="info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Left: metadata */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
              Movie Info
            </h3>
            <dl className="space-y-3">
              {[
                { label: "Title",       value: movie.title      },
                { label: "Genre",       value: movie.genre      },
                { label: "Year",        value: movie.year       },
                { label: "Duration",    value: movie.duration   },
                { label: "Rating",      value: movie.rating     },
                { label: "Translator",  value: movie.translatorName },
                { label: "Status",      value: movie.status     },
                { label: "Added",       value: movie.createdAt ? fullDate(movie.createdAt) : null },
                { label: "Updated",     value: movie.updatedAt ? fullDate(movie.updatedAt) : null },
              ].filter(({ value }) => value).map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-gray-200 text-right truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: video / poster links */}
          <div className="space-y-4">
            {/* Video availability */}
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                Video Availability
              </h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl border
                ${hasVideo
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"}`}>
                {hasVideo
                  ? <Video size={20} className="text-green-400 shrink-0" />
                  : <VideoOff size={20} className="text-red-400 shrink-0" />}
                <div>
                  <p className={`font-semibold text-sm ${hasVideo ? "text-green-400" : "text-red-400"}`}>
                    {hasVideo ? "Video Available" : "No Video Attached"}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {movie.videoUrl
                      ? "Cloudinary hosted"
                      : movie.movieLink
                        ? "External link"
                        : "No video source found"}
                  </p>
                </div>
              </div>
              {(movie.videoUrl || movie.movieLink) && (
                <a
                  href={movie.videoUrl || movie.movieLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300
                             transition-colors truncate"
                >
                  <ExternalLink size={11} />
                  <span className="truncate">{movie.videoUrl || movie.movieLink}</span>
                </a>
              )}
            </div>

            {/* Poster thumbnails */}
            {(movie.posterUrls?.length > 0 || movie.image || movie.thumbnail) && (
              <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  Posters / Thumbnails
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...(movie.posterUrls || []), movie.image, movie.thumbnail]
                    .filter(Boolean)
                    .filter((v, i, a) => a.indexOf(v) === i) // dedupe
                    .map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url}
                          alt={`Poster ${i + 1}`}
                          className="w-16 h-24 object-cover rounded-lg border border-white/10
                                     hover:border-white/30 transition-all hover:scale-105"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </a>
                    ))}
                </div>
              </div>
            )}

            {/* Trailer */}
            {movie.trailer && (
              <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
                  Trailer
                </h3>
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={movie.trailer}
                    title="Trailer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Tab: Analytics ── */}
      {tab === "analytics" && (
        <motion.div
          key="analytics"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Engagement stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Eye,        label: "Total Views",       value: fmt(movie.views),         color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"   },
              { icon: Heart,      label: "Total Likes",       value: fmt(movie.likes),         color: "text-pink-400",   bg: "bg-pink-500/10 border-pink-500/20"   },
              { icon: Play,       label: "Watch Count",       value: fmt(movie.watchCount),    color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
              { icon: TrendingUp, label: "Trending Score",    value: fmt(movie.trendingScore), color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20"},
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label}
                className={`${bg} border rounded-2xl p-4 text-center`}>
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-gray-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Ratings breakdown */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">User Ratings</h3>
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">
                  {avgRating || "—"}
                </span>
                <span className="text-gray-500 text-xs">/ 5 · {ratingCount} ratings</span>
              </div>
            </div>

            {ratingCount === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No ratings yet</p>
            ) : (
              <div className="space-y-2">
                {starDist.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-8 text-right shrink-0">{star}★</span>
                    <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-gray-500 w-12 text-right shrink-0">
                      {count} ({pct}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comment count summary */}
          <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <MessageCircle size={20} className="text-purple-400" />
              <div>
                <p className="text-white font-semibold">{commentCount} Comments</p>
                <p className="text-gray-500 text-xs">
                  {commentCount === 0
                    ? "No comments yet"
                    : `Switch to the Comments tab to read them`}
                </p>
              </div>
              {commentCount > 0 && (
                <button
                  onClick={() => setTab("comments")}
                  className="ml-auto text-purple-400 hover:text-purple-300 text-xs
                             underline underline-offset-2 transition-colors"
                >
                  View all
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab: Comments ── */}
      {tab === "comments" && (
        <motion.div
          key="comments"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">
              {commentCount} Comment{commentCount !== 1 ? "s" : ""}
            </h3>
          </div>

          {commentCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3
                            bg-gray-900/50 border border-white/5 rounded-2xl">
              <MessageCircle size={36} className="text-gray-600" />
              <p className="text-gray-400 font-medium">No comments yet</p>
              <p className="text-gray-600 text-sm">Comments left by users will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1
                            scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {[...movie.comments]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((comment, i) => (
                  <motion.div
                    key={comment._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="bg-gray-900/50 border border-white/5 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-purple-600
                                        flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(comment.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium text-sm">
                          {comment.name || "Anonymous"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-gray-500 text-xs" title={fullDate(comment.date)}>
                          {timeAgo(comment.date)}
                        </p>
                        <p className="text-gray-600 text-xs">{fullDate(comment.date)}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed pl-9">
                      {comment.text}
                    </p>
                  </motion.div>
                ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminMovieDetail;
