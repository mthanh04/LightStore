const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Middleware bảo vệ route - Yêu cầu đăng nhập
 * Kiểm tra JWT Token hợp lệ và user còn tồn tại
 */
const protect = catchAsync(async (req, res, next) => {
    // 1) Lấy token từ header Authorization: "Bearer <token>"
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Vui lòng đăng nhập để tiếp tục', 401));
    }

    // 2) Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Kiểm tra user còn tồn tại trong DB không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('Tài khoản sở hữu token này không còn tồn tại', 401));
    }

    // Gắn user vào request để controller phía sau sử dụng
    req.user = currentUser;
    next();
});

/**
 * Middleware kiểm tra quyền Admin
 * Phải đặt SAU middleware protect
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        next(new AppError('Bạn không có quyền thực hiện hành động này (Chỉ Admin)', 403));
    }
};

module.exports = { protect, admin };