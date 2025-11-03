// src/admin/Analytics.jsx
import { trendingMovies } from "../assets/assets";

const Analytics = () => {
  const totalMovies = trendingMovies.length;
  const topRated = trendingMovies.filter((m) => parseFloat(m.rating) > 8.5);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-gray-600">Total Movies</h3>
          <p className="text-3xl font-bold">{totalMovies}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-gray-600">Top Rated Movies</h3>
          <p className="text-3xl font-bold">{topRated.length}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-gray-600">Trending Genre</h3>
          <p className="text-3xl font-bold">Sci-Fi</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;