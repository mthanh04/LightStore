const multer = require('multer');
const AppError = require('../utils/AppError');

// Lưu file trong RAM (buffer) → stream thẳng lên Cloudinary, không lưu ổ cứng
const storage = multer.memoryStorage();

// Chỉ cho phép upload ảnh (jpg, png, webp)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Tối đa 5MB mỗi ảnh
    },
});

module.exports = upload;
