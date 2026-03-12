import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { useMovies } from '../contexts/MovieContext';
import BlurCircle from '../components/BlurCircle';

// Trailer YouTube IDs cho các phim
const movieTrailers = {
    'Inception': 'YoHD9XEInc0',
    'The Matrix': 'm8e-FF8MsqU',
    'Interstellar': 'zSWdZVtXT7E',
    'Dune': 'n9xhJrPXop4',
    'Joker': 'zAGVQLHvwOY',
    'The Shawshank Redemption': '6hB3S9bIaco',
};

const TrailerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { movies, loading: moviesLoading } = useMovies();
    const [movie, setMovie] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        if (!moviesLoading && movies.length > 0) {
            const selectedMovie = movies.find((m) => m._id === id);
            setMovie(selectedMovie || null);
        }
    }, [id, movies, moviesLoading]);

    const getTrailerId = () => {
        if (!movie) return null;

        // Check if movie has trailerUrl field
        if (movie.trailerUrl) {
            // Extract YouTube ID from URL
            const match = movie.trailerUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
            return match ? match[1] : null;
        }

        // Fallback to predefined trailers
        return movieTrailers[movie.title] || 'YoHD9XEInc0'; // Default Inception trailer
    };

    const playerOptions = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
        }
    };

    const onReady = (event) => {
        setPlayer(event.target);
        setIsReady(true);
        event.target.playVideo();
    };

    const onStateChange = (event) => {
        setIsPlaying(event.data === 1);
    };

    const togglePlayPause = () => {
        if (!player) return;
        isPlaying ? player.pauseVideo() : player.playVideo();
    };

    const toggleMute = () => {
        if (!player) return;
        isMuted ? player.unMute() : player.mute();
        setIsMuted(!isMuted);
    };

    const handleFullscreen = () => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            }
        }
    };

    if (moviesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Đang tải trailer...</p>
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-white text-2xl font-bold mb-4">Không tìm thấy phim</h2>
                    <button
                        onClick={() => navigate('/movies')}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    >
                        Quay lại danh sách phim
                    </button>
                </div>
            </div>
        );
    }

    const trailerId = getTrailerId();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 py-8">
            <BlurCircle top="100px" left="0" />
            <BlurCircle bottom="100px" right="0" />

            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{movie.title}</h1>
                        <p className="text-gray-400">Trailer chính thức</p>
                    </div>
                </div>

                {/* Video Player */}
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <div className="aspect-video relative">
                        {trailerId ? (
                            <YouTube
                                videoId={trailerId}
                                opts={playerOptions}
                                onReady={onReady}
                                onStateChange={onStateChange}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <p className="text-white text-lg">Không có trailer cho phim này</p>
                            </div>
                        )}

                        {/* Loading Overlay */}
                        {!isReady && trailerId && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-white text-lg">Đang tải trailer...</p>
                                </div>
                            </div>
                        )}

                        {/* Controls Overlay */}
                        {isReady && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={togglePlayPause}
                                            className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                        >
                                            {isPlaying ? (
                                                <Pause className="w-6 h-6 text-white" />
                                            ) : (
                                                <Play className="w-6 h-6 text-white" />
                                            )}
                                        </button>
                                        <button
                                            onClick={toggleMute}
                                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                        >
                                            {isMuted ? (
                                                <VolumeX className="w-5 h-5 text-white" />
                                            ) : (
                                                <Volume2 className="w-5 h-5 text-white" />
                                            )}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleFullscreen}
                                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                    >
                                        <Maximize className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Movie Info */}
                <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-3">{movie.title}</h2>
                    <p className="text-gray-400 leading-relaxed mb-4">
                        {movie.overview || 'Chưa có mô tả chi tiết cho phim này.'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate(`/movies/${movie._id}`)}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                            Đặt vé ngay
                        </button>
                        <button
                            onClick={() => navigate('/movies')}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                        >
                            Xem phim khác
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrailerPage;
