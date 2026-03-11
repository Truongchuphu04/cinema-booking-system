# 🎬 Cinema - Hệ Thống Đặt Vé Xem Phim Trực Tuyến

<div align="center">

**Cinema** là một ứng dụng web hiện đại được thiết kế để mang lại trải nghiệm đặt vé xem phim trực tuyến hoàn hảo. Với giao diện người dùng trực quan, hiệu suất cao và các tính năng thông minh, Cinema giúp người dùng dễ dàng khám phá, lựa chọn và đặt vé xem phim chỉ trong vài bước đơn giản.

🔗 **Repository**: 
🚀 **Live Demo**: 

</div>

---

## 📋 Mục Lục

- [🔥 Tính Năng Chính](#-tính-năng-chính)
- [🚀 Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [📁 Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [⚙️ Yêu Cầu Hệ Thống](#️-yêu-cầu-hệ-thống)
- [🛠 Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [🔧 Cấu Hình](#-cấu-hình)
- [� Documentation](#-documentation) ⭐ **NEW**
- [�📦 Scripts Có Sẵn](#-scripts-có-sẵn)
- [🏗 Kiến Trúc Ứng Dụng](#-kiến-trúc-ứng-dụng)
- [📱 Responsive Design](#-responsive-design)
- [🧪 Testing](#-testing)
- [🚀 Triển Khai](#-triển-khai)
- [🤝 Đóng Góp](#-đóng-góp)

---

## 🔥 Tính Năng Chính

### 🎥 Quản Lý Phim
- **Danh sách phim đa dạng**: Hiển thị các bộ phim mới nhất với thông tin chi tiết
- **Phân loại thể loại**: Lọc phim theo thể loại (Hành động, Tình cảm, Kinh dị, ...)
- **Tìm kiếm thông minh**: Tìm kiếm phim theo tên, diễn viên, đạo diễn
- **Đánh giá và nhận xét**: Xem đánh giá từ người dùng khác

### 🎟️ Hệ Thống Đặt Vé
- **Chọn suất chiếu**: Lựa chọn thời gian và ngày chiếu phù hợp
- **Sơ đồ ghế tương tác**: Giao diện trực quan để chọn ghế ngồi
- **Thanh toán an toàn**: Tích hợp nhiều phương thức thanh toán
- **Xác nhận đặt vé**: Email và SMS xác nhận tự động

### ❤️ Tính Năng Cá Nhân Hóa
- **Danh sách yêu thích**: Lưu trữ các bộ phim quan tâm
- **Lịch sử đặt vé**: Theo dõi các giao dịch đã thực hiện
- **Khuyến mãi cá nhân**: Nhận thông báo ưu đãi phù hợp

---

## 🚀 Công Nghệ Sử Dụng

### Frontend Core
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0"
  }
}
```

### Styling & UI
- **Tailwind CSS**: Framework CSS utility-first cho thiết kế nhanh chóng
- **Lucide React**: Thư viện icon hiện đại và nhẹ
- **Framer Motion**: Animation library cho UX mượt mà

### API Integration
- **Axios**: HTTP client cho việc gọi API
- **React Query**: Quản lý state server và caching

### Development Tools
- **Vite**: Build tool siêu nhanh với HMR
- **ESLint**: Linting tool đảm bảo code quality
- **Prettier**: Code formatter tự động

---

## 📁 Cấu Trúc Dự Án

```
Cinema/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── movie/
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   └── TrailerModal.jsx
│   │   └── booking/
│   │       ├── SeatMap.jsx
│   │       ├── ShowtimeSelector.jsx
│   │       └── PaymentForm.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Movies.jsx
│   │   ├── Booking.jsx
│   │   └── Profile.jsx
│   ├── hooks/
│   │   ├── useMovies.js
│   │   ├── useBooking.js
│   │   └── useAuth.js
│   ├── services/
│   │   ├── api.js
│   │   ├── movieService.js
│   │   └── bookingService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatters.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 📖 Documentation

📚 **Các tài liệu chi tiết đã được tạo:**

| Document | Mô Tả |
|----------|-------|
| [PROJECT_COMPLETION_SUMMARY.md](./PROJECT_COMPLETION_SUMMARY.md) | 📋 Tóm tắt toàn bộ dự án & checklist |
| [API_ENDPOINTS.md](./backend/API_ENDPOINTS.md) | 🔌 Chi tiết tất cả API endpoints |
| [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) | 🧪 Hướng dẫn test API từng bước |
| [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) | 🔗 Hướng dẫn kết nối frontend với backend |
| [BOOKING_LOGIC.md](./BOOKING_LOGIC.md) | 🎫 Chi tiết workflow đặt vé |
| [PAYMENT_QR_CODE.md](./PAYMENT_QR_CODE.md) | 💳 Hướng dẫn thanh toán & QR code |
| [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) | 👨‍💼 Hướng dẫn quản lý admin |

### 🚀 Quick Start
1. Đọc [PROJECT_COMPLETION_SUMMARY.md](./PROJECT_COMPLETION_SUMMARY.md) để hiểu overview
2. Theo dõi [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) để test API
3. Xem [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md) để integrate frontend

---

## ⚙️ Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js**: Phiên bản 16.x hoặc cao hơn
- **npm**: Phiên bản 8.x hoặc cao hơn (hoặc yarn 1.22.x)
- **Git**: Để clone và quản lý source code

### Trình Duyệt Hỗ Trợ
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🛠 Hướng Dẫn Cài Đặt

### 1. Clone Repository
```bash

cd Cinema
```

### 2. Cài Đặt Dependencies
```bash
# Sử dụng npm
npm install

# Hoặc sử dụng yarn
yarn install
```

### 3. Cấu Hình Environment Variables
```bash
cp .env.example .env.local
```

Chỉnh sửa file `.env.local`:
```env
# YouTube Data API
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# API Base URL
VITE_API_BASE_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=Cinema
VITE_APP_VERSION=1.0.0
```

### 4. Chạy Ứng Dụng
```bash
# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Mở trình duyệt và truy cập: `http://localhost:5173`

---

## 🔧 Cấu Hình

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        cinema: {
          dark: '#0a0a0a',
          red: '#dc2626',
          gold: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 📦 Scripts Có Sẵn

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext js,jsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,css,md}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

| Script | Mô Tả |
|--------|-------|
| `npm run dev` | Chạy development server với HMR |
| `npm run build` | Build ứng dụng cho production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Kiểm tra code với ESLint |
| `npm run format` | Format code với Prettier |

---

## 🏗 Kiến Trúc Ứng Dụng

### Component Architecture
```jsx
// Ví dụ về Movie Component
const MovieCard = ({ movie, onBooking, onTrailer }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={() => onTrailer(movie.trailerId)}
            className="bg-red-600 text-white px-4 py-2 rounded-full mr-2"
          >
            ▶ Trailer
          </button>
          <button 
            onClick={() => onBooking(movie.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Đặt Vé
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{movie.title}</h3>
        <p className="text-gray-600 text-sm mb-2">{movie.genre}</p>
        <p className="text-gray-800">Thời lượng: {movie.duration} phút</p>
      </div>
    </div>
  );
};
```

### State Management Pattern
```jsx
// Custom Hook cho Movie Management
const useMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      const response = await movieService.getMovies(filters);
      setMovies(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { movies, loading, error, fetchMovies };
};
```

---

## 📱 Responsive Design

Cinema được thiết kế với mobile-first approach, đảm bảo trải nghiệm tối ưu trên mọi thiết bị:

```css
/* Mobile First Approach */
.movie-grid {
  @apply grid grid-cols-1 gap-4;
}

/* Tablet */
@media (min-width: 768px) {
  .movie-grid {
    @apply grid-cols-2 gap-6;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .movie-grid {
    @apply grid-cols-3 gap-8;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .movie-grid {
    @apply grid-cols-4;
  }
}
```

---

## 🧪 Testing

### Test Strategy
```javascript
// Ví dụ Unit Test cho MovieCard component
import { render, screen, fireEvent } from '@testing-library/react';
import MovieCard from './MovieCard';

describe('MovieCard', () => {
  const mockMovie = {
    id: 1,
    title: 'Avengers: Endgame',
    genre: 'Action, Adventure',
    duration: 181,
    poster: 'poster-url'
  };

  test('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} />);
    
    expect(screen.getByText('Avengers: Endgame')).toBeInTheDocument();
    expect(screen.getByText('Action, Adventure')).toBeInTheDocument();
    expect(screen.getByText('Thời lượng: 181 phút')).toBeInTheDocument();
  });

  test('calls onBooking when booking button is clicked', () => {
    const onBooking = jest.fn();
    render(<MovieCard movie={mockMovie} onBooking={onBooking} />);
    
    fireEvent.click(screen.getByText('Đặt Vé'));
    expect(onBooking).toHaveBeenCalledWith(mockMovie.id);
  });
});
```

---

## 🚀 Triển Khai

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```


### Environment-specific Builds
```bash
# Development
npm run build:dev

# Staging
npm run build:staging

# Production
npm run build:prod
```

---

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp để làm cho Cinema trở nên tốt hơn!

### Quy Trình Đóng Góp

1. **Fork dự án**
   ```bash
   git clone https://github.com/your-username/Cinema.git
   ```

2. **Tạo feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit thay đổi**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```

4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Tạo Pull Request**

### Coding Standards
- Sử dụng ESLint và Prettier configuration có sẵn
- Viết test cho các tính năng mới
- Tuân thủ conventional commits
- Cập nhật documentation khi cần thiết

### Bug Reports
Khi báo cáo bug, vui lòng bao gồm:
- Mô tả chi tiết về bug
- Các bước tái tạo
- Expected vs actual behavior
- Screenshots (nếu có)
- Browser/device information

---


## 🙏 Lời Cảm Ơn
- [React Team](https://reactjs.org/) - Framework tuyệt vời cho frontend
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vercel](https://vercel.com/) - Platform triển khai đáng tin cậy

---

<div align="center">

**🎬 Cinema - Nơi Trải Nghiệm Điện Ảnh Bắt Đầu! 🎥**

Được phát triển với ❤️ bằng React và Tailwind CSS

[⬆ Về đầu trang](#-cinema---hệ-thống-đặt-vé-xem-phim-trực-tuyến)

</div>
