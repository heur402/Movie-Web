// src/admin/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Ellipsis, Menu, MenuIcon, X } from 'lucide-react';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Function to check if link is active
  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/movies", label: "Movies" },
    { path: "/admin/trendings", label: "Trendings" },
    { path: "/admin/SeasonUpload", label: "Season Upload" },
    { path: "/admin/settings", label: "Settings" }
  ];

  // Function to handle link click
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      
      {!isMobileMenuOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-gray-900 text-white p-3 rounded-lg shadow-lg 
            transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-black"
            aria-label="Toggle menu"
          >
            <Menu color="red"/>
          </button>
        </div>
      )}

      
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      
      <div className={`
        w-64 bg-linear-to-b from-black/95 to-gray-900/95 text-white 
        border-r border-gray-700/50 fixed md:sticky top-0 h-screen z-40
        transform transition-all duration-300 ease-in-out
        flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        md:shadow-none
        backdrop-blur-lg
        overflow-y-auto
      `}>
        
        
        <div className="border-b border-gray-700/50 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-linear-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <span className="text-xs text-gray-400 mt-1">Management Console</span>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-gray-700/50 rounded-lg"
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>
        </div>

        
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  group relative overflow-hidden
                  ${isActiveLink(item.path) 
                    ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500 shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                
                <div className={`
                  absolute inset-0 bg-linear-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  ${isActiveLink(item.path) ? 'opacity-100' : ''}
                `} />
                
                <span className="text-lg">{item.icon}</span>
                <span className="relative z-10 font-semibold">{item.label}</span>
                
                
                {isActiveLink(item.path) && (
                  <div className="absolute right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        
        <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <button 
            onClick={() => {
              
              setIsMobileMenuOpen(false);
            }}
            className="
              w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
              text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 
              transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-600/25
              border border-red-500/20 hover:border-red-500/40
              flex items-center justify-center space-x-2
            "
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;