// src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-red-500 mb-3 text-center">About Us</h1>
          <p className="text-gray-400 text-center mb-12">Learn more about MovieWeb and our mission</p>

          <div className="space-y-6">
            <Section title="🌍 What We Offer">
              <p className="text-gray-300 leading-relaxed mb-4">
                MovieWeb is a global platform dedicated to bringing you the most engaging movies translated into{" "}
                <span className="text-red-400 font-semibold">Kinyarwanda</span>, wherever you are in the world.
                Whether you're in Rwanda or abroad, we make it easy to enjoy films — free, accessible, and culturally resonant.
              </p>
              <ul className="space-y-2 text-gray-300">
                {["🎥 Action & Adventure", "❤️ Romance & Drama", "🤖 Cartoons & Animation", "📺 Series & Indian Cinema", "🎭 Comedy, Mystery, and more"].map((item) => (
                  <li key={item} className="flex items-center gap-2">{item}</li>
                ))}
              </ul>
            </Section>

            <Section title="🔐 Copyright & Content Disclaimer">
              <p className="text-gray-300 leading-relaxed">
                MovieWeb does not host or store any copyrighted movies on its servers. All full-length films are embedded
                or linked from external websites that allow public streaming. Our translated content is provided for
                educational, cultural, and entertainment purposes. We respect the intellectual property rights of all
                creators and are committed to copyright compliance.
              </p>
            </Section>

            <Section title="🤝 Our Promise">
              <p className="text-gray-300 leading-relaxed">
                We welcome everyone to enjoy free, high-quality translated entertainment — with{" "}
                <span className="text-red-400 font-semibold">no subscriptions</span>,{" "}
                <span className="text-red-400 font-semibold">no hidden fees</span>, and{" "}
                <span className="text-red-400 font-semibold">no limits</span>. MovieWeb is built for the community,
                by the community, with a passion for storytelling that connects global cinema to local language and culture.
              </p>
            </Section>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
    <h2 className="text-xl font-bold text-red-400 mb-4">{title}</h2>
    {children}
  </div>
);

export default About;
