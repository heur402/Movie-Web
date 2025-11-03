import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Movies from "./Movies";
import Categories from "./Categories";
import Analytics from "./Analytics";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Analytics />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/categories" element={<Categories />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;