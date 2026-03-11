// Tính toán cấu hình ghế động dựa trên tổng số ghế
export const calculateSeatConfig = (totalSeats = 120) => {
  // Tỷ lệ: 50% thường, 30% VIP, 20% đôi
  const regularCount = Math.floor(totalSeats * 0.5);
  const vipCount = Math.floor(totalSeats * 0.3);
  const coupleCount = totalSeats - regularCount - vipCount; // Phần còn lại

  // Tính số hàng cần thiết (giả sử 14 ghế/hàng)
  const seatsPerRow = 14;
  const totalRows = Math.ceil(totalSeats / seatsPerRow);
  
  const regularRows = Math.ceil(regularCount / seatsPerRow);
  const vipRows = Math.ceil(vipCount / seatsPerRow);
  const coupleRows = totalRows - regularRows - vipRows;

  // Tạo mảng tên hàng
  const allRows = [];
  for (let i = 0; i < totalRows; i++) {
    allRows.push(String.fromCharCode(65 + i)); // A, B, C, ...
  }

  const regularRowNames = allRows.slice(0, regularRows);
  const vipRowNames = allRows.slice(regularRows, regularRows + vipRows);
  const coupleRowNames = allRows.slice(regularRows + vipRows);

  return {
    totalSeats,
    seatsPerRow,
    seatRows: allRows,
    regularRows: regularRowNames,
    vipRows: vipRowNames,
    coupleRows: coupleRowNames,
    counts: {
      regular: regularCount,
      vip: vipCount,
      couple: coupleCount
    }
  };
};

// Cấu hình mặc định
export const SEAT_CONFIG = calculateSeatConfig(120);

export const getSeatPrice = (row, basePrice = 100000, config = SEAT_CONFIG) => {
  if (config.vipRows.includes(row)) return basePrice * 1.5;
  if (config.coupleRows.includes(row)) return basePrice * 2.0;
  return basePrice;
};

export const getSeatType = (row, config = SEAT_CONFIG) => {
  if (config.vipRows.includes(row)) return 'vip';
  if (config.coupleRows.includes(row)) return 'couple';
  return 'regular';
};

export const getSeatTypeLabel = (row, config = SEAT_CONFIG) => {
  if (config.vipRows.includes(row)) return 'VIP';
  if (config.coupleRows.includes(row)) return 'Đôi';
  return 'Thường';
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const calculateTotal = (selectedSeats, basePrice = 100000) => {
  return selectedSeats.reduce((total, seatId) => {
    const row = seatId.charAt(0);
    return total + getSeatPrice(row, basePrice);
  }, 0);
};