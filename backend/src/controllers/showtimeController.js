const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// Debug endpoint để xem all showtimes raw data
const getShowtimesDebug = async (req, res) => {
  try {
    const showtimes = await Showtime.find().populate('movieId', 'title').populate('theaterId', 'name');
    
    const debugData = showtimes.map(st => ({
      _id: st._id,
      movie: st.movieId?.title,
      theater: st.theaterId?.name,
      theaterId: st.theaterId?._id,
      roomId: st.roomId,
      date: st.date,
      time: st.time,
      status: st.status
    }));
    
    console.log('🔍 Debug all showtimes:', debugData);
    
    res.json({
      success: true,
      count: showtimes.length,
      data: debugData
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all showtimes
const getAllShowtimes = async (req, res) => {
  try {
    console.log('📋 Fetching all showtimes...');
    
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration genre poster')
      .populate('theaterId', 'name location rooms')
      .sort({ date: 1, time: 1 });
    
    console.log(`✅ Found ${showtimes?.length || 0} showtimes`);
    
    // Filter out any null or invalid entries
    const validShowtimes = showtimes.filter(showtime => {
      if (!showtime) {
        console.warn('⚠️ Found null showtime');
        return false;
      }
      if (!showtime.movieId) {
        console.warn('⚠️ Showtime missing movieId:', showtime._id);
        return false;
      }
      if (!showtime.theaterId) {
        console.warn('⚠️ Showtime missing theaterId:', showtime._id);
        return false;
      }
      return true;
    });
    
    console.log(`✅ Valid showtimes: ${validShowtimes.length}`);
    
    res.json({
      success: true,
      data: validShowtimes
    });
  } catch (error) {
    console.error('❌ Error in getAllShowtimes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch chiếu',
      error: error.message
    });
  }
};

// Get showtime by ID
const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId', 'title duration genre poster')
      .populate('theaterId', 'name location rooms');
    
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch chiếu'
      });
    }
    
    res.json({
      success: true,
      data: showtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch chiếu',
      error: error.message
    });
  }
};

// Create new showtime
const createShowtime = async (req, res) => {
  try {
    const { movieId, theaterId, roomId, date, time, price, totalSeats } = req.body;

    // Debug logging
    console.log('📝 Received showtime data:', req.body);
    
    // Ensure ObjectId format consistency
    const mongoose = require('mongoose');
    const normalizedTheaterId = mongoose.Types.ObjectId.isValid(theaterId) ? new mongoose.Types.ObjectId(theaterId) : theaterId;
    const normalizedRoomId = mongoose.Types.ObjectId.isValid(roomId) ? new mongoose.Types.ObjectId(roomId) : roomId;
    const normalizedMovieId = mongoose.Types.ObjectId.isValid(movieId) ? new mongoose.Types.ObjectId(movieId) : movieId;

    // Validate required fields
    if (!movieId || !theaterId || !roomId || !date || !time || !price || !totalSeats) {
      console.log('❌ Missing required fields:', { movieId, theaterId, roomId, date, time, price, totalSeats });
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc',
        received: { movieId, theaterId, roomId, date, time, price, totalSeats }
      });
    }

    // Check if movie exists
    const movie = await Movie.findById(normalizedMovieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Check if theater exists
    const theater = await Theater.findById(normalizedTheaterId);
    if (!theater) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy rạp chiếu'
      });
    }

    // Check if room exists in theater
    const room = theater.rooms.find(r => r._id.toString() === normalizedRoomId.toString());
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng chiếu trong rạp này'
      });
    }

    // Debug logging để kiểm tra data
    console.log('🔍 Checking for duplicate with data:', {
      originalTheaterId: theaterId,
      originalRoomId: roomId,
      normalizedTheaterId: normalizedTheaterId,
      normalizedRoomId: normalizedRoomId,
      date: date,
      time: time,
      theaterIdType: typeof theaterId,
      roomIdType: typeof roomId
    });

    // Check for slot occupation first - use normalized IDs
    const existingShowtime = await Showtime.findOne({
      theaterId: normalizedTheaterId,
      roomId: normalizedRoomId,
      date,
      time,
      status: 'active'
    }).populate('movieId', 'title');
    
    console.log('🔍 Found existing showtime:', existingShowtime ? {
      id: existingShowtime._id,
      theaterId: existingShowtime.theaterId,
      roomId: existingShowtime.roomId,
      date: existingShowtime.date,
      time: existingShowtime.time,
      movie: existingShowtime.movieId?.title
    } : 'None');
    
    // Debug: List tất cả showtimes cùng ngày để debug
    const allShowtimesToday = await Showtime.find({
      date: date,
      status: 'active'
    }).populate('movieId', 'title').populate('theaterId', 'name');
    
    console.log('📊 All showtimes on', date, ':', allShowtimesToday.map(st => ({
      movie: st.movieId?.title,
      theater: st.theaterId?.name,
      theaterId: st.theaterId?._id,
      roomId: st.roomId,
      time: st.time
    })));
    
    if (existingShowtime) {
      // Check if it's the same movie (true duplicate)
      if (existingShowtime.movieId._id.toString() === normalizedMovieId.toString()) {
        return res.status(400).json({
          success: false,
          message: `Lịch chiếu này đã tồn tại: phim "${existingShowtime.movieId.title}" vào ${time} ngày ${date}.`,
          error: 'True duplicate',
          existing: {
            movie: existingShowtime.movieId.title,
            time: existingShowtime.time,
            date: existingShowtime.date
          }
        });
      } else {
        // Different movie, slot occupied
        return res.status(400).json({
          success: false,
          message: `Slot thời gian ${time} ngày ${date} đã được sử dụng cho phim "${existingShowtime.movieId.title}". Một phòng chỉ có thể chiếu một phim tại một thời điểm. Vui lòng chọn thời gian khác.`,
          error: 'Slot occupied',
          existing: {
            movie: existingShowtime.movieId.title,
            time: existingShowtime.time,
            date: existingShowtime.date
          }
        });
      }
    }

    // Check for time conflicts - use normalized IDs
    const conflictingShowtime = await checkTimeConflict(normalizedTheaterId, normalizedRoomId, date, time, movie.duration);
    if (conflictingShowtime) {
      return res.status(400).json({
        success: false,
        message: `Khung giờ này đã bị trùng với phim "${conflictingShowtime.movieTitle}" (${conflictingShowtime.time})`,
        conflict: conflictingShowtime
      });
    }

    const showtime = new Showtime({
      movieId: normalizedMovieId,
      theaterId: normalizedTheaterId,
      roomId: normalizedRoomId,
      date,
      time,
      price,
      totalSeats,
      availableSeats: totalSeats,
      status: 'active'
    });

    await showtime.save();
    
    const populatedShowtime = await Showtime.findById(showtime._id)
      .populate('movieId', 'title duration genre poster')
      .populate('theaterId', 'name location rooms');

    res.status(201).json({
      success: true,
      message: 'Tạo lịch chiếu thành công',
      data: populatedShowtime
    });
  } catch (error) {
    console.error('❌ Error creating showtime:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      console.log('🔍 Duplicate key error details:', error.keyPattern, error.keyValue);
      
      // Try to find the actual conflicting showtime để show better error
      try {
        // Use original IDs since normalizedIds might be out of scope
        const conflictShowtime = await Showtime.findOne({
          theaterId: theaterId,
          roomId: roomId,
          date: date,
          time: time,
          status: 'active'
        }).populate('movieId', 'title').populate('theaterId', 'name');
        
        if (conflictShowtime) {
          return res.status(400).json({
            success: false,
            message: `Slot ${time} ngày ${date} tại ${conflictShowtime.theaterId?.name} đã có phim "${conflictShowtime.movieId?.title}". Vui lòng chọn thời gian khác.`,
            error: 'Slot occupied',
            existing: {
              movie: conflictShowtime.movieId?.title,
              theater: conflictShowtime.theaterId?.name,
              time: conflictShowtime.time,
              date: conflictShowtime.date
            }
          });
        }
      } catch (findError) {
        console.error('Error finding conflict details:', findError);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Slot thời gian này đã được sử dụng. Một phòng chỉ có thể chiếu một phim tại một thời điểm. Vui lòng chọn thời gian khác.',
        error: 'Duplicate slot',
        details: {
          duplicateFields: error.keyPattern,
          duplicateValues: error.keyValue,
          explanation: 'A room can only show one movie at a specific time'
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch chiếu',
      error: error.message
    });
  }
};

