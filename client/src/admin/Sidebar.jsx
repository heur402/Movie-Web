// src/admin/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Film, Upload, Settings,
  Menu, X, LogOut, Film as FilmIcon,
  LayoutGrid, Sun, Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const menuItems = [
  { path: "/admin",           label: "Dashboard",     icon: LayoutDashboard },
  { path: "/admin/movies",    label: "Movies",        icon: Film            },
  { path: "/admin/preview",   label: "Movie Preview", icon: LayoutGrid      },
  { path: "/admin/preupload", label: "Pre-Upload",    icon: Upload          },
  { path: "/admin/settings",  label: "Settings",      icon: Settings        },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { dark, toggle: toggleTheme } = useTheme();

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  // Theme-aware classes
  const sidebarBg    = dark ? "bg-gray-950 border-gray-800/60"  : "bg-white border-slate-200";
  const logoSubtext  = dark ? "text-gray-500"                   : "text-slate-400";
  const logoText     = dark ? "text-white"                      : "text-slate-800";
  const footerBorder = dark ? "border-gray-800/60"              : "border-slate-200";
  const backLinkCls  = dark
    ? "text-gray-400 hover:text-white hover:bg-white/5"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  const linkBase = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all";
  const linkActive = dark
    ? "bg-red-600/15 text-red-400 border border-red-500/20"
    : "bg-red-50 text-red-600 border border-red-200";
  const linkInactive = dark
    ? "text-gray-400 hover:text-white hover:bg-white/5"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  const toggleBtnCls = dark
    ? "text-gray-400 hover:text-yellow-400 hover:bg-white/5"
    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100";

  return (
    <>
      {/* Mobile toggle */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className={`md:hidden fixed top-4 left-4 z-50 p-2.5 border rounded-xl shadow-xl transition-all
            ${dark ? "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                   : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside className={`
        w-60 flex flex-col border-r
        fixed md:sticky top-0 h-screen z-50
        transition-all duration-300
        ${sidebarBg}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className={`px-5 py-5 border-b ${footerBorder} flex items-center justify-between`}>
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center
                            group-hover:bg-red-500 transition-colors">
              <FilmIcon size={16} className="text-white" />
            </div>
            <div>
              <p className={`font-bold text-sm leading-none ${logoText}`}>MovieWeb</p>
              <p className={`text-xs mt-0.5 ${logoSubtext}`}>Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className={`md:hidden transition-colors p-1 ${dark ? "text-gray-400 hover:text-white" : "text-slate-400 hover:text-slate-700"}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path}
                className={`${linkBase} ${active ? linkActive : linkInactive}`}>
                <Icon size={17} className={active ? (dark ? "text-red-400" : "text-red-600") : ""} />
                {label}
                {active && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${dark ? "bg-red-500" : "bg-red-600"}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-3 py-4 border-t ${footerBorder} space-y-1`}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={`${linkBase} w-full ${toggleBtnCls}`}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark
              ? <><Sun size={17} className="text-yellow-400" /> Light Mode</>
              : <><Moon size={17} className="text-slate-500" /> Dark Mode</>
            }
          </button>

          {/* Back to site */}
          <Link to="/"
            className={`${linkBase} ${backLinkCls}`}>
            <LogOut size={17} />
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
