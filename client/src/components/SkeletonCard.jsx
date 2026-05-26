// src/components/SkeletonCard.jsx
const SkeletonCard = () => (
  <div className="bg-gray-900 rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-[2/3] bg-gray-800" />
    <div className="p-3 space-y-2">
      <div className="h-3.5 bg-gray-800 rounded w-3/4" />
      <div className="h-3 bg-gray-800 rounded w-1/2" />
    </div>
  </div>
);

export default SkeletonCard;
