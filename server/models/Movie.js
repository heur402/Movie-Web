import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String },
  releaseDate: { type: Date },
  posterUrl: { type: String },
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;