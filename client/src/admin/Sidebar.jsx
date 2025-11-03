// src/admin/Sidebar.jsx
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6 text-red-500">MovieWatch Admin</h1>
      <nav className="flex flex-col space-y-3">
        <Link to="/admin" className="hover:text-red-400">Dashboard</Link>
        <Link to="/admin/movies" className="hover:text-red-400">Movies</Link>
        <Link to="/admin/categories" className="hover:text-red-400">Categories</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
