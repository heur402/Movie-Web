import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Cookie, Eye, Trash2, Globe, Users, BookOpen, Mail, Phone } from "lucide-react";
import Footer from "../components/Footer";
import { useTheme } from "../context/ThemeContext";

const Privacy = () => {
  const { dark } = useTheme();

  const sections = [
    {
      icon: Shield,
      title: "Interpretation and Definitions",
      content: (
        <>
          <p className="mb-3">The following terms have specific meanings regardless of whether they appear in singular or plural:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Account:</strong> A unique profile created to access our Service.</li>
            <li><strong>Company:</strong> Refers to Movie Web.</li>
            <li><strong>Cookies:</strong> Small files stored on your device to improve site experience.</li>
            <li><strong>Device:</strong> Any device such as a computer, phone, or tablet.</li>
            <li><strong>Personal Data:</strong> Any information that identifies an individual.</li>
            <li><strong>Service:</strong> Refers to our Website.</li>
            <li><strong>Country:</strong> Rwanda.</li>
          </ul>
        </>
      )
    },
    {
      icon: Eye,
      title: "Collecting and Using Your Personal Data",
      content: (
        <p>
          We collect limited personal data to provide and improve our services. This may
          include name, email address, IP address, and device information collected
          automatically for analytics and functionality.
        </p>
      )
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking Technologies",
      content: (
        <>
          <p className="mb-3">
            We use cookies and similar technologies to improve functionality, remember
            preferences, and analyze usage. You can disable cookies in your browser, but
            some parts of the site may not work properly.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for website functionality.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand usage and improve features.</li>
            <li><strong>Preference Cookies:</strong> Save language and display preferences.</li>
          </ul>
        </>
      )
    },
    {
      icon: Lock,
      title: "Use of Your Personal Data",
      content: (
        <>
          <p className="mb-3">We may use your data to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Provide and maintain our Service.</li>
            <li>Manage your account or user preferences.</li>
            <li>Communicate about updates, offers, or security issues.</li>
            <li>Improve our website, services, and user experience.</li>
            <li>Comply with legal obligations and prevent fraud.</li>
          </ul>
        </>
      )
    },
    {
      icon: Trash2,
      title: "Data Retention and Deletion",
      content: (
        <p>
          We retain your personal data only as long as necessary for the purposes outlined
          in this policy or as required by law. You may request deletion or correction of
          your data at any time by contacting us at{" "}
          <a href="mailto:byiringiro@gmail.com" className="text-red-500 hover:text-red-400 transition-colors">
            byiringiro@gmail.com
          </a>.
        </p>
      )
    },
    {
      icon: Globe,
      title: "Data Transfers",
      content: (
        <p>
          Your data may be processed and stored outside of Rwanda. We take appropriate
          steps to ensure your data remains protected under this Privacy Policy.
        </p>
      )
    },
    {
      icon: Shield,
      title: "Security of Your Personal Data",
      content: (
        <p>
          We implement industry-standard measures to protect your data. However, no
          method of transmission over the Internet is 100% secure, and we cannot guarantee
          absolute protection.
        </p>
      )
    },
    {
      icon: Users,
      title: "Children's Privacy",
      content: (
        <p>
          Movie Web does not knowingly collect personal information from anyone under
          the age of 13. If you believe a child has provided us with personal data, please
          contact us for prompt removal.
        </p>
      )
    },
    {
      icon: BookOpen,
      title: "Copyright & Fair Use Disclaimer",
      content: (
        <>
          <p className="mb-3">
            Movie Web respects intellectual property laws. All translated content is
            non-commercial, educational, and transformative, aiming to make global stories
            accessible in Kinyarwanda.
          </p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Non-commercial:</strong> We do not sell or monetize translated films.</li>
            <li><strong>Respectful use:</strong> Original creators retain all rights.</li>
            <li><strong>Educational purpose:</strong> Translations aim to increase accessibility for Kinyarwanda-speaking audiences.</li>
          </ul>
          <p className="mt-3">
            If any copyright holder has concerns, please email us at{" "}
            <a href="mailto:byiringiro@gmail.com" className="text-red-500 hover:text-red-400 transition-colors">
              byiringiro@gmail.com
            </a>, and we'll take immediate action.
          </p>
        </>
      )
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
      dark ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      <div className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl ${
              dark ? 'bg-red-600/10' : 'bg-red-400/10'
            }`} />
            <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl ${
              dark ? 'bg-purple-600/10' : 'bg-purple-400/10'
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
                <Shield size={16} />
                <span className="text-sm font-medium">Your Privacy Matters</span>
              </div>
              <h1 className={`text-4xl md:text-6xl font-black mb-4 tracking-tight ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Privacy Policy
              </h1>
              <p className={`text-center ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last updated:{" "}
                <span className={`font-semibold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                  October 1, 2026
                </span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mb-12 p-6 rounded-2xl border ${
              dark 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-white border-gray-200 shadow-sm'
            }`}
          >
            <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
              This Privacy Policy explains how Movie Web ("we", "us", or "our")
              collects, uses, and discloses your personal information when you use
              our website (<span className="text-red-500">www.movieweb.com</span>).
              By using our Service, you agree to this Policy.
            </p>
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
                        <div className={`leading-relaxed space-y-3 ${
                          dark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {section.content}
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
                    <Mail size={24} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Contact Us
                    </h2>
                    <div className={`space-y-3 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>
                        If you have any questions, concerns, or requests regarding this Privacy Policy,
                        please contact us:
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

            {/* Links to Other Websites Section */}
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl border p-6 md:p-8 ${
                dark 
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Links to Other Websites
              </h2>
              <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Our website may contain links to external sites. We are not responsible for
                their content or privacy practices. Please review each site's own policy before
                interacting.
              </p>
            </motion.div>

            {/* Changes Section */}
            <motion.div
              variants={itemVariants}
              className={`rounded-2xl border p-6 md:p-8 ${
                dark 
                  ? 'bg-gray-900/50 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h2 className={`text-xl md:text-2xl font-bold mb-4 ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Changes to This Privacy Policy
              </h2>
              <p className={`leading-relaxed ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                We may update this Privacy Policy periodically. Updates will be posted on this
                page with a revised "Last updated" date. Continued use of the site constitutes
                your acceptance of these changes.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Privacy;