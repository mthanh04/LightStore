const AppError = require('../utils/AppError');

/**
 * Xử lý lỗi CastError (MongoDB ObjectId không hợp lệ)
 */
const handleCastErrorDB = (err) => {
    const message = `Giá trị không hợp lệ cho trường ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Xử lý lỗi Duplicate Key (trùng dữ liệu unique, ví dụ email)
 */
const handleDuplicateFieldsDB = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const message = `Giá trị "${err.keyValue[field]}" cho trường "${field}" đã tồn tại. Vui lòng sử dụng giá trị khác.`;
    return new AppError(message, 400);
};

/**
 * Xử lý lỗi Validation của Mongoose
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Dữ liệu không hợp lệ: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Xử lý lỗi JWT Token không hợp lệ
 */
const handleJWTError = () => {
    return new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401);
};

/**
 * Xử lý lỗi JWT Token hết hạn
 */
const handleJWTExpiredError = () => {
    return new AppError('Token đã hết hạn. Vui lòng đăng nhập lại.', 401);
};

/**
 * Gửi lỗi chi tiết trong môi trường Development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

/**
 * Gửi lỗi an toàn trong môi trường Production (không lộ stack trace)
 */
const sendErrorProd = (err, res) => {
    // Lỗi do nghiệp vụ (isOperational): gửi message cho client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Lỗi hệ thống: không lộ chi tiết cho client
        console.error('❌ ERROR:', err);
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi hệ thống!',
        });
    }
};

/**
 * Global Error Handler Middleware
 * Phải có 4 tham số (err, req, res, next) để Express nhận diện là error middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message };

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    } else {
        sendErrorDev(err, res);
    }
};

/**
 * Middleware xử lý route không tồn tại (404)
 */
const notFound = (req, res, next) => {
    next(new AppError(`Không tìm thấy đường dẫn: ${req.originalUrl}`, 404));
};

module.exports = { errorHandler, notFound };
