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

module.exports = { toggleWishlist, getWishlist };
