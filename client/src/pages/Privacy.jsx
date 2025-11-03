import React from "react";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div
      className="text-white bg-cover bg-center bg-no-repeat min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
      }}
    >
      <div className="bg-black/90 flex-1 overflow-y-auto">
        {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-24 px-6 py-10">
          <h1 className="text-4xl font-extrabold text-red-500 mb-4 text-center">
            Privacy Policy
          </h1>
          <p className="text-center text-gray-300 mb-10">
            <span className="font-semibold text-gray-400">
              Last updated: October 1, 2025
            </span>
          </p>

          <div className="space-y-8 bg-gray-900/70 p-6 rounded-2xl shadow-lg leading-relaxed text-gray-300">
            <section>
              <p>
                This Privacy Policy explains how Movie Web (“we”, “us”, or “our”)
                collects, uses, and discloses your personal information when you use
                our website (<span className="text-red-400">www.movieweb.com</span>).
                By using our Service, you agree to this Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Interpretation and Definitions
              </h2>
              <p className="mb-2">
                The following terms have specific meanings regardless of whether they
                appear in singular or plural:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Account:</strong> A unique profile created to access our Service.
                </li>
                <li>
                  <strong>Company:</strong> Refers to Movie Web.
                </li>
                <li>
                  <strong>Cookies:</strong> Small files stored on your device to improve
                  site experience.
                </li>
                <li>
                  <strong>Device:</strong> Any device such as a computer, phone, or tablet.
                </li>
                <li>
                  <strong>Personal Data:</strong> Any information that identifies an
                  individual.
                </li>
                <li>
                  <strong>Service:</strong> Refers to our Website.
                </li>
                <li>
                  <strong>Country:</strong> Rwanda.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Collecting and Using Your Personal Data
              </h2>
              <p>
                We collect limited personal data to provide and improve our services. This may
                include name, email address, IP address, and device information collected
                automatically for analytics and functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies and similar technologies to improve functionality, remember
                preferences, and analyze usage. You can disable cookies in your browser, but
                some parts of the site may not work properly.
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li><strong>Essential Cookies:</strong> Required for website functionality.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage and improve features.</li>
                <li><strong>Preference Cookies:</strong> Save language and display preferences.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Use of Your Personal Data
              </h2>
              <p>We may use your data to:</p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>Provide and maintain our Service.</li>
                <li>Manage your account or user preferences.</li>
                <li>Communicate about updates, offers, or security issues.</li>
                <li>Improve our website, services, and user experience.</li>
                <li>Comply with legal obligations and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Data Retention and Deletion
              </h2>
              <p>
                We retain your personal data only as long as necessary for the purposes outlined
                in this policy or as required by law. You may request deletion or correction of
                your data at any time by contacting us at{" "}
                <span className="text-red-400">byiringiro@gmail.com</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Data Transfers
              </h2>
              <p>
                Your data may be processed and stored outside of Rwanda. We take appropriate
                steps to ensure your data remains protected under this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Security of Your Personal Data
              </h2>
              <p>
                We implement industry-standard measures to protect your data. However, no
                method of transmission over the Internet is 100% secure, and we cannot guarantee
                absolute protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Children’s Privacy
              </h2>
              <p>
                Movie Web does not knowingly collect personal information from anyone under
                the age of 13. If you believe a child has provided us with personal data, please
                contact us for prompt removal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Copyright & Fair Use Disclaimer
              </h2>
              <p>
                Movie Web respects intellectual property laws. All translated content is
                non-commercial, educational, and transformative, aiming to make global stories
                accessible in Kinyarwanda.
              </p>
              <ul className="list-disc ml-6 space-y-2 mt-3">
                <li>
                  <strong>Non-commercial:</strong> We do not sell or monetize translated films.
                </li>
                <li>
                  <strong>Respectful use:</strong> Original creators retain all rights.
                </li>
                <li>
                  <strong>Educational purpose:</strong> Translations aim to increase
                  accessibility for Kinyarwanda-speaking audiences.
                </li>
              </ul>
              <p className="mt-3">
                If any copyright holder has concerns, please email us at{" "}
                <span className="text-red-400">byiringiro@gmail.com</span>, and we’ll take
                immediate action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Links to Other Websites
              </h2>
              <p>
                Our website may contain links to external sites. We are not responsible for
                their content or privacy practices. Please review each site’s own policy before
                interacting.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. Updates will be posted on this
                page with a revised “Last updated” date. Continued use of the site constitutes
                your acceptance of these changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy,
                please contact us:
              </p>
              <div className="mt-3">
                <p>
                  📧 Email:{" "}
                  <a
                    href="mailto:byiringiro@gmail.com"
                    className="text-red-400 underline"
                  >
                    byiringiro@gmail.com
                  </a>
                </p>
                <p>📞 Phone: +250 796 577 776</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Privacy;
