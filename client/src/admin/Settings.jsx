// src/admin/Settings.jsx
import { useState, useRef, useEffect } from "react";
import { Upload, Save, User, Loader, CheckCircle, AlertCircle } from "lucide-react";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API}/api/user/profile`);
        if (res.ok) {
          const user = await res.json();
          setUsername(user.username || "");
          setImagePreview(user.profileImageUrl || "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 5MB." });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setMessage({ type: "error", text: "Username is required." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      // Save username
      const profileRes = await fetch(`${API}/api/user/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!profileRes.ok) throw new Error("Failed to update username");

      // Upload image if selected
      if (imageFile) {
        const fd = new FormData();
        fd.append("profileImage", imageFile);
        const imgRes = await fetch(`${API}/api/user/profile-image`, {
          method: "POST",
          body: fd,
        });
        if (!imgRes.ok) throw new Error("Failed to upload image");
        const { profileImageUrl } = await imgRes.json();
        setImagePreview(profileImageUrl);
        setImageFile(null);
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>

      <div className="bg-gray-900/50 border border-gray-700/40 rounded-2xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-600 hover:border-red-500 cursor-pointer transition-all group"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <User size={32} className="text-gray-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload size={20} className="text-white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Change profile photo
          </button>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-400 mb-2 font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm transition-all"
          />
        </div>

        {/* Message */}
        {message.text && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}>
            {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={loading || !username.trim()}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg"
        >
          {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
