const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { 
      showtimeId, 
      seats, 
      paymentMethod, 
      customerInfo 
    } = req.body;
    
    const userId = req.user._id;

    console.log('📝 Creating booking with data:', req.body);
    console.log('👤 User data:', req.user);
    console.log('📋 CustomerInfo received:', customerInfo);

    // Validate required fields
    if (!showtimeId || !seats || seats.length === 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin đặt vé'
      });
    }

    // Get showtime info
    const showtime = await Showtime.findById(showtimeId)
      .populate('movieId', 'title duration poster')
      .populate('theaterId', 'name location');
    
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy suất chiếu'
      });
    }

    // Check if seats are available
    const existingBookings = await Booking.find({
      showtimeId,
      bookingStatus: { $ne: 'cancelled' },
      'seats.seatNumber': { $in: seats.map(seat => seat.seatNumber) }
    });

    if (existingBookings.length > 0) {
      const bookedSeats = existingBookings.flatMap(booking => 
        booking.seats.map(seat => seat.seatNumber)
      );
      return res.status(400).json({
        success: false,
        message: 'Một số ghế đã được đặt',
        bookedSeats
      });
    }

    // Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Create booking
    const bookingData = {
      userId,
      showtimeId,
      movieId: showtime.movieId._id,
      theaterId: showtime.theaterId._id,
      seats,
      totalAmount,
      paymentMethod,
      customerInfo: {
        name: customerInfo.name || req.user.fullName || req.user.name,
        email: customerInfo.email || req.user.email,
        phone: customerInfo.phone || req.user.phone
      },
      showDate: showtime.date,
      showTime: showtime.time,
      paymentStatus: 'pending',
      bookingStatus: 'pending' // Set initial status as pending
    };

    const booking = new Booking(bookingData);
    await booking.save();
    
    console.log('✅ Booking created with customerInfo:', booking.customerInfo);

    // Temporarily hold seats (decrease available seats)
    showtime.availableSeats -= seats.length;
    await showtime.save();

    // Populate booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId', 'title duration poster')
      .populate('theaterId', 'name location')
      .populate('showtimeId', 'date time')
      .populate('userId', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Đặt vé thành công',
      data: populatedBooking
    });

  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt vé',
      error: error.message
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    let query = { userId };
    if (status) {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('movieId', 'title duration poster genre')
      .populate('theaterId', 'name location rooms')
      .populate('showtimeId', 'date time roomId')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    // Thêm thông tin tên phòng vào bookings
    const bookingsWithRoomInfo = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Thêm thông tin tên phòng từ theater rooms
      let roomName = 'Không xác định';
      if (bookingObj.theaterId?.rooms && bookingObj.showtimeId?.roomId) {
        const room = bookingObj.theaterId.rooms.find(r => 
          r._id.toString() === bookingObj.showtimeId.roomId.toString()
        );
        roomName = room ? room.name : `Phòng ${bookingObj.showtimeId.roomId}`;
      }
      
      // Thêm thông tin phòng vào showtime và booking object
      if (bookingObj.showtimeId) {
        bookingObj.showtimeId.room = roomName;
      }
      bookingObj.roomName = roomName; // Thêm trường này để dễ access từ frontend
      
      return bookingObj;
    });

    // Debug log để check booking status
    console.log('📋 getUserBookings - Sample booking statuses:', bookingsWithRoomInfo.slice(0, 2).map(b => ({
      id: b._id,
      bookingStatus: b.bookingStatus,
      paymentStatus: b.paymentStatus,
      bookingCode: b.bookingCode,
      roomName: b.roomName
    })));

    res.json({
      success: true,
      data: bookingsWithRoomInfo,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('❌ Error getting user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử đặt vé',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, userId })
      .populate('movieId', 'title duration poster genre')
      .populate('theaterId', 'name location rooms')
      .populate('showtimeId', 'date time roomId')
      .populate('userId', 'fullName email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé đặt'
      });
    }

    // Add room info from theater
    let roomName = 'N/A';
    console.log('🏠 GetBookingById Room Debug:', {
      hasTheater: !!booking.theaterId,
      hasRooms: !!booking.theaterId?.rooms,
      roomsCount: booking.theaterId?.rooms?.length,
      hasShowtime: !!booking.showtimeId,
      roomId: booking.showtimeId?.roomId,
      theaterRooms: booking.theaterId?.rooms?.map(r => ({ id: r._id, name: r.name }))
    });
    
    if (booking.theaterId?.rooms && booking.showtimeId?.roomId) {
      const room = booking.theaterId.rooms.find(r => 
        r._id.toString() === booking.showtimeId.roomId.toString()
      );
      roomName = room ? room.name : `Phòng ${booking.showtimeId.roomId}`;
      console.log('🏠 GetBookingById Room result:', { found: !!room, roomName });
    }
    
    if (booking.showtimeId) {
      booking.showtimeId.room = roomName;
    }

    // Ensure customerInfo có đầy đủ thông tin
    if (!booking.customerInfo || !booking.customerInfo.name) {
      booking.customerInfo = {
        name: booking.userId?.name || 'Khách hàng',
        email: booking.userId?.email || booking.customerInfo?.email || 'N/A',
        phone: booking.userId?.phone || booking.customerInfo?.phone || 'N/A'
      };
      console.log('🔧 GetBookingById Fixed customerInfo:', booking.customerInfo);
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('❌ Error getting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin vé',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy vé đặt'
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Vé đã được hủy trước đó'
      });
    }

    // Check if can cancel (e.g., not too close to showtime)
    const showDateTime = new Date(`${booking.showDate} ${booking.showTime}`);
    const now = new Date();
    const timeDiff = showDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 2) { // Can't cancel within 2 hours of showtime
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy vé trong vòng 2 tiếng trước giờ chiếu'
      });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Update showtime available seats
    const showtime = await Showtime.findById(booking.showtimeId);
    if (showtime) {
      showtime.availableSeats += booking.seats.length;
      await showtime.save();
    }

    res.json({
      success: true,
      message: 'Hủy vé thành công',
      data: booking
    });

  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi hủy vé',
      error: error.message
    });
  }
};

