import React from "react";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div
      className="text-white bg-cover bg-center bg-no-repeat min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
      }}
    >
      <div className="bg-black/90 flex-1">
        {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-24 px-6 py-10">
          <h1 className="text-4xl font-extrabold text-red-500 mb-4 text-center">
            Terms & Conditions
          </h1>
          <p className="text-center text-gray-300 mb-10">
            <span className="font-semibold text-gray-400">
              Effective Date: October 3, 2025
            </span>
          </p>

          <div className="space-y-8 bg-gray-900/70 p-6 rounded-2xl shadow-lg">
            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing Movie Web.com, you agree to abide by these Terms
                & Conditions. If you do not agree, please do not use our
                services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                2. Use of Content
              </h2>
              <p className="leading-relaxed">
                All content on Movie Web is provided for educational and
                cultural purposes only. You may not copy, distribute, or modify
                any material without prior permission unless allowed under
                <span className="text-red-400 font-semibold"> Fair Use</span>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                3. Intellectual Property
              </h2>
              <p className="leading-relaxed">
                All original content, branding, and visuals are the property of
                Movie Web unless otherwise noted. Translated content remains
                the property of the original creators and is used with respect
                and acknowledgment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                4. Fair Use Disclaimer
              </h2>
              <p className="leading-relaxed">
                Movie Web utilizes limited excerpts of international films
                solely for non-commercial, educational purposes. We honor the
                rights of all copyright holders and welcome direct communication
                to address and resolve any content-related concerns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                5. User Conduct
              </h2>
              <p className="leading-relaxed mb-3">
                As a user of our platform, you agree not to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Post harmful, illegal, or infringing content.</li>
                <li>Violate copyright or trademark laws.</li>
                <li>Misuse our platform for unauthorized purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                6. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                Movie Web is not responsible for any direct, indirect, or
                incidental damages resulting from the use of the site — including
                data loss, service interruptions, or issues related to
                third-party content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                7. Modifications
              </h2>
              <p className="leading-relaxed">
                Movie Web may modify these Terms & Conditions at any time.
                Continued use of the site signifies your acceptance of the
                updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                8. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms & Conditions are governed by the laws of Rwanda and
                relevant international copyright regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-2">
                9. Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions, feedback, or copyright concerns,
                please contact us at:
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

export default Terms;
