import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback 
        error={this.state.error} 
        resetError={() => this.setState({ hasError: false, error: null, errorInfo: null })}
      />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate('/');
  };

  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-black/30 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Có lỗi xảy ra!</h1>
          <p className="text-gray-400 mb-6">
            Ứng dụng đã gặp lỗi không mong muốn. Bạn có thể thử tải lại trang hoặc quay về trang chủ.
          </p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-red-400 text-sm font-mono break-all">
                {error.toString()}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <RefreshCcw size={18} />
              Tải lại
            </button>
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              <Home size={18} />
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
