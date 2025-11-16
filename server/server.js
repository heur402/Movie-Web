// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Trending from "./models/Trending.js";
import fileUpload from 'express-fileupload';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add this after express.json() middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/moviedb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection error:", err));

// Schema and model
const movieSchema = new mongoose.Schema({
  title: String,
  year: String,
  rating: String,
  genre: String,
  image: String,
  trailer: String,
  description: String,

  comments: [
    {
      name: String,
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],

  ratings: [
    {
      score: { type: Number, min: 1, max: 5 },
    },
  ],
});

const Movie = mongoose.model("Movie", movieSchema);

// ------------------ ROUTES ------------------

// Create a movie
app.post("/api/movies", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all movies
app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// Update a movie
app.put("/api/movies/:id", async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedMovie) return res.status(404).json({ error: "Movie not found" });
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a movie
app.delete("/api/movies/:id", async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ error: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Search movies by title
app.get("/api/movies/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const results = await Movie.find({
      title: { $regex: q, $options: "i" },
    }).limit(20);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/movies/:id/comments", async (req, res) => {
  try {
    const { name, text } = req.body;

    if (!name || !text)
      return res.status(400).json({ message: "Name and text are required" });

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const newComment = { name, text, date: new Date() };
    movie.comments.unshift(newComment);
    await movie.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/movies/:id/rate", async (req, res) => {
  try {
    const { score } = req.body; // get score from request
    if (!score || score < 1 || score > 5)
      return res.status(400).json({ error: "Invalid rating score" });

    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Movie not found" });

    movie.ratings.push({ score }); // push as object
    await movie.save();

    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add rating" });
  }
});

// Trending Routes
app.get("/api/trending", async (req, res) => {
  try {
    const trendings = await Trending.find().sort({ createdAt: -1 });
    res.json(trendings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trendings", error: err });
  }
});

app.post("/api/trending", async (req, res) => {
  try {
    const trending = new Trending(req.body);
    const saved = await trending.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Failed to add trending", error: err });
  }
});

app.delete("/api/trending/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Trending.findByIdAndDelete(id);
    res.json({ message: "Trending movie deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete trending", error: err });
  }
});

// For trending movie comments - FIXED: Changed TrendingMovie to Trending
app.post('/api/trending/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, text } = req.body;
    
    const movie = await Trending.findById(id); // CHANGED: TrendingMovie to Trending
    if (!movie) {
      return res.status(404).json({ message: 'Trending movie not found' });
    }
    
    const newComment = {
      name,
      text,
      date: new Date()
    };
    
    movie.comments.push(newComment);
    await movie.save();
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// For trending movie ratings - FIXED: Changed TrendingMovie to Trending
app.post('/api/trending/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    
    const movie = await Trending.findById(id); // CHANGED: TrendingMovie to Trending
    if (!movie) {
      return res.status(404).json({ message: 'Trending movie not found' });
    }
    
    const newRating = {
      score,
      date: new Date()
    };
    
    movie.ratings.push(newRating);
    
    // Calculate average rating
    const totalRatings = movie.ratings.length;
    const sumRatings = movie.ratings.reduce((sum, rating) => sum + rating.score, 0);
    movie.avgRating = (sumRatings / totalRatings).toFixed(1);
    
    await movie.save();
    
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));