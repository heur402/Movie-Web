import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Movies from "./Movies";
import Analytics from "./Analytics";
import Trendings from "./trendings";
import Settings from "./Settings";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black">
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Analytics />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/trendings" element={<Trendings />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;