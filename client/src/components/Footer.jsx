// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { Film, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

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
              {t("common.app_tagline")}
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { icon: Facebook,  label: t("footer.social_facebook") },
                { icon: Instagram, label: t("footer.social_instagram") },
                { icon: Twitter,   label: t("footer.social_twitter") },
                { icon: Youtube,   label: t("footer.social_youtube") },
              ].map(({ icon: Icon, label }) => (
                <a
                  
                  href="#"
                  
                  className="w-9 h-9 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/30 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.navigation_heading")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/",          label: t("footer.home") },
                { to: "/explore",   label: t("footer.explore") },
                { to: "/favorites", label: t("footer.my_favorites") },
                { to: "/history",   label: t("footer.continue_watching") },
                { to: "/admin",     label: t("footer.admin") },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-red-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.genres_heading")}
            </h3>
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

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.company_heading")}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: "/about",   label: t("footer.about_us") },
                { to: "/privacy", label: t("footer.privacy_policy") },
                { to: "/terms",   label: t("footer.terms_conditions") },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-red-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 text-sm space-y-1">
              <p>byirngirobon01fra@gmail.com</p>
              <p>+250 796 577 776</p>
              <p>Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("footer.made_with")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
