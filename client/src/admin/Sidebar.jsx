// src/admin/Sidebar.jsx
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 bg-black/90 text-white border-r-3 border-gray-700">
      <div 
        className="text-2xl border-b border-gray-700 font-bold mb-6
         text-red-500 flex flex-col pt-3 pl-10 space-y-4 p-4"
      >
          <span>Admin Panel</span>
      </div>
      <div className="flex flex-col p-6 space-y-4">
        <nav className="flex flex-col space-y-3">
          <Link to="/admin" className="hover:text-red-400">Dashboard</Link>
          <Link to="/admin/movies" className="hover:text-red-400">Movies</Link>
          <Link to="/admin/trendings" className="hover:text-red-400">Trendings</Link>
          <Link to="/admin/settings" className="hover:text-red-400">Settings</Link>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-medium transition">
          Logout
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;
