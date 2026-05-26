// server.js — Production Movie Streaming Platform
import express    from "express";
import mongoose   from "mongoose";
import cors       from "cors";
import dotenv     from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import jwt        from "jsonwebtoken";
import bcrypt     from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Cloudinary ────────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
  api_key    : process.env.CLOUDINARY_API_KEY,
  api_secret : process.env.CLOUDINARY_API_SECRET,
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir  : "/tmp/",
  limits       : { fileSize: 500 * 1024 * 1024 },
  abortOnLimit : false,
}));

// ── MongoDB ───────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moviedb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ── Schemas ───────────────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  name : String,
  text : String,
  date : { type: Date, default: Date.now },
});

const ratingSchema = new mongoose.Schema({
  score : { type: Number, min: 1, max: 5 },
  date  : { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  title          : { type: String, required: true },
  year           : String,
  rating         : String,
  genre          : String,
  image          : String,          // legacy / primary poster
  posterUrls     : [String],        // multi-poster support
  trailer        : String,          // YouTube embed URL
  videoUrl       : String,          // Cloudinary or external video URL
  movieLink      : String,          // admin-pasted / pre-upload link
  description    : String,
  duration       : String,
  translatorName : String,          // ← NEW
  thumbnail      : String,          // auto-generated or uploaded
  cloudinaryPublicId : String,      // for deletion
  // engagement
  views          : { type: Number, default: 0 },
  likes          : { type: Number, default: 0 },
  shares         : { type: Number, default: 0 },
  watchCount     : { type: Number, default: 0 },
  trendingScore  : { type: Number, default: 0 },
  // meta
  status         : { type: String, enum: ["published","draft"], default: "published" },
  tags           : [String],
  comments       : [commentSchema],
  ratings        : [ratingSchema],
  avgRating      : { type: Number, default: 0 },
}, { timestamps: true });

// Indexes
movieSchema.index({ views: -1 });
movieSchema.index({ trendingScore: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ title: "text", description: "text", tags: "text" });

// Pre-upload schema (videos uploaded to Cloudinary before being assigned to a movie)
const preUploadSchema = new mongoose.Schema({
  title          : String,
  videoUrl       : String,
  thumbnail      : String,
  duration       : String,          // e.g. "2h 15m"
  durationSecs   : Number,
  fileSize       : Number,          // bytes
  cloudinaryPublicId : String,
  status         : { type: String, enum: ["uploading","ready","used"], default: "uploading" },
  uploadedAt     : { type: Date, default: Date.now },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username       : { type: String, required: true, unique: true, trim: true },
  profileImageUrl: { type: String, default: null },
  watchHistory   : [{
    movieId    : String,
    movieTitle : String,
    movieImage : String,
    progress   : { type: Number, default: 0 },
    watchedAt  : { type: Date, default: Date.now },
  }],
  favorites : [String],
}, { timestamps: true });

const Movie     = mongoose.model("Movie",     movieSchema);
const PreUpload = mongoose.model("PreUpload", preUploadSchema);
const User      = mongoose.model("User",      userSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────
const uploadToCloudinary = async (file, folder = "movies", resourceType = "auto", extra = {}) => {
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type : resourceType,
    quality       : "auto",
    fetch_format  : "auto",
    ...extra,
  });
  return result;
};