// Update showtime
const updateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId, theaterId, roomId, date, time, price, totalSeats } = req.body;

    const existingShowtime = await Showtime.findById(id);
    if (!existingShowtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch chiếu'
      });
    }

    // If time/date/room is changing, check for conflicts
    if (date !== existingShowtime.date || 
        time !== existingShowtime.time || 
        roomId !== existingShowtime.roomId.toString()) {
      
      const movie = await Movie.findById(movieId || existingShowtime.movieId);
      const conflictingShowtime = await checkTimeConflict(
        theaterId || existingShowtime.theaterId, 
        roomId || existingShowtime.roomId, 
        date || existingShowtime.date, 
        time || existingShowtime.time, 
        movie.duration,
        id // Exclude current showtime from conflict check
      );
      
      if (conflictingShowtime) {
        return res.status(400).json({
          success: false,
          message: `Khung giờ này đã bị trùng với phim "${conflictingShowtime.movieTitle}" (${conflictingShowtime.time})`,
          conflict: conflictingShowtime
        });
      }
    }

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      id,
      {
        movieId: movieId || existingShowtime.movieId,
        theaterId: theaterId || existingShowtime.theaterId,
        roomId: roomId || existingShowtime.roomId,
        date: date || existingShowtime.date,
        time: time || existingShowtime.time,
        price: price !== undefined ? price : existingShowtime.price,
        totalSeats: totalSeats !== undefined ? totalSeats : existingShowtime.totalSeats,
        availableSeats: totalSeats !== undefined ? totalSeats : existingShowtime.availableSeats
      },
      { new: true }
    ).populate('movieId', 'title duration genre poster')
     .populate('theaterId', 'name location rooms');

    res.json({
      success: true,
      message: 'Cập nhật lịch chiếu thành công',
      data: updatedShowtime
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch chiếu',
      error: error.message
    });
  }
};

// Delete showtime
const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndDelete(req.params.id);
    
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch chiếu'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa lịch chiếu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch chiếu',
      error: error.message
    });
  }
};

// Get available time slots for a specific theater, room and date
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { theaterId, roomId, date, movieId } = req.query;

    if (!theaterId || !roomId || !date || !movieId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: theaterId, roomId, date, movieId'
      });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    // Get existing showtimes for this room and date
    const existingShowtimes = await Showtime.find({
      theaterId,
      roomId,
      date,
      status: 'active'
    }).populate('movieId', 'title duration');

    // Generate suggested time slots (9:00 - 23:00)
    const suggestedSlots = [];
    for (let hour = 9; hour < 23; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        if (hour === 22 && minute > 30) break; // Stop at 22:30
        
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = checkSlotAvailability(timeSlot, movie.duration, existingShowtimes);
        
        let conflictInfo = null;
        if (!isAvailable) {
          conflictInfo = getConflictInfo(timeSlot, movie.duration, existingShowtimes);
        }

        suggestedSlots.push({
          time: timeSlot,
          endTime: calculateEndTime(timeSlot, movie.duration),
          available: isAvailable,
          conflict: conflictInfo
        });
      }
    }

    res.json({
      success: true,
      data: {
        movieTitle: movie.title,
        movieDuration: movie.duration,
        date,
        availableSlots: suggestedSlots.filter(slot => slot.available),
        unavailableSlots: suggestedSlots.filter(slot => !slot.available),
        allSlots: suggestedSlots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy khung giờ khả dụng',
      error: error.message
    });
  }
};

