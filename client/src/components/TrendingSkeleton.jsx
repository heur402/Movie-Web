// src/components/TrendingSkeleton.jsx
import { useTheme } from "../context/ThemeContext";

const TrendingSkeleton = () => {
  const { dark } = useTheme();

  return (
    <div className={`relative min-h-[90vh] overflow-hidden ${dark ? "bg-black" : "bg-white"}`}>
      {/* Background skeleton */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
        {dark && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
          </>
        )}
      </div>

      {/* Content skeleton */}
      <div className="relative z-10 min-h-[90vh] flex items-center mt-10">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* LEFT - Text skeleton */}
            <div className="space-y-6">
              {/* Trend badge skeleton */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-3.5 h-3.5 bg-gray-600/50 rounded animate-pulse" />
                <div className="w-24 h-3 bg-gray-600/50 rounded animate-pulse" />
              </div>

              {/* Title skeleton */}
              <div className="space-y-3">
                <div className="h-16 bg-gray-600/50 rounded-lg w-3/4 animate-pulse" />
                <div className="h-6 bg-gray-600/50 rounded-lg w-1/4 animate-pulse" />
              </div>

              {/* Rating & stats skeleton */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-gray-600/50 rounded animate-pulse" />
                  <div className="w-12 h-4 bg-gray-600/50 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-px h-4 bg-white/20" />
                  <div className="w-3.5 h-3.5 bg-gray-600/50 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-gray-600/50 rounded animate-pulse" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-2 max-w-md">
                <div className="h-4 bg-gray-600/50 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-600/50 rounded w-11/12 animate-pulse" />
                <div className="h-4 bg-gray-600/50 rounded w-4/5 animate-pulse" />
              </div>

              {/* Action buttons skeleton */}
              <div className="flex items-center gap-3 pt-4">
                <div className="px-8 py-3 bg-gray-600/50 rounded-full w-36 h-12 animate-pulse" />
                <div className="px-8 py-3 bg-white/10 rounded-full w-32 h-12 animate-pulse" />
                <div className="p-3 rounded-full bg-white/10 w-12 h-12 animate-pulse" />
              </div>

              {/* Meta row skeleton */}
              <div className="pt-6 flex flex-wrap gap-4">
                <div className="w-20 h-3 bg-gray-600/50 rounded animate-pulse" />
                <div className="w-px h-3 bg-white/20" />
                <div className="w-32 h-3 bg-gray-600/50 rounded animate-pulse" />
                <div className="w-px h-3 bg-white/20" />
                <div className="w-16 h-3 bg-gray-600/50 rounded animate-pulse" />
              </div>
            </div>

            {/* RIGHT - Poster skeleton */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative group">
                <div className="relative w-80 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="w-full h-[450px] bg-gradient-to-br from-gray-700 to-gray-800 animate-pulse" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-gray-600/50 rounded animate-pulse" />
                        <div className="w-12 h-4 bg-gray-600/50 rounded animate-pulse" />
                      </div>
                      <div className="w-24 h-3 bg-gray-600/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide counter skeleton */}
      <div className="absolute top-8 right-8 z-20 mt-10">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5">
          <div className="w-12 h-3 bg-gray-600/50 rounded animate-pulse" />
        </div>
      </div>

      {/* Autoplay toggle skeleton */}
      <div className="absolute bottom-24 right-8 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-600/50 animate-pulse" />
      </div>
    </div>
  );
};

export default TrendingSkeleton;