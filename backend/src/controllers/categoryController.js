const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

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

// @desc    Thêm danh mục mới (Admin)
// @route   POST /api/categories
const createCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return next(new AppError('Vui lòng nhập tên danh mục', 400));
    }

    const category = await Category.create({ name });

    res.status(201).json({
        status: 'success',
        data: category,
    });
});

// @desc    Cập nhật danh mục (Admin)
// @route   PUT /api/categories/:id
const updateCategory = catchAsync(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new AppError('Không tìm thấy danh mục', 404));
    }

    const { name } = req.body;
    if (name) category.name = name;

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

    await Category.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Đã xóa danh mục thành công',
    });
});

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
