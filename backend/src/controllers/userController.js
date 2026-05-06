const User = require('../models/User');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Thêm/xóa sản phẩm vào wishlist
// @route   POST /api/users/wishlist
const toggleWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new AppError('Vui lòng cung cấp ID sản phẩm', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    let user = await User.findById(req.user._id);

    // Kiểm tra xem sản phẩm đã có trong wishlist chưa
    const isLiked = user.wishlist.includes(productId);

    if (isLiked) {
        // Xóa khỏi wishlist
        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId.toString());
    } else {
        // Thêm vào wishlist
        user.wishlist.push(productId);
    }

    await user.save();

    res.json({
        status: 'success',
        message: isLiked ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích',
        data: user.wishlist,
    });
});

// @desc    Lấy danh sách yêu thích
// @route   GET /api/users/wishlist
const getWishlist = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('wishlist');

    res.json({
        status: 'success',
        results: user.wishlist.length,
        data: user.wishlist,
    });
});

// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/users/profile
const updateProfile = catchAsync(async (req, res, next) => {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
        status: 'success',
        message: 'Cập nhật thông tin thành công',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role
        }
    });
});

// @desc    Thay đổi mật khẩu
// @route   PUT /api/users/change-password
const changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new AppError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới', 400));
    }

    if (newPassword.length < 6) {
        return next(new AppError('Mật khẩu mới phải có ít nhất 6 ký tự', 400));
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        return next(new AppError('Không tìm thấy người dùng', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return next(new AppError('Mật khẩu hiện tại không đúng', 400));
    }

    user.password = newPassword;
    await user.save(); // pre-save hook sẽ hash password mới

    const generateToken = require('../utils/generateToken');

    res.json({
        status: 'success',
        message: 'Thay đổi mật khẩu thành công',
        data: {
            token: generateToken(user._id)
        }
    });
});

module.exports = { toggleWishlist, getWishlist, updateProfile, changePassword };
