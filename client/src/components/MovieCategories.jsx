import React, { useEffect, useState, useRef } from "react";
import MovieCard from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MovieCategory = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <p className="text-white p-6">Loading movies...</p>;
  if (movies.length === 0) return <p className="text-white p-6">No movies found.</p>;

  // ✅ Group movies by genre
  const groupedMovies = movies.reduce((acc, movie) => {
    const genres = movie.genre ? movie.genre.split(/[,/]/).map((g) => g.trim()) : ["Other"];
    genres.forEach((genre) => {
      if (!acc[genre]) acc[genre] = [];
      acc[genre].push(movie);
    });
    return acc;
  }, {});

  return (
    <div className="bg-gray-950/15 text-white min-h-screen px-6 py-12">
      {Object.keys(groupedMovies).map((genre) => (
        <MovieCategoryRow 
          key={genre} 
          genre={genre} 
          movies={groupedMovies[genre]} 
        />
      ))}
    </div>
  );
};

// Scroll Button Component for top position
const ScrollButton = ({ direction, visible, onClick, genre }) => {
  if (!visible) return null;

  const isLeft = direction === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;
  const ariaLabel = `Scroll ${genre} ${direction}`;

  return (
    <button
      onClick={onClick}
      className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-all duration-200 opacity-100 ml-2"
      aria-label={ariaLabel}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

// Separate component for each movie category row
const MovieCategoryRow = ({ genre, movies }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftButton(container.scrollLeft > 0);
      setShowRightButton(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons(); // Initial check
      
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-2xl font-semibold text-pink-400">{genre}</h2>
        </div>
        
        <div className="flex">
          <ScrollButton
            direction="left"
            visible={showLeftButton}
            onClick={() => scroll('left')}
            genre={genre}
          />
          <ScrollButton
            direction="right"
            visible={showRightButton}
            onClick={() => scroll('right')}
            genre={genre}
          />
        </div>
      </div>
      
      <div className="w-14 border-b-4 border-red-500 mb-8"></div>

      <div className="relative group">
        {/* Movie Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="shrink-0 w-48">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCategory;