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

{/*

  // server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Trending from "./models/Trending.js";
import User from "./models/User.js"; // ADD THIS
import fileUpload from 'express-fileupload';
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// ADD THIS: Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ADD THIS: Middleware to serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// ... (KEEP ALL YOUR EXISTING MOVIE AND TRENDING ROUTES HERE) ...

// ==================== ADD SINGLE USER ROUTES ====================

// Get user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      // Create default user if none exists
      user = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword'
      });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

// Update user profile (username only)
app.post('/api/user/profile', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Get or create the single user
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: username,
        email: 'user@movielens.com',
        password: 'defaultpassword'
      });
    } else {
      user.username = username;
    }
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

// Upload profile image
app.post('/api/user/profile-image', async (req, res) => {
  try {
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    const profileImage = req.files.profileImage;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(profileImage.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, GIF allowed.' });
    }
    
    // Validate file size (5MB max)
    if (profileImage.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    
    // Get or create user
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword'
      });
    }
    
    // Generate unique filename
    const fileExtension = path.extname(profileImage.name);
    const fileName = `profile-${user._id}-${Date.now()}${fileExtension}`;
    const filePath = path.join(__dirname, 'uploads', fileName);
    
    // Save file
    await profileImage.mv(filePath);
    
    // Update user profile with image URL
    const imageUrl = `/uploads/${fileName}`;
    user.profileImage = fileName;
    user.profileImageUrl = imageUrl;
    await user.save();
    
    res.json({
      message: 'Profile image updated successfully',
      user: {
        id: user._id,
        username: user.username,
        profileImageUrl: user.profileImageUrl
      },
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

// Update user preferences
app.put('/api/user/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword',
        preferences
      });
    } else {
      user.preferences = preferences;
    }
    
    await user.save();
    
    res.json({
      message: 'Preferences updated successfully',
      user: {
        id: user._id,
        username: user.username,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  }
});

// Add to favorites
app.post('/api/user/favorites/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword',
        favorites: [movieId]
      });
    } else {
      if (user.favorites.includes(movieId)) {
        return res.status(400).json({ message: 'Movie already in favorites' });
      }
      user.favorites.push(movieId);
    }
    
    await user.save();
    
    res.json({
      message: 'Added to favorites',
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to favorites', error: error.message });
  }
});

// Remove from favorites
app.delete('/api/user/favorites/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    let user = await User.findOne();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.favorites = user.favorites.filter(fav => fav.toString() !== movieId);
    await user.save();
    
    res.json({
      message: 'Removed from favorites',
      favorites: user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from favorites', error: error.message });
  }
});

// Get user favorites
app.get('/api/user/favorites', async (req, res) => {
  try {
    let user = await User.findOne().populate('favorites');
    if (!user) {
      user = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword',
        favorites: []
      });
      await user.save();
      return res.json([]);
    }
    
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
});

// Initialize default user (run once on server start)
const initializeDefaultUser = async () => {
  try {
    const existingUser = await User.findOne();
    if (!existingUser) {
      const defaultUser = new User({
        username: 'MovieLover',
        email: 'user@movielens.com',
        password: 'defaultpassword'
      });
      await defaultUser.save();
      console.log('Default user created successfully');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
};

// Call this when server starts
initializeDefaultUser();

app.listen(5000, () => console.log("Server running on port 5000"));

*/}