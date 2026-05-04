/**
 * Custom Error Class cho ứng dụng
 * Kế thừa từ Error, thêm statusCode và status để xử lý lỗi chuẩn hóa
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Đánh dấu lỗi do logic nghiệp vụ (không phải lỗi hệ thống)

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
