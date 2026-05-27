// src/admin/PreUpload.jsx — Upload videos to Cloudinary, get shareable links
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Film, Trash2, Copy, Play, Check,
  Loader, X, HardDrive, Clock, Calendar, AlertCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { adminFetch } from "../context/AdminAuthContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const fmtBytes = (b) => {
  if (!b) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const PreUpload = () => {
  const { dark } = useTheme();
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState("");
  const [title,      setTitle]      = useState("");
  const [file,       setFile]       = useState(null);
  const [preview,    setPreview]    = useState(null);
  const [copiedId,   setCopiedId]   = useState(null);
  const [previewId,  setPreviewId]  = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fileRef = useRef(null);

  // ── Fetch existing pre-uploads ─────────────────────────────────────────────
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res  = await adminFetch(`${API}/api/preupload`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch { setError("Failed to load pre-uploads."); }
      finally { setLoading(false); }
    };
    fetchRecords();
  }, []);

  // ── File select ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ["video/mp4","video/webm","video/ogg","video/quicktime","video/x-msvideo"];
    if (!allowed.includes(f.type) && !f.name.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      setError("Please select a valid video file (MP4, WebM, MOV, AVI, MKV).");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a video file."); return; }
    setUploading(true);
    setProgress(0);
    setError("");

    // Simulate progress while waiting for Cloudinary
    const interval = setInterval(() => {
      setProgress((p) => (p >= 88 ? p : p + Math.random() * 6));
    }, 800);

    try {
      const fd = new FormData();
      fd.append("video", file);
      fd.append("title", title || file.name);

      const res = await adminFetch(`${API}/api/preupload`, { method: "POST", body: fd });
      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const record = await res.json();
      setRecords((prev) => [record, ...prev]);
      setFile(null);
      setPreview(null);
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setProgress(0), 1500);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setProgress(0);
    } finally { setUploading(false); }
  };

  // ── Copy link ──────────────────────────────────────────────────────────────
  const copyLink = (record) => {
    navigator.clipboard.writeText(record.videoUrl);
    setCopiedId(record._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Delete this pre-upload? This will also remove it from Cloudinary.")) return;
    setDeletingId(id);
    try {
      await adminFetch(`${API}/api/preupload/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r._id !== id));
      if (previewId === id) setPreviewId(null);
    } catch { alert("Delete failed."); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
          Pre-Upload Videos
        </h2>
        <p className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-600"}`}>
          Upload videos to Cloudinary first, then copy the link into Add Movie → Movie Link.
        </p>
      </div>

      {/* ── Upload form ── */}
      <div className={`border rounded-2xl p-6 shadow-2xl transition-all duration-300 ${
        dark 
          ? "bg-gradient-to-b from-gray-900 to-black border-gray-700/40"
          : "bg-gradient-to-b from-gray-50 to-white border-gray-200 shadow-gray-200"
      }`}>
        <h3 className={`text-lg font-bold mb-5 flex items-center gap-2 ${
          dark ? "text-red-400" : "text-red-600"
        }`}>
          <Upload size={18} /> Upload New Video
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title (optional)"
            className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 
                       focus:ring-purple-500/50 text-sm transition-all ${
              dark
                ? "bg-gray-900/80 border border-gray-700/60 text-white placeholder-gray-500"
                : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFileChange({ target: { files: [f] } });
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                        transition-all duration-300 ${
              file
                ? dark
                  ? "border-red-500 bg-purple-500/10"
                  : "border-red-500 bg-purple-50"
                : dark
                  ? "border-gray-600 hover:border-red-500 hover:bg-red-500/5"
                  : "border-gray-300 hover:border-red-500 hover:bg-red-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file ? (
              <div className="space-y-2">
                <Film size={36} className={`mx-auto ${dark ? "text-red-400" : "text-red-600"}`} />
                <p className={`font-semibold ${dark ? "text-purple-300" : "text-purple-700"}`}>
                  {file.name}
                </p>
                <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                  {fmtBytes(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className={`text-xs flex items-center gap-1 mx-auto transition-colors ${
                    dark ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"
                  }`}
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={36} className={`mx-auto ${dark ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  Click or drag & drop a video file
                </p>
                <p className={`text-sm ${dark ? "text-gray-500" : "text-gray-400"}`}>
                  MP4, WebM, MOV, AVI, MKV · Max 500 MB
                </p>
              </div>
            )}
          </div>

          {/* Video preview */}
          {preview && (
            <video src={preview} controls
                   className={`w-full max-h-48 rounded-xl border ${dark ? "border-gray-700" : "border-gray-200"} bg-black`} />
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={`flex items-center gap-2 ${dark ? "text-purple-300" : "text-purple-700"}`}>
                  <Loader size={14} className="animate-spin" /> Uploading to Cloudinary…
                </span>
                <span className={dark ? "text-purple-300" : "text-purple-700"}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className={`w-full rounded-full h-2 ${dark ? "bg-gray-800" : "bg-gray-200"}`}>
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm ${
              dark
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-red-50 border-red-200 text-red-600"
            }`}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className={`flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                       text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg ${
              dark
                ? "bg-red-600 hover:bg-red-500"
                : "bg-red-600 hover:bg-red-600"
            }`}
          >
            {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>

      {/* ── Cards grid ── */}
      <div>
        <h3 className={`text-lg font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
          Uploaded Videos ({records.length})
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className={`rounded-xl overflow-hidden animate-pulse ${
                dark ? "bg-gray-900" : "bg-gray-200"
              }`}>
                <div className={`aspect-video ${dark ? "bg-gray-800" : "bg-gray-300"}`} />
                <div className="p-4 space-y-2">
                  <div className={`h-4 rounded w-3/4 ${dark ? "bg-gray-800" : "bg-gray-300"}`} />
                  <div className={`h-3 rounded w-1/2 ${dark ? "bg-gray-800" : "bg-gray-300"}`} />
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className={`text-center py-16 ${dark ? "text-gray-400" : "text-gray-500"}`}>
            <Film size={40} className="mx-auto mb-3 opacity-30" />
            <p>No pre-uploaded videos yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <PreUploadCard
                key={record._id}
                record={record}
                onCopy={copyLink}
                onDelete={handleDelete}
                onPreview={() => setPreviewId(previewId === record._id ? null : record._id)}
                copied={copiedId === record._id}
                previewing={previewId === record._id}
                deleting={deletingId === record._id}
                dark={dark}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Video preview modal ── */}
      <AnimatePresence>
        {previewId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center
                       justify-center p-4"
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl ${
                dark ? "bg-gray-900" : "bg-white"
              }`}
            >
              <div className={`flex items-center justify-between px-4 py-3 border-b ${
                dark ? "border-gray-800" : "border-gray-200"
              }`}>
                <span className={`font-semibold text-sm ${dark ? "text-white" : "text-gray-900"}`}>
                  {records.find((r) => r._id === previewId)?.title || "Preview"}
                </span>
                <button onClick={() => setPreviewId(null)}
                        className={`transition-colors ${
                          dark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                        }`}>
                  <X size={18} />
                </button>
              </div>
              <video
                src={records.find((r) => r._id === previewId)?.videoUrl}
                controls
                autoPlay
                className="w-full max-h-[70vh] bg-black"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Card component with theme support ─────────────────────────────────────────
const PreUploadCard = ({ record, onCopy, onDelete, onPreview, copied, previewing, deleting, dark }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`group border rounded-xl overflow-hidden transition-all ${
      dark
        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
        : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
    }`}
  >
    {/* Thumbnail */}
    <div className={`relative aspect-video overflow-hidden ${
      dark ? "bg-gray-800" : "bg-gray-100"
    }`}>
      {record.thumbnail ? (
        <img src={record.thumbnail} alt={record.title}
             className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film size={32} className={dark ? "text-gray-600" : "text-gray-400"} />
        </div>
      )}

      {/* Status badge */}
      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${
        record.status === "ready"
          ? dark
            ? "bg-green-500/20 border border-green-500/40 text-green-400"
            : "bg-green-100 border border-green-300 text-green-700"
          : record.status === "used"
          ? dark
            ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
            : "bg-blue-100 border border-blue-300 text-blue-700"
          : dark
            ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
            : "bg-yellow-100 border border-yellow-300 text-yellow-700"
      }`}>
        {record.status}
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center gap-3">
        <button
          onClick={onPreview}
          className={`p-2.5 rounded-full transition-all ${
            previewing
              ? "bg-red-600 text-white"
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
          title="Preview"
        >
          <Play size={18} fill="white" />
        </button>
        <button
          onClick={() => onCopy(record)}
          className={`p-2.5 rounded-full transition-all ${
            copied
              ? "bg-green-600 text-white"
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
          title="Copy link"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>

    {/* Info */}
    <div className="p-3">
      <h4 className={`font-semibold text-sm truncate ${dark ? "text-white" : "text-gray-900"}`}>
        {record.title || "Untitled"}
      </h4>

      <div className={`flex items-center gap-3 mt-2 text-xs flex-wrap ${
        dark ? "text-gray-400" : "text-gray-600"
      }`}>
        {record.duration && (
          <span className="flex items-center gap-1">
            <Clock size={10} /> {record.duration}
          </span>
        )}
        {record.fileSize && (
          <span className="flex items-center gap-1">
            <HardDrive size={10} /> {fmtBytes(record.fileSize)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={10} />
          {new Date(record.uploadedAt || record.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </span>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onCopy(record)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                      text-xs font-medium transition-all border ${
            copied
              ? dark
                ? "bg-green-600/20 border-green-500/30 text-green-400"
                : "bg-green-100 border-green-300 text-green-700"
              : dark
                ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => onDelete(record._id)}
          disabled={deleting}
          className={`p-1.5 rounded-lg transition-all disabled:opacity-50 ${
            dark
              ? "bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400"
              : "bg-red-100 hover:bg-red-200 border border-red-300 text-red-600"
          }`}
        >
          {deleting ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  </motion.div>
);

export default PreUpload;