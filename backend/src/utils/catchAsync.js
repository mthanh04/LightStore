/**
 * Wrapper bọc các async function trong controller
 * Tự động bắt lỗi và chuyển sang middleware xử lý lỗi (next)
 * Giúp không phải viết try/catch lặp lại trong mỗi controller
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;
