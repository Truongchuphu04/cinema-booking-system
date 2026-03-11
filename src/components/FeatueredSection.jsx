import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle';
import { useMovies } from '../contexts/MovieContext';
import MovieCard from './MovieCard';

const FeatueredSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const { movies, loading } = useMovies();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const cardWidth = 272; // Matches MovieCard width (w-64 + p-4 + margins)
      const scrollAmount = cardWidth * 4; // Scroll by 4 cards
      const newScroll = direction === 'left'
        ? current.scrollLeft - scrollAmount
        : current.scrollLeft + scrollAmount;

      current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden bg-gradient-to-b from-black to-slate-900">
      <div className="relative flex items-center justify-between pt-20">
        <BlurCircle top="0" right="-80px" />
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
          <p className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text font-bold text-xl">Phim Đang Chiếu</p>
        </div>
        <button
          onClick={() => navigate('/movies')}
          className="group flex items-center gap-2 text-sm text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer glass px-4 py-2 rounded-full border border-cyan-500/20"
        >
          Xem Tất Cả
          <ArrowRight className="group-hover:translate-x-1 transition-transform w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="relative mt-8 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      ) : movies.length === 0 ? (
        <div className="relative mt-8 flex justify-center items-center h-64">
          <p className="text-gray-400 text-lg">Không có phim nào để hiển thị</p>
        </div>
      ) : (
        <div className="relative mt-8">
          {/* Left Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 glass border border-cyan-500/30 text-cyan-400 p-3 rounded-full hover:border-cyan-500/50 hover:bg-cyan-500/10 transition z-10 shadow-lg disabled:opacity-50"
            aria-label="Cuộn trái"
            disabled={scrollRef.current?.scrollLeft <= 0}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Movie Cards Container */}
          <div
            ref={scrollRef}
            className="flex overflow-x-hidden space-x-4 snap-x snap-mandatory"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="flex-shrink-0 transform scale-[0.9] origin-top"
                style={{ width: '230px', paddingTop: '10px' }} // nhỏ hơn ~30%
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Right Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 glass border border-cyan-500/30 text-cyan-400 p-3 rounded-full hover:border-cyan-500/50 hover:bg-cyan-500/10 transition z-10 shadow-lg disabled:opacity-50"
            aria-label="Cuộn phải"
            disabled={scrollRef.current?.scrollLeft >= (movies.length - 4) * 272}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate('/movies');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="px-8 py-2 text-sm bg-red-600 hover:bg-red-700 transition-colors rounded-md font-medium text-white shadow-md hover:shadow-lg"
        >
          Show more
        </button>
      </div>
    </div>
  );
};

export default FeatueredSection;