// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Film, Facebook, Instagram, Twitter, Youtube, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-white/5 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                <Film size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-xl">
                Movie<span className="text-red-500">Web</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Stream, explore and discover your favorite movies — anytime, anywhere. Free, no subscriptions.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Twitter, label: "Twitter" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/explore", label: "Explore" },
                { to: "/favorites", label: "My Favorites" },
                { to: "/history", label: "Continue Watching" },
                { to: "/admin", label: "Admin" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-red-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Genres</h3>
            <ul className="space-y-2.5 text-sm">
              {["Action", "Drama", "Comedy", "Horror", "Romance", "Sci-Fi"].map((g) => (
                <li key={g}>
                  <Link
                    to={`/explore?genre=${encodeURIComponent(g)}`}
                    className="hover:text-red-400 transition-colors"
                  >
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/about", label: "About Us" },
                { to: "/privacy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-red-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 text-sm space-y-1">
              <p>📧 byirngiro@gmail.com</p>
              <p>📞 +250 796 577 776</p>
              <p>📍 Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} MovieWeb. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with BonheurLabs in Rwanda
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
