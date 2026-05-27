// src/context/AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminAuthContext = createContext(null);
const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

// ── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "mw_admin_token";

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);

/** Returns headers with Authorization bearer token attached */
export const adminHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
  ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
});

/** Fetch wrapper that automatically attaches the admin token */
export const adminFetch = (url, options = {}) => {
  const token = getAdminToken();
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

// ── Provider ──────────────────────────────────────────────────────────────────
export const AdminAuthProvider = ({ children }) => {
  const [admin,   setAdmin]   = useState(null);   // { username, role }
  const [loading, setLoading] = useState(true);   // checking stored token on mount

  // On mount: verify stored token with the server
  useEffect(() => {
    const token = getAdminToken();
    if (!token) { setLoading(false); return; }

    fetch(`${API}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setAdmin({ username: data.username, role: data.role || "admin" });
        else localStorage.removeItem(TOKEN_KEY); // token invalid — clear it
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const res  = await fetch(`${API}/api/admin/login`, {
      method  : "POST",
      headers : { "Content-Type": "application/json" },
      body    : JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin({ username: data.username, role: "admin" });
    return data;
  }, []);

  /**
   * Register a new admin account.
   * @param {string} username
   * @param {string} password
   * @param {string} [adminSecret] - Required for first-time setup (ADMIN_REGISTER_SECRET from .env)
   */
  const register = useCallback(async (username, password, adminSecret = "") => {
    const existingToken = getAdminToken();
    const res = await fetch(`${API}/api/admin/register`, {
      method  : "POST",
      headers : {
        "Content-Type"   : "application/json",
        // Send existing token if logged in (adding a second admin)
        ...(existingToken ? { Authorization: `Bearer ${existingToken}` } : {}),
        // Send setup secret for first-time registration
        ...(adminSecret ? { "x-admin-secret": adminSecret } : {}),
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin({ username: data.username, role: "admin" });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, register, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return ctx;
};
