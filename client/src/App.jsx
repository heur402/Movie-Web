import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import HomePage from "./pages/HomePage";


const Home = () => (
  <div className="text-white p-8">
    <h1 className="text-3xl font-bold mb-4 text-red-500">Welcome to MovieWeb</h1>
    <p className="text-gray-300">Explore trending movies and more!</p>
  </div>
);

const App = () => {
  return (
    <Router>
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
