// models/Trending.js
import mongoose from "mongoose";

const trendingSchema = new mongoose.Schema({
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
      date: { type: Date, default: Date.now },
    },
  ],
  
  avgRating: Number,
  
}, {
  timestamps: true
});

export default mongoose.model("Trending", trendingSchema);