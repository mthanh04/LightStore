const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Lấy danh sách sản phẩm (phân trang, lọc, tìm kiếm, sort)
// @route   GET /api/products
const getProducts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 8;
    const skip = (page - 1) * limit;

    // --- Xây dựng query filter ---
    const filter = {};

    // Lọc theo danh mục
    if (req.query.category) {
        filter.category = req.query.category;
    }

    // Tìm kiếm theo tên (regex, không phân biệt hoa thường)
    if (req.query.search) {
        filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // --- Xây dựng sort ---
    let sortOption = { createdAt: -1 }; // mặc định: mới nhất trước
    if (req.query.sort) {
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
        }
    }

    const [products, totalItems] = await Promise.all([
        Product.find(filter)
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .sort(sortOption),
        Product.countDocuments(filter),
    ]);

    res.json({
        status: 'success',
        data: products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            limit,
        },
    });
});

// @desc    Lấy chi tiết 1 sản phẩm
// @route   GET /api/products/:id
const getProductById = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    res.json({
        status: 'success',
        data: product,
    });
});

// @desc    Thêm sản phẩm mới (Admin)
// @route   POST /api/products
const createProduct = catchAsync(async (req, res, next) => {
    const { name, price, description, category, stock, specifications, importantInfo } = req.body;

    if (!name || !price || !category) {
        return next(new AppError('Vui lòng nhập đầy đủ tên, giá và danh mục', 400));
    }

    // Xử lý upload ảnh lên Cloudinary (nếu có file gửi kèm)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'lightstore/products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            })
        );
        imageUrls = await Promise.all(uploadPromises);
    }

    const product = await Product.create({
        name,
        price,
        description,
        category,
        stock: stock || 0,
        specifications: specifications || {},
        importantInfo: importantInfo || '',
        images: imageUrls,
    });

    const populated = await product.populate('category', 'name slug');

    res.status(201).json({
        status: 'success',
        data: populated,
    });
});

// @desc    Cập nhật sản phẩm (Admin)
// @route   PUT /api/products/:id
const updateProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    const allowedFields = ['name', 'price', 'description', 'category', 'stock', 'specifications', 'importantInfo'];
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            product[field] = req.body[field];
        }
    });

    // --- Xử lý ảnh ---
    // Frontend gửi `existingImages` là JSON string chứa danh sách URL ảnh cũ muốn GIỮ LẠI.
    // Nếu không gửi, giữ nguyên mảng ảnh cũ (backward compatible).
    let baseImages = product.images;
    if (req.body.existingImages !== undefined) {
        try {
            baseImages = JSON.parse(req.body.existingImages);
        } catch {
            baseImages = product.images;
        }
    }

    // Nếu có ảnh mới, upload lên Cloudinary và nối vào danh sách base
    let newUrls = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file) =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'lightstore/products' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer);
            })
        );
        newUrls = await Promise.all(uploadPromises);
    }

    product.images = [...baseImages, ...newUrls];

    await product.save();
    const populated = await product.populate('category', 'name slug');

    res.json({
        status: 'success',
        data: populated,
    });
});

// @desc    Xóa sản phẩm (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Đã xóa sản phẩm thành công',
    });
});

// @desc    Lấy sản phẩm liên quan
// @route   GET /api/products/:id/related
const getRelatedProducts = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
    }).limit(4);

    res.json({
        status: 'success',
        data: relatedProducts
    });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getRelatedProducts };
