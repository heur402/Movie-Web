// src/pages/Terms.jsx
import React from "react";
import { motion } from "framer-motion";
import { 
  FileText, CheckCircle, Copyright, Scale, Shield, 
  AlertTriangle, Edit, Globe, Mail, Phone, BookOpen, Users 
} from "lucide-react";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const Terms = () => {
  const { dark } = useTheme();

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: "By accessing Movie Web.com, you agree to abide by these Terms & Conditions. If you do not agree, please do not use our services."
    },
    {
      icon: BookOpen,
      title: "Use of Content",
      content: "All content on Movie Web is provided for educational and cultural purposes only. You may not copy, distribute, or modify any material without prior permission unless allowed under Fair Use."
    },
    {
      icon: Copyright,
      title: "Intellectual Property",
      content: "All original content, branding, and visuals are the property of Movie Web unless otherwise noted. Translated content remains the property of the original creators and is used with respect and acknowledgment."
    },
    {
      icon: Scale,
      title: "Fair Use Disclaimer",
      content: "Movie Web utilizes limited excerpts of international films solely for non-commercial, educational purposes. We honor the rights of all copyright holders and welcome direct communication to address and resolve any content-related concerns."
    },
    {
      icon: Shield,
      title: "User Conduct",
      content: "As a user of our platform, you agree not to post harmful, illegal, or infringing content, violate copyright or trademark laws, or misuse our platform for unauthorized purposes.",
      list: [
        "Post harmful, illegal, or infringing content",
        "Violate copyright or trademark laws",
        "Misuse our platform for unauthorized purposes"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitation of Liability",
      content: "Movie Web is not responsible for any direct, indirect, or incidental damages resulting from the use of the site — including data loss, service interruptions, or issues related to third-party content."
    },
    {
      icon: Edit,
      title: "Modifications",
      content: "Movie Web may modify these Terms & Conditions at any time. Continued use of the site signifies your acceptance of the updated terms."
    },
    {
      icon: Globe,
      title: "Governing Law",
      content: "These Terms & Conditions are governed by the laws of Rwanda and relevant international copyright regulations."
    }
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
              dark ? 'bg-blue-600/10' : 'bg-blue-400/10'
            }`} />
          </div>

          <div className="relative max-w-5xl mx-auto pt-20 px-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                dark ? 'bg-red-600/20 text-red-400' : 'bg-red-100 text-red-600'
              }`}>
                <FileText size={16} />
                <span className="text-sm font-medium">Legal Agreement</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Terms & Conditions
              </h1>
              <p className={`text-center ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                Effective Date:{" "}
                <span className={`font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  October 1, 2026
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {/* Introduction Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mb-12 p-6 rounded-2xl border ${
              dark 
                ? 'bg-gradient-to-r from-red-600/10 to-orange-600/10 border-red-500/20'
                : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <Scale size={32} className="text-red-500 flex-shrink-0" />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Please Read Carefully
                </h3>
                <p className={`text-sm ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  These Terms & Conditions constitute a legally binding agreement between you and Movie Web.
                  By accessing or using our services, you acknowledge that you have read, understood, and agree
                  to be bound by these terms.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
                    dark 
                      ? 'bg-gray-900/50 border-gray-800 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5'
                      : 'bg-white border-gray-200 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/10'
                  }`}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ${
                        dark 
                          ? 'bg-red-600/10 text-red-400 group-hover:bg-red-600/20'
                          : 'bg-red-100 text-red-600 group-hover:bg-red-200'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                          dark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {section.title}
                        </h2>
                        <div className={`leading-relaxed space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p>{section.content}</p>
                          {section.list && (
                            <ul className="list-disc ml-6 space-y-2 mt-3">
                              {section.list.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Contact Section */}
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                dark 
                  ? 'bg-gradient-to-r from-red-600/10 to-purple-600/10 border-red-500/20'
                  : 'bg-gradient-to-r from-red-50 to-purple-50 border-red-200'
              }`}
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl ${
                    dark ? 'bg-red-600/20 text-red-400' : 'bg-red-200 text-red-600'
                  }`}>
                    <Users size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Contact Us
                    </h2>
                    <div className={`space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        If you have any questions, feedback, or copyright concerns, please contact us at:
                      </p>
                      <div className="space-y-2 pt-2">
                        <p className="flex items-center gap-3">
                          <Mail size={18} className="text-red-500" />
                          <a
                            href="mailto:byiringiro@gmail.com"
                            className="hover:text-red-500 transition-colors"
                          >
                            byiringiro@gmail.com
                          </a>
                        </p>
                        <p className="flex items-center gap-3">
                          <Phone size={18} className="text-red-500" />
                          <span>+250 796 577 776</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;