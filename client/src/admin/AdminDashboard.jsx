// src/admin/AdminDashboard.jsx — Season system removed, PreUpload added
import { Routes, Route } from "react-router-dom";
import Sidebar    from "./Sidebar";
import Analytics  from "./Analytics";
import Movies     from "./Movies";
import PreUpload  from "./PreUpload";
import Settings   from "./Settings";

const AdminDashboard = () => (
  <div className="flex min-h-screen bg-gray-950 text-white">
    <Sidebar />
    <main className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 md:p-8 pt-16 md:pt-8">
        <Routes>
          <Route path="/"          element={<Analytics />} />
          <Route path="/movies"    element={<Movies />}    />
          <Route path="/preupload" element={<PreUpload />} />
          <Route path="/settings"  element={<Settings />}  />
        </Routes>
      </div>
    </main>
  </div>
);

export default AdminDashboard;