const computeAvgRating = (ratings) => {
  if (!ratings?.length) return 0;
  const sum = ratings.reduce((a, r) => a + (r.score || r), 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};

// Trending score formula: views*0.5 + likes*0.3 + watchCount*0.1 + avgRating*0.1*20
const calcTrendingScore = (m) =>
  (m.views || 0) * 0.5 +
  (m.likes  || 0) * 0.3 +
  (m.watchCount || 0) * 0.1 +
  (m.avgRating  || 0) * 0.1 * 20;

// Smart related: score by genre match + title word overlap + tag overlap
const getRelatedMovies = (current, allMovies, limit = 12) => {
  const titleWords = new Set(
    (current.title || "").toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  );
  const currentTags = new Set((current.tags || []).map((t) => t.toLowerCase()));
  const currentGenres = new Set(
    (current.genre || "").split(/[,/]/).map((g) => g.trim().toLowerCase())
  );

  return allMovies
    .filter((m) => m._id.toString() !== current._id.toString())
    .map((m) => {
      let score = 0;
      // Genre match
      const mGenres = (m.genre || "").split(/[,/]/).map((g) => g.trim().toLowerCase());
      mGenres.forEach((g) => { if (currentGenres.has(g)) score += 3; });
      // Title word overlap
      (m.title || "").toLowerCase().split(/\s+/).forEach((w) => {
        if (w.length > 2 && titleWords.has(w)) score += 2;
      });
      // Tag overlap
      (m.tags || []).forEach((t) => { if (currentTags.has(t.toLowerCase())) score += 1; });
      return { movie: m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.movie);
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOVIE ROUTES  (specific paths BEFORE /:id)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/movies/translators — unique translator names from DB
app.get("/api/movies/translators", async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "published",
      translatorName: { $exists: true, $ne: "" },
    }).select("translatorName");
    const set = new Set();
    movies.forEach((m) => { if (m.translatorName?.trim()) set.add(m.translatorName.trim()); });
    res.json([...set].sort());
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await Movie.find({
      $or: [
        { title       : { $regex: q, $options: "i" } },
        { description : { $regex: q, $options: "i" } },
        { tags        : { $regex: q, $options: "i" } },
      ],
    }).limit(20);
    res.json(results);
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/genres", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).select("genre");
    const set = new Set();
    movies.forEach((m) => {
      if (m.genre) m.genre.split(/[,/]/).forEach((g) => { const t = g.trim(); if (t) set.add(t); });
    });
    res.json([...set].sort());
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/years", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).select("year");
    const set = new Set();
    movies.forEach((m) => { if (m.year) set.add(m.year.toString().trim()); });
    res.json([...set].sort((a, b) => parseInt(b) - parseInt(a)));
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/explore", async (req, res) => {
  try {
    const { genre, year, search, translator, page = 1, limit = 20 } = req.query;
    const query = { status: "published" };
    if (search) query.$or = [
      { title       : { $regex: search, $options: "i" } },
      { description : { $regex: search, $options: "i" } },
    ];
    if (genre && genre !== "All") query.genre = { $regex: genre, $options: "i" };
    if (year) query.year = year;
    if (translator) query.translatorName = { $regex: translator, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Movie.countDocuments(query),
    ]);
    res.json({ movies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/latest", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).sort({ createdAt: -1 }).limit(12);
    res.json(movies);
  } catch { res.status(500).json({ error: "Server error" }); }
});

// AUTO-TRENDING: top 5 movies by trendingScore (recalculated on the fly)
app.get("/api/movies/trending", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" });
    const scored = movies
      .map((m) => ({ ...m.toObject(), _score: calcTrendingScore(m) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);
    res.json(scored);
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies/featured", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).sort({ views: -1 }).limit(5);
    res.json(movies);
  } catch { res.status(500).json({ error: "Server error" }); }
});

// GET /api/movies/:id/related — smart related movies
app.get("/api/movies/:id/related", async (req, res) => {
  try {
    const current = await Movie.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Not found" });
    const all = await Movie.find({ status: "published" });
    const related = getRelatedMovies(current, all, 12);
    res.json(related);
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch { res.status(500).json({ error: "Failed to fetch movies" }); }
});

app.post("/api/movies", async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.poster) {
      const r = await uploadToCloudinary(req.files.poster, "movies/posters", "image");
      data.image = r.secure_url;
      data.posterUrls = [r.secure_url];
    }
    if (req.files?.video) {
      const r = await uploadToCloudinary(req.files.video, "movies/videos", "video");
      data.videoUrl = r.secure_url;
      data.cloudinaryPublicId = r.public_id;
      if (!data.thumbnail) data.thumbnail = r.secure_url.replace("/upload/", "/upload/so_0/");
    }
    const movie = new Movie(data);
    movie.trendingScore = calcTrendingScore(movie);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.put("/api/movies/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.poster) {
      const r = await uploadToCloudinary(req.files.poster, "movies/posters", "image");
      data.image = r.secure_url;
      data.posterUrls = [r.secure_url];
    }
    const updated = await Movie.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ error: "Movie not found" });
    updated.trendingScore = calcTrendingScore(updated);
    await updated.save();
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete("/api/movies/:id", async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/movies/:id/view", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1, watchCount: 1 } },
      { new: true }
    );
    if (!movie) return res.status(404).json({ error: "Not found" });
    movie.trendingScore = calcTrendingScore(movie);
    await movie.save();
    res.json({ views: movie.views });
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/movies/:id/like", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!movie) return res.status(404).json({ error: "Not found" });
    movie.trendingScore = calcTrendingScore(movie);
    await movie.save();
    res.json({ likes: movie.likes });
  } catch { res.status(500).json({ error: "Server error" }); }
});

