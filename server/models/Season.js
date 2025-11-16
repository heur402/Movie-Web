// models/Season.js
import mongoose from "mongoose";

const episodeSchema = new mongoose.Schema({
  episodeNumber: Number,
  title: String,
  description: String,
  duration: String,
  filePath: String
});

const seasonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  seasonNumber: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  description: String,
  episodes: [episodeSchema],
  filePath: String,
  fileName: String,
  fileSize: Number,
  fileType: String,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const Season = mongoose.model("Season", seasonSchema);
export default Season;