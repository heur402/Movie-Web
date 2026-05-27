// src/admin/component/AddMovie.jsx
import { useState } from "react";
import { Upload, X, Link as LinkIcon, Film, Loader, User, Video } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API    = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const GENRES = ["Action","Drama","Comedy","Horror","Romance","Sci-Fi","Adventure",
                "Thriller","Animation","Cartoon","Indian","Others"];

const AddMovie = ({ onMovieAdded }) => {
  const { dark } = useTheme();
  
  const [form, setForm] = useState({
    title: "", year: "", rating: "", genre: "",
    image: "", trailer: "", description: "",
    translatorName: "", movieLink: "",
  });
  const [posterFile,      setPosterFile]      = useState(null);
  const [posterPreview,   setPosterPreview]   = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [submitting,      setSubmitting]      = useState(false);
  const [message,         setMessage]         = useState({ type: "", text: "" });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Dynamic input classes based on theme
  const getInputClasses = () => {
    if (dark) {
      return "bg-gray-900/80 border border-gray-700/60 text-white placeholder-gray-500 " +
             "px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 " +
             "focus:border-red-500/50 transition-all text-sm w-full";
    } else {
      return "bg-white/80 border border-gray-300 text-gray-900 placeholder-gray-400 " +
             "px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 " +
             "focus:border-red-500/50 transition-all text-sm w-full";
    }
  };

  const ic = getInputClasses();

  const handlePosterFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Please upload an image file" });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB" });
      return;
    }
    
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    set("image", "");
    setMessage({ type: "", text: "" });
  };

  const uploadPoster = async () => {
    if (!posterFile) return form.image;
    setUploadingPoster(true);
    try {
      const fd = new FormData();
      fd.append("image", posterFile);
      const res = await fetch(`${API}/api/upload/image`, { method: "POST", body: fd });
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Poster upload failed");
      }
      const { url } = await res.json();
      return url;
    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload poster. Please try again.");
    } finally { 
      setUploadingPoster(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }
    if (!form.genre) {
      setMessage({ type: "error", text: "Genre is required." });
      return;
    }
    
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    
    try {
      let imageUrl = form.image;
      if (posterFile) {
        imageUrl = await uploadPoster();
      }
      
      // Validate movieLink if provided
      if (form.movieLink && !isValidUrl(form.movieLink)) {
        setMessage({ type: "error", text: "Please enter a valid URL for the movie link" });
        setSubmitting(false);
        return;
      }
      
      // Validate trailer URL if provided
      if (form.trailer && !isValidUrl(form.trailer)) {
        setMessage({ type: "error", text: "Please enter a valid URL for the trailer" });
        setSubmitting(false);
        return;
      }
      
      const movieData = {
        ...form,
        image: imageUrl || "",
        year: form.year ? parseInt(form.year) : null,
        rating: form.rating ? parseFloat(form.rating) : null,
      };
      
      const res = await fetch(`${API}/api/movies`, {
        method  : "POST",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify(movieData),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add movie");
      }
      
      const saved = await res.json();
      setMessage({ type: "success", text: `"${saved.title}" added successfully!` });
      
      // Reset form
      setForm({
        title: "", year: "", rating: "", genre: "",
        image: "", trailer: "", description: "",
        translatorName: "", movieLink: "",
      });
      setPosterFile(null);
      if (posterPreview) {
        URL.revokeObjectURL(posterPreview);
        setPosterPreview("");
      }
      onMovieAdded?.(saved);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
      
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally { 
      setSubmitting(false); 
    }
  };
  
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`border rounded-2xl p-6 shadow-2xl transition-all duration-300 ${
      dark 
        ? "bg-gradient-to-b from-gray-900 to-black border-gray-700/40"
        : "bg-gradient-to-b from-gray-50 to-white border-gray-200 shadow-gray-200"
    }`}>
      <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
        dark ? "text-red-400" : "text-red-600"
      }`}>
        <Film size={20} /> Add New Movie
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <input 
            className={ic} 
            placeholder="Title *" 
            value={form.title}
            onChange={(e) => set("title", e.target.value)} 
            required 
          />

          <select 
            className={ic} 
            value={form.genre}
            onChange={(e) => set("genre", e.target.value)} 
            required
          >
            <option value="" className={dark ? "bg-gray-900" : "bg-white"}>Select Genre *</option>
            {GENRES.map((g) => (
              <option key={g} value={g} className={dark ? "bg-gray-900" : "bg-white"}>
                {g}
              </option>
            ))}
          </select>

          <input 
            className={ic} 
            placeholder="Year (e.g. 2024)" 
            value={form.year}
            onChange={(e) => set("year", e.target.value)} 
            type="number"
            min="1900"
            max={new Date().getFullYear() + 5}
          />

          <input 
            className={ic} 
            placeholder="Rating (e.g. 8.5)" 
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)} 
            type="number"
            step="0.1"
            min="0"
            max="10"
          />

          <input 
            className={ic} 
            placeholder="Trailer URL (YouTube embed or link)" 
            value={form.trailer}
            onChange={(e) => set("trailer", e.target.value)} 
          />
        </div>

        {/* Translator */}
        <div className="relative">
          <User size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            dark ? "text-blue-400" : "text-blue-600"
          }`} />
          <input
            className={ic + " pl-9"}
            placeholder="Translator Name (optional)"
            value={form.translatorName}
            onChange={(e) => set("translatorName", e.target.value)}
          />
        </div>

        {/* Movie Link — separate from trailer */}
        <div className="space-y-1">
          <label className={`text-xs font-medium flex items-center gap-1.5 ${
            dark ? "text-gray-400" : "text-gray-600"
          }`}>
            <Video size={12} className="text-red-500" />
            Full Movie URL

          </label>
          <div className="relative">
            <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
            <input
              className={ic + " pl-9"}
              placeholder="video URL"
              value={form.movieLink}
              onChange={(e) => set("movieLink", e.target.value)}
            />
          </div>
        </div>

        {/* Description */}
        <textarea 
          className={ic} 
          placeholder="Description" 
          rows={3}
          value={form.description} 
          onChange={(e) => set("description", e.target.value)} 
        />

        {/* Poster */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            dark ? "text-gray-400" : "text-gray-700"
          }`}>
            Poster Image
          </label>
          <div className="flex gap-3 flex-wrap items-start">
            <label className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl
                              cursor-pointer transition-all text-sm font-medium ${
              dark
                ? "bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-400"
                : "bg-red-50 hover:bg-red-100 border-red-300 text-red-600"
            }`}>
              <Upload size={16} />
              {posterFile ? "Change file" : "Upload poster"}
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/jpg" 
                className="hidden" 
                onChange={handlePosterFile} 
              />
            </label>

            <div className="flex-1 min-w-48 relative">
              <LinkIcon size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                dark ? "text-gray-500" : "text-gray-400"
              }`} />
              <input
                className={ic + " pl-8"}
                placeholder="Or paste image URL"
                value={form.image}
                onChange={(e) => { 
                  set("image", e.target.value); 
                  setPosterFile(null); 
                  if (posterPreview) {
                    URL.revokeObjectURL(posterPreview);
                    setPosterPreview("");
                  }
                }}
              />
            </div>

            {(posterPreview || form.image) && (
              <div className="relative">
                <img 
                  src={posterPreview || form.image} 
                  alt="Preview"
                  className="w-16 h-24 object-cover rounded-lg border border-gray-700" 
                  onError={(e) => {
                    e.target.src = "https://placehold.co/64x96/333/666?text=Invalid+URL";
                  }}
                />
                <button 
                  type="button"
                  onClick={() => { 
                    if (posterPreview) URL.revokeObjectURL(posterPreview);
                    setPosterFile(null); 
                    setPosterPreview(""); 
                    set("image", ""); 
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full
                             flex items-center justify-center hover:bg-red-700 transition-colors"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            )}
          </div>
          <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
            Supported formats: JPG, PNG, WEBP (Max size: 5MB)
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium animate-fade-in ${
            message.type === "success"
              ? dark
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-green-50 border border-green-200 text-green-700"
              : dark
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting || uploadingPoster}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 
                     disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold 
                     px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-red-600/30
                     w-full sm:w-auto"
        >
          {(submitting || uploadingPoster) && <Loader size={16} className="animate-spin" />}
          {uploadingPoster ? "Uploading poster…" : submitting ? "Adding…" : "+ Add Movie"}
        </button>
      </form>
    </div>
  );
};

export default AddMovie;