// Copy showtimes from one date to another
const copyShowtimes = async (req, res) => {
  try {
    const { fromDate, toDate, theaterId, roomId } = req.body;

    if (!fromDate || !toDate || !theaterId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: fromDate, toDate, theaterId'
      });
    }

    // Get showtimes from source date
    const query = { date: fromDate, theaterId, status: 'active' };
    if (roomId) {
      query.roomId = roomId;
    }

    const sourceShowtimes = await Showtime.find(query)
      .populate('movieId', 'title duration');

    if (sourceShowtimes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch chiếu nào để sao chép'
      });
    }

    // Check for conflicts on target date
    const conflicts = [];
    const validShowtimes = [];

    for (const showtime of sourceShowtimes) {
      const conflict = await checkTimeConflict(
        showtime.theaterId,
        showtime.roomId,
        toDate,
        showtime.time,
        showtime.movieId.duration
      );

      if (conflict) {
        conflicts.push({
          originalTime: showtime.time,
          movieTitle: showtime.movieId.title,
          conflict
        });
      } else {
        validShowtimes.push(showtime);
      }
    }

    // Create new showtimes
    const newShowtimes = [];
    for (const showtime of validShowtimes) {
      const newShowtime = new Showtime({
        movieId: showtime.movieId._id,
        theaterId: showtime.theaterId,
        roomId: showtime.roomId,
        date: toDate,
        time: showtime.time,
        price: showtime.price,
        totalSeats: showtime.totalSeats,
        availableSeats: showtime.totalSeats,
        status: 'active'
      });

      await newShowtime.save();
      newShowtimes.push(newShowtime);
    }

    res.json({
      success: true,
      message: `Đã sao chép ${newShowtimes.length} lịch chiếu thành công`,
      data: {
        copiedCount: newShowtimes.length,
        conflictCount: conflicts.length,
        conflicts,
        newShowtimes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi sao chép lịch chiếu',
      error: error.message
    });
  }
};

// Helper functions
const checkTimeConflict = async (theaterId, roomId, date, time, duration, excludeId = null) => {
  const existingShowtimes = await Showtime.find({
    theaterId,
    roomId,
    date,
    status: 'active',
    ...(excludeId && { _id: { $ne: excludeId } })
  }).populate('movieId', 'title duration');

  const newStartTime = timeToMinutes(time);
  const newEndTime = newStartTime + duration;

  for (const showtime of existingShowtimes) {
    const existingStartTime = timeToMinutes(showtime.time);
    const existingEndTime = existingStartTime + showtime.movieId.duration;

    // Check for overlap (with 15-minute buffer)
    if ((newStartTime < existingEndTime + 15) && (newEndTime + 15 > existingStartTime)) {
      return {
        movieTitle: showtime.movieId.title,
        time: showtime.time,
        duration: showtime.movieId.duration
      };
    }
  }

  return null;
};

const checkSlotAvailability = (timeSlot, duration, existingShowtimes) => {
  const slotStartTime = timeToMinutes(timeSlot);
  const slotEndTime = slotStartTime + duration;

  for (const showtime of existingShowtimes) {
    const existingStartTime = timeToMinutes(showtime.time);
    const existingEndTime = existingStartTime + showtime.movieId.duration;

    // Check for overlap (with 15-minute buffer)
    if ((slotStartTime < existingEndTime + 15) && (slotEndTime + 15 > existingStartTime)) {
      return false;
    }
  }

  return true;
};

const getConflictInfo = (timeSlot, duration, existingShowtimes) => {
  const slotStartTime = timeToMinutes(timeSlot);
  const slotEndTime = slotStartTime + duration;

  for (const showtime of existingShowtimes) {
    const existingStartTime = timeToMinutes(showtime.time);
    const existingEndTime = existingStartTime + showtime.movieId.duration;

    if ((slotStartTime < existingEndTime + 15) && (slotEndTime + 15 > existingStartTime)) {
      return {
        movieTitle: showtime.movieId.title,
        time: showtime.time,
        duration: showtime.movieId.duration
      };
    }
  }

  return null;
};

const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const calculateEndTime = (startTime, duration) => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  const hours = Math.floor(endMinutes / 60);
  const minutes = endMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

module.exports = {
  getAllShowtimes,
  getShowtimesDebug,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getAvailableTimeSlots,
  copyShowtimes
};
