// src/admin/Movies.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, Upload, Loader, User, Video } from "lucide-react";
import AddMovie from "./component/AddMovie";

const API     = import.meta.env.VITE_API_NEW || "http://localhost:5000";
const PER_PAGE = 8;

const Movies = () => {
  const [movies,    setMovies]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm,  setEditForm]  = useState({});
  const [editPosterFile,    setEditPosterFile]    = useState(null);
  const [editPosterPreview, setEditPosterPreview] = useState("");
  const [savingEdit,  setSavingEdit]  = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);

  const fetchMovies = async () => {
    try {
      const res  = await fetch(`${API}/api/movies`);
      setMovies(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleMovieAdded = (movie) => {
    setMovies((prev) => [movie, ...prev]);
    setPage(1);
  };

  const startEdit = (movie) => {
    setEditingId(movie._id);
    setEditForm({
      title          : movie.title          || "",
      genre          : movie.genre          || "",
      year           : movie.year           || "",
      rating         : movie.rating         || "",
      description    : movie.description    || "",
      trailer        : movie.trailer        || "",
      duration       : movie.duration       || "",
      translatorName : movie.translatorName || "",
      movieLink      : movie.movieLink      || "",
      image          : movie.image          || "",
    });
    setEditPosterFile(null);
    setEditPosterPreview("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setEditPosterFile(null);
    setEditPosterPreview("");
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      let imageUrl = editForm.image;
      if (editPosterFile) {
        const fd  = new FormData();
        fd.append("image", editPosterFile);
        const up  = await fetch(`${API}/api/upload/image`, { method: "POST", body: fd });
        if (up.ok) { const { url } = await up.json(); imageUrl = url; }
      }
      const res = await fetch(`${API}/api/movies/${id}`, {
        method  : "PUT",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ ...editForm, image: imageUrl }),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setMovies((prev) => prev.map((m) => (m._id === id ? updated : m)));
      cancelEdit();
    } catch (err) { alert(err.message); }
    finally { setSavingEdit(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this movie?")) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/api/movies/${id}`, { method: "DELETE" });
      setMovies((prev) => prev.filter((m) => m._id !== id));
      if (editingId === id) cancelEdit();
    } catch { alert("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const totalPages = Math.ceil(movies.length / PER_PAGE);
  const paginated  = movies.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const ic = "bg-gray-800 border border-gray-600 text-white text-xs px-2 py-1.5 " +
             "rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 w-full";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Manage Movies</h2>

      <AddMovie onMovieAdded={handleMovieAdded} />

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl overflow-hidden mt-8">
        <div className="px-5 py-4 border-b border-gray-700/40 flex items-center justify-between">
          <h3 className="text-white font-semibold">All Movies ({movies.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Poster</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Genre</th>
                  <th className="px-4 py-3 text-left">Year</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Translator</th>
                  <th className="px-4 py-3 text-left">Views</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {paginated.map((movie) => (
                  <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                    {/* Poster */}
                    <td className="px-4 py-3">
                      {editingId === movie._id ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={editPosterPreview || editForm.image || "https://placehold.co/40x56?text=?"}
                            alt="" className="w-10 h-14 object-cover rounded"
                          />
                          <label className="cursor-pointer text-red-400 hover:text-red-300">
                            <Upload size={14} />
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => {
                                const f = e.target.files[0];
                                if (f) { setEditPosterFile(f); setEditPosterPreview(URL.createObjectURL(f)); }
                              }} />
                          </label>
                        </div>
                      ) : (
                        <img
                          src={movie.posterUrls?.[0] || movie.image || "https://placehold.co/40x56?text=?"}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded shadow"
                        />
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-4 py-3 text-white font-medium max-w-[140px]">
                      {editingId === movie._id
                        ? <input className={ic} value={editForm.title}
                            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                        : <span className="truncate block">{movie.title}</span>
                      }
                    </td>

                    {/* Genre */}
                    <td className="px-4 py-3 text-gray-300">
                      {editingId === movie._id
                        ? <input className={ic} value={editForm.genre}
                            onChange={(e) => setEditForm((p) => ({ ...p, genre: e.target.value }))} />
                        : <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{movie.genre}</span>
                      }
                    </td>

                    {/* Year */}
                    <td className="px-4 py-3 text-gray-300">
                      {editingId === movie._id
                        ? <input className={ic + " w-20"} value={editForm.year}
                            onChange={(e) => setEditForm((p) => ({ ...p, year: e.target.value }))} />
                        : movie.year
                      }
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      {editingId === movie._id
                        ? <input className={ic + " w-16"} type="number" min="0" max="10" step="0.1"
                            value={editForm.rating}
                            onChange={(e) => setEditForm((p) => ({ ...p, rating: e.target.value }))} />
                        : <span className="text-yellow-400 font-semibold">⭐ {movie.rating || "N/A"}</span>
                      }
                    </td>

                    {/* Translator */}
                    <td className="px-4 py-3 text-blue-400 text-xs max-w-[100px]">
                      {editingId === movie._id
                        ? <input className={ic} placeholder="Translator" value={editForm.translatorName}
                            onChange={(e) => setEditForm((p) => ({ ...p, translatorName: e.target.value }))} />
                        : <span className="truncate block">{movie.translatorName || "—"}</span>
                      }
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {(movie.views || 0).toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === movie._id ? (
                          <>
                            <button onClick={() => saveEdit(movie._id)} disabled={savingEdit}
                              className="p-1.5 bg-green-600/20 hover:bg-green-600/40 border
                                         border-green-500/30 text-green-400 rounded-lg transition-all
                                         disabled:opacity-50">
                              {savingEdit ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button onClick={cancelEdit}
                              className="p-1.5 bg-gray-700/50 hover:bg-gray-700 border border-gray-600
                                         text-gray-400 rounded-lg transition-all">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(movie)}
                              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border
                                         border-blue-500/30 text-blue-400 rounded-lg transition-all">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => handleDelete(movie._id)}
                              disabled={deletingId === movie._id}
                              className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border
                                         border-red-500/30 text-red-400 rounded-lg transition-all
                                         disabled:opacity-50">
                              {deletingId === movie._id
                                ? <Loader size={14} className="animate-spin" />
                                : <Trash2 size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-gray-700/40">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-300 text-sm font-medium px-3 py-1 bg-gray-800 rounded-lg">
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-40 transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;
