// src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import { 
  Globe, Shield, Heart, Film, Users, Sparkles,
  Award, Clock, Eye, TrendingUp, Coffee, Star
} from "lucide-react";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const About = () => {
  const { dark } = useTheme();

  const features = [
    {
      icon: Film,
      title: "🎬 Diverse Content",
      description: "Action, Romance, Animation, Series, Comedy, and more"
    },
    {
      icon: Globe,
      title: "🌍 Global Reach",
      description: "Available worldwide with Kinyarwanda translations"
    },
    {
      icon: Heart,
      title: "❤️ Community Driven",
      description: "Built for the community, by the community"
    },
    {
      icon: Star,
      title: "⭐ Free Access",
      description: "No subscriptions, no hidden fees, no limits"
    }
  ];

  const categories = [
    "🎥 Action & Adventure",
    "❤️ Romance & Drama",
    "🤖 Cartoons & Animation",
    "📺 Series & Indian Cinema",
    "🎭 Comedy & Mystery"
  ];

  const stats = [
    { icon: Film, value: "500+", label: "Movies Available" },
    { icon: Users, value: "50K+", label: "Active Users" },
    { icon: Clock, value: "24/7", label: "Accessibility" },
    { icon: TrendingUp, value: "100%", label: "Free Content" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      dark 
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
              dark ? 'bg-red-600/10' : 'bg-red-400/10'
            }`} />
            <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
              dark ? 'bg-purple-600/10' : 'bg-purple-400/10'
            }`} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl ${
              dark ? 'bg-blue-600/5' : 'bg-blue-400/5'
            }" />
          </div>

          <div className="relative max-w-6xl mx-auto pt-20 px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                dark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'
              }`}>
                <Sparkles size={16} />
                <span className="text-sm font-medium">Our Story</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                About MovieWeb
              </h1>
              <p className={`text-lg max-w-2xl mx-auto ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                Bridging cultures through cinema — bringing global stories to Kinyarwanda-speaking audiences worldwide
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-6 mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`text-center p-6 rounded-2xl border transition-all duration-300 ${
                    dark 
                      ? 'bg-gray-900/50 border-gray-800 hover:border-red-500/30'
                      : 'bg-white border-gray-200 hover:border-red-300 shadow-sm'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${dark ? 'text-red-400' : 'text-red-600'}`} />
                  <div className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* What We Offer */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl border p-6 md:p-8 transition-all duration-300 ${
                dark 
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${dark ? 'bg-red-600/20' : 'bg-red-100'}`}>
                  <Film className={`w-6 h-6 ${dark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  What We Offer
                </h2>
              </div>
              <p className={`mb-4 leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                MovieWeb is a global platform dedicated to bringing you the most engaging movies translated into{" "}
                <span className="text-red-500 font-semibold">Kinyarwanda</span>, wherever you are in the world.
                Whether you're in Rwanda or abroad, we make it easy to enjoy films — free, accessible, and culturally resonant.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                {categories.map((category, index) => (
                  <div key={index} className={`flex items-center gap-2 text-sm ${
                    dark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {category}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Our Promise */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-2xl border p-6 md:p-8 transition-all duration-300 ${
                dark 
                  ? 'bg-gradient-to-br from-red-600/10 to-purple-600/10 border-red-500/20'
                  : 'bg-gradient-to-br from-red-50 to-purple-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${dark ? 'bg-red-600/20' : 'bg-red-200'}`}>
                  <Heart className={`w-6 h-6 ${dark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Our Promise
                </h2>
              </div>
              <p className={`leading-relaxed mb-6 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                We welcome everyone to enjoy free, high-quality translated entertainment — with{" "}
                <span className="text-red-500 font-semibold">no subscriptions</span>,{" "}
                <span className="text-red-500 font-semibold">no hidden fees</span>, and{" "}
                <span className="text-red-500 font-semibold">no limits</span>.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-black/20">
                <Coffee size={24} className="text-red-500" />
                <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  MovieWeb is built for the community, by the community, with a passion for storytelling
                  that connects global cinema to local language and culture.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-12"
          >
            <h2 className={`text-2xl md:text-3xl font-bold text-center mb-8 ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose MovieWeb?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    className={`text-center p-6 rounded-2xl border transition-all duration-300 ${
                      dark 
                        ? 'bg-gray-900/50 border-gray-800 hover:border-red-500/30'
                        : 'bg-white border-gray-200 hover:border-red-300 shadow-sm'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      dark ? 'bg-red-600/20' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-8 h-8 ${dark ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                    <h3 className={`font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Copyright Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`rounded-2xl border p-6 md:p-8 ${
              dark 
                ? 'bg-gray-900/50 border-gray-800'
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-4">
              <Shield className={`w-8 h-8 flex-shrink-0 ${dark ? 'text-red-400' : 'text-red-600'}`} />
              <div>
                <h2 className={`text-xl font-bold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Copyright & Content Disclaimer
                </h2>
                <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  MovieWeb does not host or store any copyrighted movies on its servers. All full-length films are embedded
                  or linked from external websites that allow public streaming. Our translated content is provided for
                  educational, cultural, and entertainment purposes. We respect the intellectual property rights of all
                  creators and are committed to copyright compliance.
                </p>
                <div className={`mt-4 flex items-center gap-2 text-sm ${
                  dark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Award size={16} className="text-red-500" />
                  <span>Committed to fair use and copyright compliance</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;