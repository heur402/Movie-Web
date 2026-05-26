// src/context/AdminAuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminAuthContext = createContext(null);
const API = import.meta.env.VITE_API_NEW || "http://localhost:5000";

export const AdminAuthProvider = ({ children }) => {
  const [admin,    setAdmin]    = useState(null);   // { username }
  const [loading,  setLoading]  = useState(true);   // checking stored token on mount

  // On mount: verify stored token
  useEffect(() => {
    const token = localStorage.getItem("mw_admin_token");
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.username) setAdmin({ username: data.username }); })
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
    localStorage.setItem("mw_admin_token", data.token);
    setAdmin({ username: data.username });
    return data;
  }, []);

  const register = useCallback(async (username, password) => {
    const res  = await fetch(`${API}/api/admin/register`, {
      method  : "POST",
      headers : { "Content-Type": "application/json" },
      body    : JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    localStorage.setItem("mw_admin_token", data.token);
    setAdmin({ username: data.username });
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mw_admin_token");
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
