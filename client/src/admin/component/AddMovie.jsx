// src/admin/component/AddMovie.jsx
import { useState } from "react";
import { Upload, X, Link as LinkIcon, Film, Loader, User, Video } from "lucide-react";

const API    = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const GENRES = ["Action","Drama","Comedy","Horror","Romance","Sci-Fi","Adventure",
                "Thriller","Animation","Indian","Others"];

const ic = "bg-gray-900/80 border border-gray-700/60 text-white placeholder-gray-500 " +
           "px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 " +
           "focus:border-red-500/50 transition-all text-sm w-full";

const AddMovie = ({ onMovieAdded }) => {
  const [form, setForm] = useState({
    title: "", year: "", rating: "", genre: "",
    image: "", trailer: "", description: "", duration: "",
    translatorName: "", movieLink: "",
  });
  const [posterFile,      setPosterFile]      = useState(null);
  const [posterPreview,   setPosterPreview]   = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [message,         setMessage]         = useState({ type: "", text: "" });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handlePosterFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    set("image", "");
  };

  const uploadPoster = async () => {
    if (!posterFile) return form.image;
    setUploadingPoster(true);
    try {
      const fd = new FormData();
      fd.append("image", posterFile);
      const res = await fetch(`${API}/api/upload/image`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Poster upload failed");
      const { url } = await res.json();
      return url;
    } finally { setUploadingPoster(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.genre) {
      setMessage({ type: "error", text: "Title and genre are required." });
      return;
    }
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const imageUrl = await uploadPoster();
      const res = await fetch(`${API}/api/movies`, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ ...form, image: imageUrl || form.image }),
      });
      if (!res.ok) throw new Error("Failed to add movie");
      const saved = await res.json();
      setMessage({ type: "success", text: `"${saved.title}" added successfully!` });
      setForm({
        title: "", year: "", rating: "", genre: "",
        image: "", trailer: "", description: "", duration: "",
        translatorName: "", movieLink: "",
      });
      setPosterFile(null);
      setPosterPreview("");
      onMovieAdded?.(saved);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700/40
                    rounded-2xl p-6 shadow-2xl">
      <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
        <Film size={20} /> Add New Movie
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input className={ic} placeholder="Title *" value={form.title}
            onChange={(e) => set("title", e.target.value)} required />

          <select className={ic} value={form.genre}
            onChange={(e) => set("genre", e.target.value)} required>
            <option value="">Select Genre *</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <input className={ic} placeholder="Year (e.g. 2024)" value={form.year}
            onChange={(e) => set("year", e.target.value)} />

          <input className={ic} placeholder="Rating (e.g. 8.5)" value={form.rating}
            onChange={(e) => set("rating", e.target.value)} />

          <input className={ic} placeholder="Duration (e.g. 2h 15m)" value={form.duration}
            onChange={(e) => set("duration", e.target.value)} />

          <input className={ic} placeholder="Trailer URL (YouTube embed or link)" value={form.trailer}
            onChange={(e) => set("trailer", e.target.value)} />
        </div>

        {/* Translator */}
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
          <input
            className={ic + " pl-9"}
            placeholder="Translator Name (optional)"
            value={form.translatorName}
            onChange={(e) => set("translatorName", e.target.value)}
          />
        </div>

        {/* Movie Link — separate from trailer */}
        <div className="space-y-1">
          <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <Video size={12} className="text-purple-400" />
            Full Movie URL
            <span className="text-gray-600">— Cloudinary, pre-upload link, or direct video URL (separate from trailer)</span>
          </label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              className={ic + " pl-9"}
              placeholder="https://res.cloudinary.com/... or direct .mp4 URL"
              value={form.movieLink}
              onChange={(e) => set("movieLink", e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <textarea className={ic} placeholder="Description" rows={3}
          value={form.description} onChange={(e) => set("description", e.target.value)} />

        {/* Poster */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Poster Image</label>
          <div className="flex gap-3 flex-wrap items-start">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20
                              hover:bg-red-600/30 border border-red-500/30 text-red-400
                              rounded-xl cursor-pointer transition-all text-sm font-medium">
              <Upload size={16} />
              {posterFile ? "Change file" : "Upload poster"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePosterFile} />
            </label>

            <div className="flex-1 min-w-48 relative">
              <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                className={ic + " pl-8"}
                placeholder="Or paste image URL"
                value={form.image}
                onChange={(e) => { set("image", e.target.value); setPosterFile(null); setPosterPreview(""); }}
              />
            </div>

            {(posterPreview || form.image) && (
              <div className="relative">
                <img src={posterPreview || form.image} alt="Preview"
                     className="w-16 h-24 object-cover rounded-lg border border-gray-700" />
                <button type="button"
                  onClick={() => { setPosterFile(null); setPosterPreview(""); set("image", ""); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full
                             flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={submitting || uploadingPoster}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                     disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl
                     transition-all shadow-lg hover:shadow-red-600/30">
          {(submitting || uploadingPoster) && <Loader size={16} className="animate-spin" />}
          {uploadingPoster ? "Uploading poster…" : submitting ? "Adding…" : "+ Add Movie"}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;
