// src/admin/AdminLogin.jsx — Login + Register page for admin
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Eye, EyeOff, Loader, AlertCircle, UserPlus, LogIn } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useTheme }     from "../context/ThemeContext";

const AdminLoginCopy = () => {
  const [mode,     setMode]     = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const { login, register } = useAdminAuth();
  const { dark, toggle }    = useTheme();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (mode === "register") {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirm) { setError("Passwords do not match."); return; }
    }

    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else                  await register(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ic = `w-full px-4 py-3 rounded-xl text-sm border transition-all focus:outline-none
    focus:ring-2 focus:ring-red-500/50 ${
    dark
      ? "bg-white/5 border-white/10 text-white placeholder-gray-500"
      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm"
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
      dark ? "bg-gray-950" : "bg-slate-50"
    }`}>
      {/* Theme toggle */}
      <button onClick={toggle}
        className={`fixed top-4 right-4 p-2.5 rounded-xl border transition-all ${
          dark
            ? "bg-white/5 border-white/10 text-gray-300 hover:text-yellow-400"
            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm"
        }`}>
        {dark ? "☀️" : "🌙"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
          dark ? "bg-gray-900 border border-white/10" : "bg-white border border-slate-200"
        }`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Film size={28} className="text-white" />
          </div>
          <h1 className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>
            MovieWeb Admin
          </h1>
          <p className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-slate-500"}`}>
            {mode === "login" ? "Sign in to your admin account" : "Create a new admin account"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`flex mx-8 mb-6 rounded-xl p-1 ${dark ? "bg-white/5" : "bg-slate-100"}`}>
          {["login", "register"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                mode === m
                  ? "bg-red-600 text-white shadow-md"
                  : dark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
              dark ? "text-gray-400" : "text-slate-500"
            }`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className={ic}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
              dark ? "text-gray-400" : "text-slate-500"
            }`}>Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={ic + " pr-11"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  dark ? "text-gray-500 hover:text-gray-300" : "text-slate-400 hover:text-slate-600"
                }`}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mode === "register" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${
                  dark ? "text-gray-400" : "text-slate-500"
                }`}>Confirm Password</label>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className={ic}
                  autoComplete="new-password"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30
                           text-red-400 rounded-xl text-sm"
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500
                       disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl
                       transition-all shadow-lg shadow-red-600/30 mt-2">
            {loading
              ? <Loader size={18} className="animate-spin" />
              : mode === "login"
              ? <><LogIn size={18} /> Sign In</>
              : <><UserPlus size={18} /> Create Account</>
            }
          </button>

          {/* Back to site */}
          <p className={`text-center text-xs mt-2 ${dark ? "text-gray-500" : "text-slate-400"}`}>
            <a href="/" className="hover:text-red-400 transition-colors">← Back to MovieWeb</a>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLoginCopy;
