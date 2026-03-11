import React from 'react'
import { assets } from '../assets/assets'
import { Calendar, Clock, Star, Play } from 'lucide-react'

const HeroSection = () => {
  return (
    <div className='relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 h-screen pt-20 overflow-hidden'>
        
        {/* Background Image */}
        <div className='absolute inset-0 z-0'>
          <img 
            src={assets.backgroundImage} 
            alt="Cinema Background" 
            className='w-full h-full object-cover object-center scale-105 animate-slow-zoom brightness-110'
          />
          {/* Lighter overlay layers for better visibility */}
          <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/30'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20'></div>
          <div className='absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-blue-900/20'></div>
        </div>
        
        {/* Animated background elements - brighter for better visibility */}
        <div className='absolute inset-0 z-10'>
          <div className='absolute top-20 left-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse delay-1000'></div>
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000'></div>
        </div>
        
        <div className='relative z-20 max-w-4xl'>
          
          <div className='flex items-center gap-3 mb-4 animate-slideIn'>
            <div className='w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse'></div>
            <span className='text-cyan-400 font-medium text-sm tracking-wider uppercase'>Phim Chiếu Rạp Mới Nhất</span>
          </div>
      
          <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight animate-fadeInUp drop-shadow-2xl'>
            Trải Nghiệm <br/> 
            <span className='text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text animate-shimmer bg-size-200 drop-shadow-lg'>Điện Ảnh</span> <br/>
            <span className='text-2xl md:text-3xl lg:text-4xl text-gray-200 drop-shadow-xl'>Hoàn Hảo</span>
          </h1>

          <p className='text-gray-200 text-lg md:text-xl mb-6 max-w-2xl leading-relaxed animate-fadeInUp delay-200 drop-shadow-lg'>
            Khám phá thế giới điện ảnh với những bộ phim bom tấn mới nhất, 
            công nghệ âm thanh và hình ảnh đẳng cấp quốc tế.
          </p>

          <div className='flex flex-wrap items-center gap-4 text-gray-100 text-sm md:text-base mb-8 animate-fadeInUp delay-300'>
              
              {/* Thể loại */}
              <div className='bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/40 px-4 py-2 rounded-full backdrop-blur glass drop-shadow-lg'>
                <span className='font-medium text-white'>Bom Tấn • Hành Động • Phiêu Lưu</span>
              </div>
              
              {/* Chất lượng */}
              <div className='flex items-center gap-2 glass px-3 py-2 rounded-full border border-cyan-400/30 backdrop-blur drop-shadow-md'>
                  <Calendar className='w-4 h-4 text-cyan-300' />
                  <span className='text-white font-medium'>4K Ultra HD</span>
              </div>

              {/* Âm thanh */}
              <div className='flex items-center gap-2 glass px-3 py-2 rounded-full border border-cyan-400/30 backdrop-blur drop-shadow-md'>
                  <Clock className='w-4 h-4 text-blue-300' />
                  <span className='text-white font-medium'>Dolby Atmos</span>
              </div>

              {/* Rating */}
              <div className='flex items-center gap-2 glass px-3 py-2 rounded-full border border-cyan-400/30 backdrop-blur drop-shadow-md'>
                  <Star className='w-4 h-4 text-yellow-400 fill-current' />
                  <span className='text-white font-medium'>9.2/10 IMDb</span> 
              </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-4 animate-fadeInUp delay-500'>
              
              {/* Nút đặt vé */}
              <button className='flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 neon-glow'>
                <Calendar className='w-5 h-5' />
                <span>Đặt Vé Ngay</span> 
              </button>

              {/* Nút xem trailer */}
              <button className='flex items-center gap-3 glass border border-cyan-500/30 hover:border-cyan-500/50 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:bg-cyan-500/10 group'>
                <Play className='w-5 h-5 group-hover:scale-110 transition-transform' />
                <span>Xem Trailer</span>
              </button>
          </div>

          {/* Cinema Info */}
          <div className='mt-8 p-6 glass rounded-2xl border border-cyan-400/30 animate-fadeInUp delay-700 backdrop-blur drop-shadow-xl'>
            <div className='flex flex-wrap items-center justify-between gap-4 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                <span className='text-cyan-200 font-medium'>Đang chiếu tại:</span>
                <span className='text-white font-semibold ml-2'>CGV, Lotte Cinema, Galaxy Cinema</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
                <span className='text-blue-200 font-medium'>Suất chiếu:</span>
                <span className='text-white font-semibold ml-2'>10:00 • 14:30 • 19:00 • 21:30</span>
              </div>
            </div>
          </div>

        </div>
    </div>
  )
}

export default HeroSection