app.post("/api/movies/:id/comments", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: "Name and text required" });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Not found" });
    const comment = { name, text, date: new Date() };
    movie.comments.unshift(comment);
    await movie.save();
    res.status(201).json(comment);
  } catch { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/movies/:id/rate", async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: "Invalid score" });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    movie.ratings.push({ score });
    movie.avgRating = computeAvgRating(movie.ratings);
    movie.trendingScore = calcTrendingScore(movie);
    await movie.save();
    res.json(movie);
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRENDING — now auto-generated, legacy manual endpoint kept for compatibility
// ═══════════════════════════════════════════════════════════════════════════════

// Redirect old /api/trending to auto-trending — capped at 5
app.get("/api/trending", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" });
    const scored = movies
      .map((m) => ({ ...m.toObject(), _score: calcTrendingScore(m) }))
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);
    res.json(scored);
  } catch { res.status(500).json({ message: "Failed to fetch trending" }); }
});

// Keep comment/rate/view endpoints for backward compat (they now hit Movie model)
app.post("/api/trending/:id/comments", async (req, res) => {
  req.url = `/api/movies/${req.params.id}/comments`;
  const { name, text } = req.body;
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Not found" });
    const comment = { name, text, date: new Date() };
    movie.comments.unshift(comment);
    await movie.save();
    res.status(201).json(comment);
  } catch { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/trending/:id/rate", async (req, res) => {
  try {
    const { score } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Not found" });
    movie.ratings.push({ score, date: new Date() });
    movie.avgRating = computeAvgRating(movie.ratings);
    movie.trendingScore = calcTrendingScore(movie);
    await movie.save();
    res.json(movie);
  } catch { res.status(500).json({ message: "Server error" }); }
});

