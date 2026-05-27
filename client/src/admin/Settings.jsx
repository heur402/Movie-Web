// src/admin/Settings.jsx — Edit admin account (username + password)
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, User, Loader, CheckCircle, AlertCircle,
  Lock, Eye, EyeOff, ShieldCheck, KeyRound,
} from "lucide-react";
import { useAdminAuth, adminFetch } from "../context/AdminAuthContext";
import { useTheme } from "../context/ThemeContext";

const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

// ── Reusable input ────────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-600">{hint}</p>}
  </div>
);

const Settings = () => {
  const { admin, login, logout } = useAdminAuth();
  const { dark } = useTheme();

  // ── Username section ──────────────────────────────────────────────────────
  const [username,     setUsername]     = useState("");
  const [savingUser,   setSavingUser]   = useState(false);
  const [userMsg,      setUserMsg]      = useState(null); // { type, text }

  // ── Password section ──────────────────────────────────────────────────────
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [savingPw,     setSavingPw]     = useState(false);
  const [pwMsg,        setPwMsg]        = useState(null);

  // ── Load current admin profile ────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await adminFetch(`${API}/api/admin/profile`);
        const data = await res.json();
        if (res.ok) setUsername(data.username || "");
      } catch { /* silent */ }
    };
    load();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const ic = `w-full px-4 py-3 rounded-xl text-sm border transition-all
    focus:outline-none focus:ring-2 focus:ring-red-500/40
    ${dark
      ? "bg-gray-900/80 border-gray-700/60 text-white placeholder-gray-600"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"}`;

  const flash = (setter, type, text, ms = 4000) => {
    setter({ type, text });
    setTimeout(() => setter(null), ms);
  };

  // ── Save username ─────────────────────────────────────────────────────────
  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) return flash(setUserMsg, "error", "Username cannot be empty.");
    if (username.trim() === admin?.username) return flash(setUserMsg, "error", "That's already your username.");
    if (username.trim().length < 3) return flash(setUserMsg, "error", "Username must be at least 3 characters.");

    setSavingUser(true);
    try {
      const res  = await adminFetch(`${API}/api/admin/profile`, {
        method  : "PUT",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update username");

      // Server issues a fresh token with the new username — store it
      if (data.token) localStorage.setItem("mw_admin_token", data.token);
      flash(setUserMsg, "success", "Username updated. You may need to sign in again.");
    } catch (err) {
      flash(setUserMsg, "error", err.message);
    } finally {
      setSavingUser(false);
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!currentPw)       return flash(setPwMsg, "error", "Enter your current password.");
    if (!newPw)           return flash(setPwMsg, "error", "Enter a new password.");
    if (newPw.length < 8) return flash(setPwMsg, "error", "New password must be at least 8 characters.");
    if (newPw !== confirmPw) return flash(setPwMsg, "error", "Passwords do not match.");
    if (newPw === currentPw) return flash(setPwMsg, "error", "New password must differ from current.");

    setSavingPw(true);
    try {
      const res  = await adminFetch(`${API}/api/admin/profile`, {
        method  : "PUT",
        headers : { "Content-Type": "application/json" },
        body    : JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      if (data.token) localStorage.setItem("mw_admin_token", data.token);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      flash(setPwMsg, "success", "Password changed successfully.");
    } catch (err) {
      flash(setPwMsg, "error", err.message);
    } finally {
      setSavingPw(false);
    }
  };

  // ── Password strength ─────────────────────────────────────────────────────
  const strength = (() => {
    if (!newPw) return null;
    let score = 0;
    if (newPw.length >= 8)  score++;
    if (newPw.length >= 12) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[0-9]/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    if (score <= 1) return { label: "Weak",   color: "bg-red-500",    w: "w-1/4"  };
    if (score <= 2) return { label: "Fair",   color: "bg-yellow-500", w: "w-2/4"  };
    if (score <= 3) return { label: "Good",   color: "bg-blue-500",   w: "w-3/4"  };
    return              { label: "Strong", color: "bg-green-500",  w: "w-full" };
  })();

  // ── Shared card style ─────────────────────────────────────────────────────
  const card = `rounded-2xl border p-6 space-y-5 ${
    dark
      ? "bg-gray-900/50 border-gray-700/40"
      : "bg-white border-gray-200 shadow-sm"
  }`;

  return (
    <div className="max-w-lg mx-auto space-y-8">

      {/* Page header */}
      <div>
        <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
          Account Settings
        </h2>
        <p className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}>
          Manage your admin credentials
        </p>
      </div>

      {/* ── Current admin badge ── */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        dark
          ? "bg-red-600/10 border-red-500/20"
          : "bg-red-50 border-red-200"
      }`}>
        <ShieldCheck size={18} className="text-red-500 shrink-0" />
        <div>
          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
            {admin?.username || "—"}
          </p>
          <p className={`text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>
            Administrator · role: {admin?.role || "admin"}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Change Username
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-red-500" />
          <h3 className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
            Change Username
          </h3>
        </div>

        <form onSubmit={handleSaveUsername} className="space-y-4">
          <Field label="New Username" hint="Minimum 3 characters">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              className={ic}
              autoComplete="username"
              minLength={3}
              required
            />
          </Field>

          <AnimatePresence>
            {userMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                  userMsg.type === "success"
                    ? dark
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-green-50 border-green-200 text-green-700"
                    : dark
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {userMsg.type === "success"
                  ? <CheckCircle size={15} className="shrink-0" />
                  : <AlertCircle size={15} className="shrink-0" />}
                {userMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={savingUser || !username.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500
                       disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold
                       rounded-xl transition-all text-sm shadow-lg shadow-red-600/20"
          >
            {savingUser ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
            {savingUser ? "Saving…" : "Update Username"}
          </button>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — Change Password
      ══════════════════════════════════════════════════════════════════════ */}
      <div className={card}>
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} className="text-red-500" />
          <h3 className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
            Change Password
          </h3>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          {/* Current password */}
          <Field label="Current Password">
            <div className="relative">
              <KeyRound size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                dark ? "text-gray-500" : "text-gray-400"
              }`} />
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Your current password"
                className={ic + " pl-9 pr-11"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>

          {/* New password */}
          <Field label="New Password" hint="Minimum 8 characters">
            <div className="relative">
              <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                dark ? "text-gray-500" : "text-gray-400"
              }`} />
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password"
                className={ic + " pl-9 pr-11"}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength bar */}
            {strength && (
              <div className="mt-2 space-y-1">
                <div className={`w-full h-1.5 rounded-full ${dark ? "bg-gray-800" : "bg-gray-200"}`}>
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                </div>
                <p className={`text-xs ${
                  strength.label === "Weak"   ? "text-red-400"    :
                  strength.label === "Fair"   ? "text-yellow-400" :
                  strength.label === "Good"   ? "text-blue-400"   : "text-green-400"
                }`}>{strength.label} password</p>
              </div>
            )}
          </Field>

          {/* Confirm new password */}
          <Field label="Confirm New Password">
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className={ic + (confirmPw && confirmPw !== newPw
                  ? " border-red-500/60 focus:ring-red-500/40"
                  : confirmPw && confirmPw === newPw
                    ? " border-green-500/60 focus:ring-green-500/40"
                    : ""
                )}
                autoComplete="new-password"
                required
              />
              {confirmPw && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {confirmPw === newPw
                    ? <CheckCircle size={15} className="text-green-400" />
                    : <AlertCircle size={15} className="text-red-400" />}
                </span>
              )}
            </div>
          </Field>

          <AnimatePresence>
            {pwMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                  pwMsg.type === "success"
                    ? dark
                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                      : "bg-green-50 border-green-200 text-green-700"
                    : dark
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                {pwMsg.type === "success"
                  ? <CheckCircle size={15} className="shrink-0" />
                  : <AlertCircle size={15} className="shrink-0" />}
                {pwMsg.text}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500
                       disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold
                       rounded-xl transition-all text-sm shadow-lg shadow-red-600/20"
          >
            {savingPw ? <Loader size={15} className="animate-spin" /> : <Lock size={15} />}
            {savingPw ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default Settings;
