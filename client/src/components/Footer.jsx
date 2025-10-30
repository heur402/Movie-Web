import React from "react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-black/90 text-gray-300 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">🎬 MovieWeb</h2>
          <p className="text-sm text-gray-400">
            Stream, explore and discover your favorite movies — anytime,
            anywhere.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <div className="w-12 border-b-4 border-red-500 mb-2"></div>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-red-500 transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-500 transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-500 transition">
                Terms & Condition
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-white">Contact</h3>
          <div className="w-14 border-b-4 border-red-500 mb-2"></div>
          <ul className="space-y-2 text-sm">
            <li>Email: byirngiro@gmail.com</li>
            <li>Phone: +250 796 577 776</li>
            <li>Location: Kigali, Rwanda</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white">Follow Us</h3>
          <div className="w-14 border-b-4 border-red-500 mb-2"></div>
          <div className="flex space-x-4">
            <a
              href="#"
              className="hover:text-red-500 transition"
              aria-label="Facebook"
            >
              <Facebook />
            </a>
            <a
              href="#"
              className="hover:text-red-500 transition"
              aria-label="Instagram"
            >
              <Instagram />
            </a>
            <a
              href="#"
              className="hover:text-red-500 transition"
              aria-label="Twitter"
            >
              <Twitter />
            </a>
            <a
              href="#"
              className="hover:text-red-500 transition"
              aria-label="YouTube"
            >
              <Youtube />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-10 pt-4 text-center text-sm text-gray-500">
       copyright © {new Date().getFullYear()} MovieWeb. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
