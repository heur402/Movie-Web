// src/admin/Trendings.jsx — Manage trending movies with Cloudinary upload
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Trash2, Upload, X, Loader, Plus } from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const PER_PAGE = 5;

const GENRES = ["Action","Drama","Comedy","Horror","Romance","Sci-Fi","Adventure","Thriller","Animation","Indian","Others"];

const inputClass =
  "bg-gray-900/80 border border-gray-700/60 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-sm w-full";

const Trendings = () => {
  const [trendings, setTrendings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: "", year: "", rating: "", genre: "",
    image: "", trailer: "", description: "",
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    const fetchTrendings = async () => {
      try {
        const res = await fetch(`${API}/api/trending`);
        setTrendings(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendings();
  }, []);

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
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      return url;
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.genre) {
      setMessage({ type: "error", text: "Title and genre are required." });
      return;
    }
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const imageUrl = await uploadPoster();
      const res = await fetch(`${API}/api/trending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: imageUrl || form.image }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const saved = await res.json();
      setTrendings((prev) => [saved, ...prev]);
      setForm({ title: "", year: "", rating: "", genre: "", image: "", trailer: "", description: "" });
      setPosterFile(null);
      setPosterPreview("");
      setMessage({ type: "success", text: `"${saved.title}" added to trending!` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove from trending?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/api/trending/${id}`, { method: "DELETE" });
      setTrendings((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(trendings.length / PER_PAGE);
  const paginated = trendings.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Manage Trending</h2>

      {/* Add Form */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700/40 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-red-400 mb-5 flex items-center gap-2">
          <Plus size={18} /> Add Trending Movie
        </h3>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input className={inputClass} placeholder="Title *" value={form.title} onChange={(e) => set("title", e.target.value)} required />

            <select className={inputClass} value={form.genre} onChange={(e) => set("genre", e.target.value)} required>
              <option value="">Select Genre *</option>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>

            <input className={inputClass} placeholder="Year" value={form.year} onChange={(e) => set("year", e.target.value)} />
            <input className={inputClass} placeholder="Rating (e.g. 8.5)" value={form.rating} onChange={(e) => set("rating", e.target.value)} />
            <input
              className={inputClass}
              placeholder="Trailer URL (YouTube embed)"
              value={form.trailer}
              onChange={(e) => set("trailer", e.target.value)}
            />
          </div>

          <textarea
            className={inputClass}
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          {/* Poster */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Poster Image</label>
            <div className="flex gap-3 flex-wrap items-start">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-xl cursor-pointer transition-all text-sm font-medium">
                <Upload size={16} />
                {posterFile ? "Change file" : "Upload poster"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePosterFile} />
              </label>

              <input
                className={inputClass + " flex-1 min-w-48"}
                placeholder="Or paste image URL"
                value={form.image}
                onChange={(e) => { set("image", e.target.value); setPosterFile(null); setPosterPreview(""); }}
              />

              {(posterPreview || form.image) && (
                <div className="relative">
                  <img
                    src={posterPreview || form.image}
                    alt="Preview"
                    className="w-16 h-24 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => { setPosterFile(null); setPosterPreview(""); set("image", ""); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {message.text && (
            <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || uploadingPoster}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            {(submitting || uploadingPoster) && <Loader size={16} className="animate-spin" />}
            {uploadingPoster ? "Uploading..." : submitting ? "Adding..." : "+ Add Trending"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700/40">
          <h3 className="text-white font-semibold">Trending Movies ({trendings.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trendings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No trending movies yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Poster</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {paginated.map((movie) => (
                  <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <img
                        src={movie.posterUrls?.[0] || movie.image || "https://via.placeholder.com/40x56?text=?"}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded shadow"
                      />
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[160px]">
                      <span className="truncate block">{movie.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-gray-300">{movie.genre}</span>
                    </td>
                    <td className="px-4 py-3 text-yellow-400 font-semibold">⭐ {movie.rating || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-400">{movie.year}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(movie._id)}
                        disabled={deletingId === movie._id}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingId === movie._id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-gray-700/40">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-300 text-sm font-medium px-3 py-1 bg-gray-800 rounded-lg">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trendings;
