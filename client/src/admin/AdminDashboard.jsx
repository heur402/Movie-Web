// src/admin/AdminDashboard.jsx
// Auth is enforced by ProtectedAdminRoute in App.jsx — this component only renders for authenticated admins.
import { Routes, Route } from "react-router-dom";
import Sidebar            from "./Sidebar";
import Analytics          from "./Analytics";
import Movies             from "./Movies";
import MoviePreview       from "./MoviePreview";
import PreUpload          from "./PreUpload";
import Settings           from "./Settings";
import AdminMovieDetail   from "./AdminMovieDetail";
import { useTheme }       from "../context/ThemeContext";

const AdminDashboard = () => {
  const { dark } = useTheme();

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      dark ? "bg-gray-950 text-white" : "bg-slate-50 text-slate-900"
    }`}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8 pt-16 md:pt-8">
          <Routes>
            <Route path="/"            element={<Analytics />}         />
            <Route path="/movies"      element={<Movies />}            />
            <Route path="/movies/:id"  element={<AdminMovieDetail />}  />
            <Route path="/preview"     element={<MoviePreview />}      />
            <Route path="/preupload"   element={<PreUpload />}         />
            <Route path="/settings"    element={<Settings />}          />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
