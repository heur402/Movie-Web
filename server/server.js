// server.js - Production-ready Movie Streaming Platform Backend
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    abortOnLimit: false,
  })
);

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/moviedb")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Schemas ──────────────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  name: String,
  text: String,
  date: { type: Date, default: Date.now },
});

const ratingSchema = new mongoose.Schema({
  score: { type: Number, min: 1, max: 5 },
  date: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: String,
    rating: String,
    genre: String,
    // Legacy single image field
    image: String,
    // New multi-poster support (Cloudinary URLs)
    posterUrls: [String],
    // Video / trailer
    trailer: String,
    videoUrl: String,
    description: String,
    duration: String,
    // Engagement
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    // Status
    status: { type: String, enum: ["published", "draft"], default: "published" },
    comments: [commentSchema],
    ratings: [ratingSchema],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for performance
movieSchema.index({ views: -1 });
movieSchema.index({ createdAt: -1 });
movieSchema.index({ genre: 1 });
movieSchema.index({ trendingScore: -1 });
movieSchema.index({ title: "text", description: "text" });

const trendingSchema = new mongoose.Schema(
  {
    title: String,
    year: String,
    rating: String,
    genre: String,
    image: String,
    posterUrls: [String],
    trailer: String,
    videoUrl: String,
    description: String,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [commentSchema],
    ratings: [ratingSchema],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    profileImageUrl: { type: String, default: null },
    watchHistory: [
      {
        movieId: String,
        movieTitle: String,
        movieImage: String,
        progress: { type: Number, default: 0 },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
    favorites: [String],
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", movieSchema);
const Trending = mongoose.model("Trending", trendingSchema);
const User = mongoose.model("User", userSchema);

// ─── Helper: Upload to Cloudinary ─────────────────────────────────────────────
const uploadToCloudinary = async (file, folder = "movies", resourceType = "auto") => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder,
      resource_type: resourceType,
      quality: "auto",
      fetch_format: "auto",
    });
    return result.secure_url;
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

// ─── Helper: Compute avg rating ───────────────────────────────────────────────
const computeAvgRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + (r.score || r), 0);
  return parseFloat((sum / ratings.length).toFixed(1));
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOVIE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/movies/search  ← MUST be before /:id
app.get("/api/movies/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await Movie.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    }).limit(20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies/genres — dynamic genres from DB
app.get("/api/movies/genres", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).select("genre");
    const genreSet = new Set();
    movies.forEach((m) => {
      if (m.genre) {
        m.genre.split(/[,/]/).forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) genreSet.add(trimmed);
        });
      }
    });
    res.json([...genreSet].sort());
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies/years — dynamic years from DB
app.get("/api/movies/years", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" }).select("year");
    const yearSet = new Set();
    movies.forEach((m) => {
      if (m.year) yearSet.add(m.year.toString().trim());
    });
    const sorted = [...yearSet].sort((a, b) => parseInt(b) - parseInt(a));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies/explore — filtered + paginated
app.get("/api/movies/explore", async (req, res) => {
  try {
    const { genre, year, search, page = 1, limit = 20 } = req.query;
    const query = { status: "published" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (genre && genre !== "All") {
      query.genre = { $regex: genre, $options: "i" };
    }
    if (year) {
      query.year = year;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Movie.countDocuments(query),
    ]);

    res.json({
      movies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies/latest — newest movies
app.get("/api/movies/latest", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(12);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies/featured — top viewed
app.get("/api/movies/featured", async (req, res) => {
  try {
    const movies = await Movie.find({ status: "published" })
      .sort({ views: -1 })
      .limit(5);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/movies — all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// POST /api/movies — create movie (with optional Cloudinary upload)
app.post("/api/movies", async (req, res) => {
  try {
    const movieData = { ...req.body };

    // Handle Cloudinary poster upload
    if (req.files?.poster) {
      const posterFile = req.files.poster;
      const url = await uploadToCloudinary(posterFile, "movies/posters", "image");
      movieData.image = url;
      movieData.posterUrls = [url];
    }

    // Handle multiple posters
    if (req.files?.posters) {
      const files = Array.isArray(req.files.posters) ? req.files.posters : [req.files.posters];
      const urls = await Promise.all(files.map((f) => uploadToCloudinary(f, "movies/posters", "image")));
      movieData.posterUrls = urls;
      if (!movieData.image) movieData.image = urls[0];
    }

    // Handle video upload
    if (req.files?.video) {
      const videoUrl = await uploadToCloudinary(req.files.video, "movies/videos", "video");
      movieData.videoUrl = videoUrl;
    }

    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/movies/:id
app.get("/api/movies/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/movies/:id
app.put("/api/movies/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files?.poster) {
      const url = await uploadToCloudinary(req.files.poster, "movies/posters", "image");
      updateData.image = url;
      updateData.posterUrls = [url];
    }

    const updated = await Movie.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Movie not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/movies/:id
app.delete("/api/movies/:id", async (req, res) => {
  try {
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/movies/:id/view — increment view count
app.post("/api/movies/:id/view", async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json({ views: movie.views });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/movies/:id/comments
app.post("/api/movies/:id/comments", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) return res.status(400).json({ message: "Name and text required" });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    const comment = { name, text, date: new Date() };
    movie.comments.unshift(comment);
    await movie.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/movies/:id/rate
app.post("/api/movies/:id/rate", async (req, res) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ error: "Invalid score" });
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    movie.ratings.push({ score });
    movie.avgRating = computeAvgRating(movie.ratings);
    await movie.save();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRENDING ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get("/api/trending", async (req, res) => {
  try {
    const trendings = await Trending.find().sort({ createdAt: -1 });
    res.json(trendings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trendings" });
  }
});

app.post("/api/trending", async (req, res) => {
  try {
    const trendingData = { ...req.body };

    if (req.files?.poster) {
      const url = await uploadToCloudinary(req.files.poster, "movies/posters", "image");
      trendingData.image = url;
      trendingData.posterUrls = [url];
    }

    const trending = new Trending(trendingData);
    const saved = await trending.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Failed to add trending", error: err.message });
  }
});

app.put("/api/trending/:id", async (req, res) => {
  try {
    const updated = await Trending.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/trending/:id", async (req, res) => {
  try {
    await Trending.findByIdAndDelete(req.params.id);
    res.json({ message: "Trending movie deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

app.post("/api/trending/:id/comments", async (req, res) => {
  try {
    const { name, text } = req.body;
    const movie = await Trending.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Not found" });
    const comment = { name, text, date: new Date() };
    movie.comments.push(comment);
    await movie.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/trending/:id/rate", async (req, res) => {
  try {
    const { score } = req.body;
    const movie = await Trending.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Not found" });
    movie.ratings.push({ score, date: new Date() });
    movie.avgRating = computeAvgRating(movie.ratings);
    await movie.save();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/trending/:id/view", async (req, res) => {
  try {
    const movie = await Trending.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: movie?.views || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CLOUDINARY UPLOAD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/upload/image — upload single image to Cloudinary
app.post("/api/upload/image", async (req, res) => {
  try {
    if (!req.files?.image) return res.status(400).json({ error: "No image file provided" });
    const url = await uploadToCloudinary(req.files.image, "movies/posters", "image");
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload/video — upload video to Cloudinary
app.post("/api/upload/video", async (req, res) => {
  try {
    if (!req.files?.video) return res.status(400).json({ error: "No video file provided" });
    const url = await uploadToCloudinary(req.files.video, "movies/videos", "video");
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER / PROFILE ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/user/profile — get or create default user
app.get("/api/user/profile", async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = new User({ username: "Guest" });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/profile — update username
app.post("/api/user/profile", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });
    let user = await User.findOne();
    if (!user) {
      user = new User({ username });
    } else {
      user.username = username;
    }
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/profile-image — upload profile image
app.post("/api/user/profile-image", async (req, res) => {
  try {
    if (!req.files?.profileImage) return res.status(400).json({ message: "No image provided" });
    const url = await uploadToCloudinary(req.files.profileImage, "profiles", "image");
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });
    user.profileImageUrl = url;
    await user.save();
    res.json({ profileImageUrl: url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/watch-history — save watch progress
app.post("/api/user/watch-history", async (req, res) => {
  try {
    const { movieId, movieTitle, movieImage, progress } = req.body;
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });

    const existingIdx = user.watchHistory.findIndex((h) => h.movieId === movieId);
    if (existingIdx >= 0) {
      user.watchHistory[existingIdx].progress = progress;
      user.watchHistory[existingIdx].watchedAt = new Date();
    } else {
      user.watchHistory.unshift({ movieId, movieTitle, movieImage, progress });
      if (user.watchHistory.length > 20) user.watchHistory = user.watchHistory.slice(0, 20);
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/watch-history
app.get("/api/user/watch-history", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user?.watchHistory || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/user/favorites — toggle favorite
app.post("/api/user/favorites", async (req, res) => {
  try {
    const { movieId } = req.body;
    let user = await User.findOne();
    if (!user) user = new User({ username: "Guest" });

    const idx = user.favorites.indexOf(movieId);
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(movieId);
    }
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/user/favorites
app.get("/api/user/favorites", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user?.favorites || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
