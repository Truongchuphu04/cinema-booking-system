import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Download, Eye, EyeOff, QrCode } from 'lucide-react';

const TicketQRCode = ({ booking }) => {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef();

  // Debug: Log booking data để kiểm tra room info và customer info
  console.log('🔍 QRCode Debug - Booking data:', booking);
  console.log('🔍 QRCode Debug - Showtime data:', booking?.showtimeId);
  console.log('🔍 QRCode Debug - Theater data:', booking?.theaterId);
  console.log('🔍 QRCode Debug - Room from showtime:', booking?.showtimeId?.room);
  console.log('🔍 QRCode Debug - RoomId from showtime:', booking?.showtimeId?.roomId);
  console.log('🔍 QRCode Debug - Theater rooms:', booking?.theaterId?.rooms);
  console.log('🔍 QRCode Debug - Customer info:', booking?.customerInfo);
  console.log('🔍 QRCode Debug - User info:', booking?.userId);

  // Tìm room name từ theater rooms và showtime roomId
  const getRoomName = () => {
    console.log('🔍 Trying to get room name...');
    
    // Thử các cách khác nhau để lấy room name
    if (booking?.showtimeId?.room) {
      console.log('✅ Found room from showtimeId.room:', booking.showtimeId.room);
      return booking.showtimeId.room;
    }
    
    if (booking?.showtime?.room) {
      console.log('✅ Found room from showtime.room:', booking.showtime.room);
      return booking.showtime.room;
    }

    // Tìm trong theater rooms nếu có roomId
    if (booking?.theaterId?.rooms && booking?.showtimeId?.roomId) {
      console.log('🔍 Searching in theater rooms...', {
        roomId: booking.showtimeId.roomId,
        theaterRooms: booking.theaterId.rooms
      });
      
      const room = booking.theaterId.rooms.find(r => {
        const match = r._id === booking.showtimeId.roomId || 
                     r.id === booking.showtimeId.roomId ||
                     r._id?.toString() === booking.showtimeId.roomId?.toString();
        console.log(`Checking room ${r.name} (${r._id}):`, match);
        return match;
      });
      
      if (room) {
        console.log('✅ Found room from theater rooms:', room.name);
        return room.name;
      }
    }

    // Thử tìm trong theater rooms với nhiều cách khác nhau
    if (booking?.theaterId?.rooms && booking?.showtimeId?.roomId) {
      console.log('🔍 Advanced room search...', {
        roomId: booking.showtimeId.roomId,
        rooms: booking.theaterId.rooms
      });
      
      // Thử tìm bằng nhiều cách
      for (const room of booking.theaterId.rooms) {
        if (room._id === booking.showtimeId.roomId ||
            room.id === booking.showtimeId.roomId ||
            room._id?.toString() === booking.showtimeId.roomId?.toString() ||
            room._id?.toString() === booking.showtimeId.roomId ||
            room.name?.toLowerCase().includes('phòng') && room.name.includes(booking.showtimeId.roomId)) {
          console.log('✅ Found room by advanced search:', room.name);
          return room.name;
        }
      }
    }

    // Tìm trong tất cả theater rooms nếu có, lấy room đầu tiên
    if (booking?.theaterId?.rooms && booking.theaterId.rooms.length > 0) {
      const firstActiveRoom = booking.theaterId.rooms.find(r => r.status !== 'inactive') || booking.theaterId.rooms[0];
      console.log('⚠️ Using first available room:', firstActiveRoom.name);
      return firstActiveRoom.name;
    }

    // Fallback thông minh hơn với roomId
    if (booking?.showtimeId?.roomId) {
      // Tạo tên phòng từ roomId
      const roomIdStr = booking.showtimeId.roomId.toString();
      if (roomIdStr.length > 10) {
        // Có vẻ là ObjectId, lấy 4 ký tự cuối
        const shortId = roomIdStr.slice(-4).toUpperCase();
        console.log('⚠️ Using ObjectId fallback:', `Phòng ${shortId}`);
        return `Phòng ${shortId}`;
      } else {
        console.log('⚠️ Using roomId as number:', `Phòng ${roomIdStr}`);
        return `Phòng ${roomIdStr}`;
      }
    }

    console.log('❌ No room info found, using default');
    return 'Phòng 1';
  };

  // Lấy tên customer một cách thông minh
  const getCustomerName = () => {
    // Ưu tiên customerInfo.name
    if (booking?.customerInfo?.name && booking.customerInfo.name !== 'N/A') {
      console.log('✅ Using customerInfo.name:', booking.customerInfo.name);
      return booking.customerInfo.name;
    }
    
    // Fallback sang userId.name
    if (booking?.userId?.name && booking.userId.name !== 'N/A') {
      console.log('✅ Using userId.name:', booking.userId.name);
      return booking.userId.name;
    }
    
    // Fallback sang email nếu có
    if (booking?.customerInfo?.email) {
      const emailName = booking.customerInfo.email.split('@')[0];
      console.log('✅ Using email prefix:', emailName);
      return emailName;
    }
    
    if (booking?.userId?.email) {
      const emailName = booking.userId.email.split('@')[0];
      console.log('✅ Using userId email prefix:', emailName);
      return emailName;
    }
    
    console.log('❌ No customer name found');
    return 'Khách hàng';
  };

  // Tạo dữ liệu cho QR code với thông tin vé
  const qrData = {
    bookingCode: booking?.bookingCode || 'N/A',
    movieTitle: booking?.movieId?.title || booking?.movie?.title || 'N/A', 
    theaterName: booking?.theaterId?.name || booking?.theater?.name || 'N/A',
    room: getRoomName(),
    seats: booking?.seats?.map(seat => seat.seatNumber).join(', ') || 'N/A',
    showDate: booking?.showDate || 'N/A',
    showTime: booking?.showTime || 'N/A',
    totalAmount: booking?.totalAmount || 0,
    customerName: getCustomerName(),
    timestamp: new Date().toISOString()
  };

  const qrString = JSON.stringify(qrData);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    // Tạo canvas để download QR
    const svg = qrRef.current.querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Download canvas as image
      const link = document.createElement('a');
      link.download = `ticket-qr-${booking?.bookingCode || 'booking'}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="glass-card rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <QrCode className="w-6 h-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Mã QR Vé Điện Tử</h3>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex items-center space-x-2 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
        >
          {showQR ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showQR ? 'Ẩn QR' : 'Hiện QR'}</span>
        </button>
      </div>

      {showQR && (
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-lg flex justify-center" ref={qrRef}>
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrString}
              viewBox={`0 0 200 200`}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          {/* Ticket Information - Movie Ticket Style */}
          <div className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 rounded-xl p-6 border border-gray-600/30">
            {/* Header */}
            <div className="text-center border-b border-gray-600/30 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white mb-1">{qrData.movieTitle}</h3>
              <p className="text-cyan-400 font-mono text-lg">#{qrData.bookingCode}</p>
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">🎬 Rạp chiếu</span>
                  <span className="text-white font-medium">{qrData.theaterName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">🏠 Phòng</span>
                  <span className="text-white font-medium">{qrData.room}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">💺 Ghế ngồi</span>
                  <span className="text-cyan-400 font-bold text-lg">{qrData.seats}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">📅 Ngày chiếu</span>
                  <span className="text-white font-medium">
                    {new Date(qrData.showDate).toLocaleDateString('vi-VN', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">⏰ Giờ chiếu</span>
                  <span className="text-white font-medium">{qrData.showTime}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-600/30 pt-3">
                  <span className="text-gray-400 text-sm">💰 Tổng tiền</span>
                  <span className="text-green-400 font-bold text-xl">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(qrData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mt-4 pt-4 border-t border-gray-600/30">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">👤 Khách hàng</span>
                <span className="text-white font-medium">{qrData.customerName}</span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={downloadQRCode}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống QR Code</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <QrCode className="w-5 h-5 text-blue-400 mr-2" />
              <h4 className="text-blue-400 font-semibold">Hướng dẫn sử dụng QR Code</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-bold text-sm">1.</span>
                  <span className="text-gray-300 text-sm">Hiển thị mã QR này tại quầy check-in của rạp</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-bold text-sm">2.</span>
                  <span className="text-gray-300 text-sm">Nhân viên sẽ quét mã để xác nhận thông tin vé</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-bold text-sm">3.</span>
                  <span className="text-gray-300 text-sm">Đến rạp trước 15 phút so với giờ chiếu</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-cyan-400 font-bold text-sm">4.</span>
                  <span className="text-gray-300 text-sm">Mang theo CMND/CCCD để đối chiếu thông tin</span>
                </div>
              </div>
            </div>
            
            {/* Warning */}
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-xs font-medium">
                ⚠️ Lưu ý: Vé chỉ có hiệu lực trong ngày và giờ chiếu đã đặt. Không được hoàn trả sau khi đã check-in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketQRCode;