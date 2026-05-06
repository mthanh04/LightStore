const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Helper: upload single buffer lên Cloudinary
const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'lightstore/categories' },
            (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url, publicId: result.public_id });
            }
        );
        stream.end(buffer);
    });

// Helper: xóa ảnh cũ khỏi Cloudinary (bỏ qua nếu không có publicId)
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch {
        // Không throw — ảnh có thể đã bị xóa thủ công
    }
};

// @desc    Lấy toàn bộ danh mục
// @route   GET /api/categories
const getAllCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find().sort({ name: 1 });

    res.json({
        status: 'success',
        results: categories.length,
        data: categories,
    });
});

// @desc    Thêm danh mục mới (Admin) — nhận multipart/form-data
// @route   POST /api/categories
const createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new AppError('Vui lòng nhập tên danh mục', 400));
    }

    let image = '';
    let imagePublicId = '';

    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        image = result.url;
        imagePublicId = result.publicId;
    }

    const category = await Category.create({ name, image, imagePublicId });

    res.status(201).json({
        status: 'success',
        data: category,
    });
});

// @desc    Cập nhật danh mục (Admin) — nhận multipart/form-data
// @route   PUT /api/categories/:id
const updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Không tìm thấy danh mục', 404));
    }

    const { name } = req.body;
    if (name) category.name = name;

    // Nếu có ảnh mới thì upload và xóa ảnh cũ
    if (req.file) {
        await deleteFromCloudinary(category.imagePublicId);
        const result = await uploadToCloudinary(req.file.buffer);
        category.image = result.url;
        category.imagePublicId = result.publicId;
    }

    // Nếu frontend gửi removeImage=true → xóa ảnh khỏi Cloudinary và DB
    if (req.body.removeImage === 'true') {
        await deleteFromCloudinary(category.imagePublicId);
        category.image = '';
        category.imagePublicId = '';
    }

    await category.save(); // Trigger pre-save hook để cập nhật slug

    res.json({
        status: 'success',
        data: category,
    });
});

// @desc    Xóa danh mục (Admin)
// @route   DELETE /api/categories/:id
const deleteCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Không tìm thấy danh mục', 404));
    }

    // Xóa ảnh Cloudinary trước khi xóa document
    await deleteFromCloudinary(category.imagePublicId);

    await Category.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Đã xóa danh mục thành công',
    });
});

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