// Get booking statistics (for admin)
const getBookingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchStage = {};
    if (startDate && endDate) {
      matchStage.bookingDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalSeats: { $sum: { $size: '$seats' } },
          avgBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statusStats = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$bookingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalBookings: 0,
          totalRevenue: 0,
          totalSeats: 0,
          avgBookingValue: 0
        },
        statusBreakdown: statusStats
      }
    });

  } catch (error) {
    console.error('❌ Error getting booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đặt vé',
      error: error.message
    });
  }
};

// Get all bookings (for admin)
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    if (status) {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingCode: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'fullName email phone')
      .populate('movieId', 'title poster')
      .populate('theaterId', 'name location rooms')
      .populate('showtimeId', 'date time roomId')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Fix booking data để ensure customerInfo có data và thêm thông tin phòng
    const bookingsWithCustomerInfo = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Nếu customerInfo trống hoặc không có, lấy từ populated userId
      if (!bookingObj.customerInfo || !bookingObj.customerInfo.name || bookingObj.customerInfo.name === 'N/A') {
        bookingObj.customerInfo = {
          name: bookingObj.userId?.fullName || bookingObj.userId?.name || 'Khách hàng',
          email: bookingObj.userId?.email || bookingObj.customerInfo?.email || 'N/A',
          phone: bookingObj.userId?.phone || bookingObj.customerInfo?.phone || 'N/A'
        };
      }
      
      // Thêm thông tin tên phòng từ theater rooms
      let roomName = 'Không xác định';
      console.log('🏠 getAllBookings Room Debug:', {
        hasTheater: !!bookingObj.theaterId,
        hasRooms: !!bookingObj.theaterId?.rooms,
        roomsCount: bookingObj.theaterId?.rooms?.length,
        hasShowtime: !!bookingObj.showtimeId,
        roomId: bookingObj.showtimeId?.roomId,
        theaterRooms: bookingObj.theaterId?.rooms?.map(r => ({ id: r._id, name: r.name }))
      });
      
      if (bookingObj.theaterId?.rooms && bookingObj.showtimeId?.roomId) {
        const room = bookingObj.theaterId.rooms.find(r => 
          r._id.toString() === bookingObj.showtimeId.roomId.toString()
        );
        roomName = room ? room.name : `Phòng ${bookingObj.showtimeId.roomId}`;
        console.log('🏠 getAllBookings Room result:', { found: !!room, roomName });
      }
      
      // Thêm thông tin phòng vào showtime và booking object
      if (bookingObj.showtimeId) {
        bookingObj.showtimeId.room = roomName;
      }
      bookingObj.roomName = roomName; // Thêm trường này để dễ access từ frontend
      
      return bookingObj;
    });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: bookingsWithCustomerInfo,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('❌ Error getting all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đặt vé',
      error: error.message
    });
  }
};

// Get occupied seats for a showtime
const getOccupiedSeats = async (req, res) => {
  try {
    const { showtimeId } = req.params;

    console.log('🪑 Getting occupied seats for showtime:', showtimeId);

    const bookings = await Booking.find({
      showtimeId,
      bookingStatus: { $in: ['confirmed', 'paid', 'pending'] }
    }).select('seats');

    const occupiedSeats = bookings.flatMap(booking => 
      booking.seats.map(seat => seat.seatNumber)
    );

    console.log('🪑 Occupied seats found:', occupiedSeats);

    res.json({
      success: true,
      data: {
        occupiedSeats: [...new Set(occupiedSeats)] // Remove duplicates
      }
    });

  } catch (error) {
    console.error('❌ Error getting occupied seats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách ghế đã đặt',
      error: error.message
    });
  }
};

