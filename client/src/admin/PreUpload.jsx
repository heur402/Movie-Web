// src/admin/PreUpload.jsx — Upload videos to Cloudinary, get shareable links
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Film, Trash2, Copy, Play, Check,
  Loader, X, HardDrive, Clock, Calendar, AlertCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const fmtBytes = (b) => {
  if (!b) return "—";
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const PreUpload = () => {
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
        const res  = await fetch(`${API}/api/preupload`);
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

      const res = await fetch(`${API}/api/preupload`, { method: "POST", body: fd });
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
      await fetch(`${API}/api/preupload/${id}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((r) => r._id !== id));
      if (previewId === id) setPreviewId(null);
    } catch { alert("Delete failed."); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Pre-Upload Videos</h2>
        <p className="text-gray-400 text-sm mt-1">
          Upload videos to Cloudinary first, then copy the link into Add Movie → Movie Link.
        </p>
      </div>

      {/* ── Upload form ── */}
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-700/40
                      rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-red-400 mb-5 flex items-center gap-2">
          <Upload size={18} /> Upload New Video
        </h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Video title (optional)"
            className="w-full bg-gray-900/80 border border-gray-700/60 text-white
                       placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none
                       focus:ring-2 focus:ring-purple-500/50 text-sm"
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
                ? "border-red-500 bg-purple-500/10"
                : "border-gray-600 hover:border-red-500 hover:bg-red-500/5"
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
                <Film size={36} className="text-red-400 mx-auto" />
                <p className="text-purple-300 font-semibold">{file.name}</p>
                <p className="text-gray-400 text-sm">{fmtBytes(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="text-red-400 hover:text-red-300 text-xs flex items-center
                             gap-1 mx-auto transition-colors"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload size={36} className="text-gray-500 mx-auto" />
                <p className="text-gray-300 font-medium">
                  Click or drag & drop a video file
                </p>
                <p className="text-gray-500 text-sm">MP4, WebM, MOV, AVI, MKV · Max 500 MB</p>
              </div>
            )}
          </div>

          {/* Video preview */}
          {preview && (
            <video src={preview} controls
                   className="w-full max-h-48 rounded-xl border border-gray-700 bg-black" />
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300 flex items-center gap-2">
                  <Loader size={14} className="animate-spin" /> Uploading to Cloudinary…
                </span>
                <span className="text-purple-300">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border
                            border-red-500/30 text-red-400 rounded-xl text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="flex items-center gap-2 bg-red-600 hover:bg-purple-500
                       disabled:opacity-50 disabled:cursor-not-allowed text-white
                       font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
          >
            {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? "Uploading…" : "Upload to Cloudinary"}
          </button>
        </form>
      </div>

      {/* ── Cards grid ── */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">
          Uploaded Videos ({records.length})
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
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
              className="w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-white font-semibold text-sm">
                  {records.find((r) => r._id === previewId)?.title || "Preview"}
                </span>
                <button onClick={() => setPreviewId(null)}
                        className="text-gray-400 hover:text-white transition-colors">
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

// ── Card component ─────────────────────────────────────────────────────────────
const PreUploadCard = ({ record, onCopy, onDelete, onPreview, copied, previewing, deleting }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden
               hover:border-gray-700 transition-all"
  >
    {/* Thumbnail */}
    <div className="relative aspect-video bg-gray-800 overflow-hidden">
      {record.thumbnail ? (
        <img src={record.thumbnail} alt={record.title}
             className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film size={32} className="text-gray-600" />
        </div>
      )}

      {/* Status badge */}
      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold ${
        record.status === "ready"
          ? "bg-green-500/20 border border-green-500/40 text-green-400"
          : record.status === "used"
          ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
          : "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
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
      <h4 className="text-white font-semibold text-sm truncate">{record.title || "Untitled"}</h4>

      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
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
              ? "bg-green-600/20 border-green-500/30 text-green-400"
              : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          onClick={() => onDelete(record._id)}
          disabled={deleting}
          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30
                     text-red-400 rounded-lg transition-all disabled:opacity-50"
        >
          {deleting ? <Loader size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>
    </div>
  </motion.div>
);

export default PreUpload;