app.post("/api/trending/:id/view", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1, watchCount: 1 } },
      { new: true }
    );
    if (movie) { movie.trendingScore = calcTrendingScore(movie); await movie.save(); }
    res.json({ views: movie?.views || 0 });
  } catch { res.status(500).json({ message: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-UPLOAD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/preupload — upload video to Cloudinary, save record
app.post("/api/preupload", async (req, res) => {
  try {
    if (!req.files?.video) return res.status(400).json({ error: "No video file" });
    const file = req.files.video;

    // Upload to Cloudinary with eager thumbnail
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder        : "movies/preupload",
      resource_type : "video",
      eager         : [{ width: 640, height: 360, crop: "fill", format: "jpg", start_offset: "0" }],
      eager_async   : false,
    });

    // Duration from Cloudinary metadata
    const durationSecs = Math.round(result.duration || 0);
    const h = Math.floor(durationSecs / 3600);
    const m = Math.floor((durationSecs % 3600) / 60);
    const s = durationSecs % 60;
    const durationStr = h > 0
      ? `${h}h ${m}m`
      : m > 0 ? `${m}m ${s}s` : `${s}s`;

    const thumbnail = result.eager?.[0]?.secure_url
      || result.secure_url.replace("/upload/", "/upload/so_0,w_640,h_360,c_fill/").replace(/\.\w+$/, ".jpg");

    const record = new PreUpload({
      title              : req.body.title || file.name || "Untitled",
      videoUrl           : result.secure_url,
      thumbnail,
      duration           : durationStr,
      durationSecs,
      fileSize           : file.size,
      cloudinaryPublicId : result.public_id,
      status             : "ready",
    });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/preupload — list all pre-uploaded videos
app.get("/api/preupload", async (req, res) => {
  try {
    const records = await PreUpload.find().sort({ uploadedAt: -1 });
    res.json(records);
  } catch { res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/preupload/:id
app.delete("/api/preupload/:id", async (req, res) => {
  try {
    const record = await PreUpload.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Not found" });
    // Delete from Cloudinary
    if (record.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(record.cloudinaryPublicId, { resource_type: "video" }).catch(() => {});
    }
    await PreUpload.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

app.post("/api/upload/image", async (req, res) => {
  try {
    if (!req.files?.image) return res.status(400).json({ error: "No image" });
    const r = await uploadToCloudinary(req.files.image, "movies/posters", "image");
    res.json({ url: r.secure_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/upload/video", async (req, res) => {
  try {
    if (!req.files?.video) return res.status(400).json({ error: "No video" });
    const r = await uploadToCloudinary(req.files.video, "movies/videos", "video");
    res.json({ url: r.secure_url, publicId: r.public_id, duration: r.duration });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER / PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/api/user/profile", async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) { user = new User({ username: "Guest" }); await user.save(); }
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/user/profile", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });
    let user = await User.findOne();
    if (!user) user = new User({ username });
    else user.username = username;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/user/profile-image", async (req, res) => {
  try {
    if (!req.files?.profileImage) return res.status(400).json({ message: "No image" });
    const r = await uploadToCloudinary(req.files.profileImage, "profiles", "image");
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });
    user.profileImageUrl = r.secure_url;
    await user.save();
    res.json({ profileImageUrl: r.secure_url });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/user/watch-history", async (req, res) => {
  try {
    const { movieId, movieTitle, movieImage, progress } = req.body;
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });
    const idx = user.watchHistory.findIndex((h) => h.movieId === movieId);
    if (idx >= 0) {
      user.watchHistory[idx].progress  = progress;
      user.watchHistory[idx].watchedAt = new Date();
    } else {
      user.watchHistory.unshift({ movieId, movieTitle, movieImage, progress });
      if (user.watchHistory.length > 20) user.watchHistory = user.watchHistory.slice(0, 20);
    }
    await user.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/user/watch-history", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user?.watchHistory || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post("/api/user/favorites", async (req, res) => {
  try {
    const { movieId } = req.body;
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });
    const idx = user.favorites.indexOf(movieId);
    if (idx >= 0) user.favorites.splice(idx, 1);
    else user.favorites.push(movieId);
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get("/api/user/favorites", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user?.favorites || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ═══════════════════════════════════════════════════════════════════════════════

const adminSchema = new mongoose.Schema({
  username : { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password : { type: String, required: true, minlength: 6 },
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.model("Admin", adminSchema);
const JWT_SECRET = process.env.JWT_SECRET || "mw_admin_secret_2024";

// Middleware: verify admin JWT
const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.admin = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// POST /api/admin/register
app.post("/api/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    const exists = await Admin.findOne({ username: username.trim() });
    if (exists) return res.status(409).json({ error: "Username already taken" });
    const admin = new Admin({ username: username.trim(), password });
    await admin.save();
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, username: admin.username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });
    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: admin.username });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/me — verify token
app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ username: req.admin.username });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));