// Simulate payment success
const simulatePaymentSuccess = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    console.log('💳 Simulating payment success for booking:', bookingId);

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Update booking status to paid
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paidAt = new Date();
    await booking.save();

    // Generate booking code if not exists
    if (!booking.bookingCode) {
      booking.bookingCode = `CM${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      await booking.save();
    }

    // Generate QR code data
    const qrData = {
      bookingCode: booking.bookingCode,
      movieId: booking.movieId,
      theaterId: booking.theaterId,
      showtimeId: booking.showtimeId,
      seats: booking.seats,
      showDate: booking.showDate,
      showTime: booking.showTime,
      totalAmount: booking.totalAmount,
      customerInfo: booking.customerInfo,
      timestamp: booking.paidAt
    };

    // Update booking with QR data
    booking.qrCode = JSON.stringify(qrData);
    await booking.save();

    // Populate booking data for frontend với room info
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId', 'title duration poster genre')
      .populate('theaterId', 'name location rooms')
      .populate('showtimeId', 'date time roomId')
      .populate('userId', 'fullName email phone');

    // Get room info từ theater rooms
    let roomName = 'N/A';
    console.log('🏠 Debug Room Info:', {
      hasTheater: !!populatedBooking.theaterId,
      hasRooms: !!populatedBooking.theaterId?.rooms,
      roomsCount: populatedBooking.theaterId?.rooms?.length,
      hasShowtime: !!populatedBooking.showtimeId,
      roomId: populatedBooking.showtimeId?.roomId,
      theaterRooms: populatedBooking.theaterId?.rooms?.map(r => ({ id: r._id, name: r.name }))
    });
    
    if (populatedBooking.theaterId?.rooms && populatedBooking.showtimeId?.roomId) {
      const room = populatedBooking.theaterId.rooms.find(r => 
        r._id.toString() === populatedBooking.showtimeId.roomId.toString()
      );
      roomName = room ? room.name : `Phòng ${populatedBooking.showtimeId.roomId}`;
      console.log('🏠 Room matching result:', { found: !!room, roomName });
    }
    
    // Add room info to showtime object
    if (populatedBooking.showtimeId) {
      populatedBooking.showtimeId.room = roomName;
    }

    // Ensure customerInfo có đầy đủ thông tin
    if (!populatedBooking.customerInfo || !populatedBooking.customerInfo.name) {
      populatedBooking.customerInfo = {
        name: populatedBooking.userId?.fullName || populatedBooking.userId?.name || 'Khách hàng',
        email: populatedBooking.userId?.email || populatedBooking.customerInfo?.email || 'N/A',
        phone: populatedBooking.userId?.phone || populatedBooking.customerInfo?.phone || 'N/A'
      };
      console.log('🔧 Fixed customerInfo:', populatedBooking.customerInfo);
    }

    console.log('✅ Payment simulation successful for booking:', bookingId);
    console.log('📊 Populated booking data:', {
      movieTitle: populatedBooking.movieId?.title,
      theaterName: populatedBooking.theaterId?.name,
      theaterLocation: populatedBooking.theaterId?.location,
      customerInfo: populatedBooking.customerInfo,
      userId: populatedBooking.userId,
      roomName: roomName
    });

    res.json({
      success: true,
      message: 'Thanh toán thành công',
      data: {
        booking: populatedBooking,
        redirectUrl: '/booking-success'
      }
    });

  } catch (error) {
    console.error('❌ Error simulating payment success:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý thanh toán',
      error: error.message
    });
  }
};

// Simulate payment failure
const simulatePaymentFailure = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    console.log('💳 Simulating payment failure for booking:', bookingId);

    const booking = await Booking.findOne({ _id: bookingId, userId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    // Update booking status to failed
    booking.paymentStatus = 'failed';
    booking.bookingStatus = 'cancelled';
    await booking.save();

    // Update showtime available seats (release the seats)
    const showtime = await Showtime.findById(booking.showtimeId);
    if (showtime) {
      showtime.availableSeats += booking.seats.length;
      await showtime.save();
    }

    // Populate booking data for frontend even in failure case
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId', 'title duration poster genre')
      .populate('theaterId', 'name location')
      .populate('showtimeId', 'date time')
      .populate('userId', 'fullName email phone');

    console.log('❌ Payment simulation failed for booking:', bookingId);

    res.json({
      success: false,
      message: 'Thanh toán thất bại',
      data: {
        booking: populatedBooking,
        redirectUrl: '/booking-failed'
      }
    });

  } catch (error) {
    console.error('❌ Error simulating payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý thanh toán thất bại',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getBookingStats,
  getAllBookings,
  getOccupiedSeats,
  simulatePaymentSuccess,
  simulatePaymentFailure
};