// src/admin/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Film, TrendingUp, Upload,
  Settings, Menu, X, LogOut, Film as FilmIcon
} from "lucide-react";

const menuItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/movies", label: "Movies", icon: Film },
  { path: "/admin/trendings", label: "Trending", icon: TrendingUp },
  { path: "/admin/seasonUpload", label: "Season Upload", icon: Upload },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile toggle */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-900 border border-gray-700 text-white rounded-xl shadow-xl hover:bg-gray-800 transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : undefined }}
        className={`
          w-60 bg-gray-950 border-r border-gray-800/60 flex flex-col
          fixed md:sticky top-0 h-screen z-50
          transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800/60 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
              <FilmIcon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">MovieWeb</p>
              <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-red-600/15 text-red-400 border border-red-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon size={17} className={active ? "text-red-400" : ""} />
                {label}
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-800/60">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut size={17} />
            Back to Site
          </Link>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
