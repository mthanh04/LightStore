const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !email || !password) {
        return next(new AppError('Vui lòng nhập đầy đủ tên, email và mật khẩu', 400));
    }

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('Email đã được sử dụng', 400));
    }

    // Tạo user mới (role mặc định là "user", KHÔNG cho phép tự gán role qua body)
    const user = await User.create({ name, email, password });

    res.status(201).json({
        status: 'success',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            token: generateToken(user._id),
        },
    });
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Kiểm tra input
    if (!email || !password) {
        return next(new AppError('Vui lòng nhập email và mật khẩu', 400));
    }

    // Tìm user kèm password (vì field password đã bị select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Email hoặc mật khẩu không đúng', 401));
    }

    // Trả về role để frontend phân hướng giao diện (admin → /admin, user → /)
    res.json({
        status: 'success',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            token: generateToken(user._id),
        },
    });
});

// @desc    Lấy thông tin user đang đăng nhập
// @route   GET /api/auth/me
const getMe = catchAsync(async (req, res, next) => {
    // req.user đã được gắn bởi middleware protect
    const user = await User.findById(req.user._id);
    if (!user) {
        return next(new AppError('Không tìm thấy tài khoản', 404));
    }

    res.json({
        status: 'success',
        data: user,
    });
});
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Đăng nhập bằng Google
// @route   POST /api/auth/google
const googleLogin = catchAsync(async (req, res, next) => {
    const { tokenId } = req.body;

    if (!tokenId) {
        return next(new AppError('Token Google không được cung cấp', 400));
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Tạo user mới, không cần password
            user = await User.create({
                name,
                email,
                googleId,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        res.status(200).json({
            status: 'success',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        return next(new AppError('Xác thực Google thất bại', 401));
    }
});

module.exports = { registerUser, loginUser, getMe, googleLogin };