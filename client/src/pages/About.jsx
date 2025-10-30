import React from "react";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="text-gray-300 bg-cover bg-center bg-no-repeat min-h-screen flex flex-col"
      style={{
          backgroundImage:
            "url('https://image.tmdb.org/t/p/original/8bcoRX3hQRHufLPSDREdvr3YMXx.jpg')",
        }}
    >
      <div className="bg-black/90">
          {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-24 px-6 flex-1">
          <h1 className="text-4xl font-extrabold text-red-500 mb-6 text-center">
            About Us
          </h1>

          <p className="text-lg leading-relaxed mb-8 text-center">
            <strong className="text-black">Movie Web</strong> is a global platform dedicated to bringing you 
            the most engaging movies translated into <span className="text-red-400">Kinyarwanda</span>, wherever you are in the world. 
            Whether you're in Rwanda or abroad, we make it easy to enjoy 
            <span className="italic"> Agasobanuye</span> films—free, accessible, and culturally resonant.
          </p>

          <div className="bg-gray-900/60 p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">🌍 What We Offer</h2>
            <p className="mb-4">
              A wide selection of translated movies in Kinyarwanda, including:
            </p>
            <ul className="space-y-2 ml-6 list-disc">
              <li>🎥 Action & Adventure</li>
              <li>❤️ Romance & Drama</li>
              <li>🤖 Cartoons & Animation</li>
              <li>📺 Series & Indian Cinema</li>
              <li>🎭 Comedy, Mystery, and more</li>
            </ul>
            <p className="mt-4">
              Every movie includes a trailer preview so you can watch a short summary before deciding to stream the full film.
              Once you're ready, simply click <span className="text-red-400 font-semibold">“Watch Full Movie”</span> and enjoy.
              All full-length films are streamed via trusted third-party platforms that support public access.
            </p>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">🔐 Copyright & Content Disclaimer</h2>
            <p className="leading-relaxed mb-3">
              Movie Web does not host or store any copyrighted movies on its servers.
              All full-length films are embedded or linked from external websites that allow public streaming.
            </p>
            <p className="leading-relaxed">
              Our translated content (<span className="italic">Agasobanuye</span>) is provided for educational, cultural,
              and entertainment purposes, offering original commentary in Kinyarwanda. We respect the intellectual property rights
              of all creators and are committed to copyright compliance. 
              If you are a rights holder and have concerns about any content, please contact us directly for review and resolution.
            </p>
          </div>

          <div className="bg-gray-900/60 p-6 rounded-2xl shadow-md mb-8 text-center">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">🤝 Our Promise</h2>
            <p className="leading-relaxed">
              We welcome everyone to enjoy free, high-quality translated entertainment—
              with <span className="text-red-400 font-semibold">no subscriptions</span>, 
              <span className="text-red-400 font-semibold"> no hidden fees</span>, and 
              <span className="text-red-400 font-semibold"> no limits</span>.
            </p>
            <p className="mt-3">
              Movie Web is built for the community, by the community,
              with a passion for storytelling that connects global cinema 
              to local language and culture.
            </p>
          </div>
        </div>
      </div>
      

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;
