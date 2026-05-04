const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Lấy danh sách tất cả user (có phân trang, tìm kiếm)
// @route   GET /api/admin/users
const getAllUsers = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Tìm kiếm theo tên hoặc email
    const searchQuery = {};
    if (req.query.search) {
        searchQuery.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    // Lọc theo role
    if (req.query.role) {
        searchQuery.role = req.query.role;
    }

    const [users, total] = await Promise.all([
        User.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(searchQuery),
    ]);

    res.json({
        status: 'success',
        results: users.length,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
        },
        data: users,
    });
});

// @desc    Admin cập nhật role user
// @route   PUT /api/admin/users/:id
const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
    }

    // Không cho Admin tự hạ cấp chính mình
    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
        return next(new AppError('Bạn không thể tự hạ cấp quyền Admin của chính mình', 400));
    }

    // Chỉ cho phép cập nhật role (bảo mật: không cho sửa email/password qua route này)
    const allowedFields = ['name', 'role'];
    const updateData = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
    });

    res.json({
        status: 'success',
        data: updatedUser,
    });
});

// @desc    Admin xóa tài khoản user
// @route   DELETE /api/admin/users/:id
const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
    }

    // Không cho Admin tự xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
        return next(new AppError('Bạn không thể xóa tài khoản của chính mình', 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Đã xóa tài khoản thành công',
    });
});

module.exports = { getAllUsers, updateUser, deleteUser };
