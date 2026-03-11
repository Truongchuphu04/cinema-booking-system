import { Star, Trash2 } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';
import { getPosterUrl, getBackdropUrl } from '../utils/imageUtils';

const MovieCard = ({ movie, viewMode = 'grid', onRemove }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/movies/${movie._id}`); // Updated to use _id from dummyShowsData
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`flex flex-col justify-between p-4 bg-gray-800 rounded-xl hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden group border border-gray-700/50 h-full ${
        viewMode === 'list' ? 'w-full' : ''
      }`}
    >
      {/* Ảnh phim */}
      <div onClick={handleCardClick} className="cursor-pointer">
        <img
          src={getBackdropUrl(movie)}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="rounded-lg aspect-[2/3] w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/placeholder-poster.svg';
          }}
        />
      </div>

      {/* Thông tin phim */}
      <div className="mt-3 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          {/* 🔹 Khi click vào tiêu đề phim => chuyển trang */}
          <h3
            onClick={handleCardClick}
            className="font-semibold text-white text-lg line-clamp-2 hover:text-red-400 transition-colors cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>
          <p className="text-sm text-gray-400">
            {new Date(movie.release_date).getFullYear()} •{' '}
            {movie.genres?.slice(0, 2).map((genre) => genre.name).join(' • ')} •{' '}
            {timeFormat(movie.runtime)}
          </p>
        </div>

        {/* Nút mua vé + đánh giá */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleCardClick}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 transition-all rounded-full font-medium text-sm text-white shadow-md hover:shadow-lg cursor-pointer transform hover:scale-105"
            aria-label={`Mua vé cho ${movie.title}`}
          >
            Mua Vé
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-300">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-medium" aria-label="Đánh giá">
              {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
          </div>
          {onRemove && (
            <button
              onClick={() => onRemove(movie._id)}
              className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              aria-label={`Xóa ${movie.title} khỏi danh sách yêu thích`}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
