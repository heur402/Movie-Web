// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar        from "./components/Navbar";
import HomePage      from "./pages/HomePage";
import ExplorePage   from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";
import HistoryPage   from "./pages/HistoryPage";
import WatchPage     from "./pages/WatchPage";
import Movies        from "./components/Movies";
import MovieWatch    from "./components/MovieWatch";
import About         from "./pages/About";
import Terms         from "./pages/Terms";
import Privacy       from "./pages/Privacy";
import AdminDashboard from "./admin/AdminDashboard";

const App = () => (
  <AppProvider>
    <Router>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<HomePage />}      />
        <Route path="/explore"   element={<ExplorePage />}   />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history"   element={<HistoryPage />}   />
        <Route path="/movies"    element={<Movies />}        />

        {/* Movie detail page — trailer + info */}
        <Route path="/movie/:id" element={<MovieWatch />}    />

        {/* Full movie streaming page */}
        <Route path="/watch/:id" element={<WatchPage />}     />

        {/* Info pages */}
        <Route path="/about"   element={<About />}   />
        <Route path="/terms"   element={<Terms />}   />
        <Route path="/privacy" element={<Privacy />} />

        {/* Admin */}
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  </AppProvider>
);

export default App;
