const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên sản phẩm'],
            trim: true,
            maxlength: [200, 'Tên sản phẩm không được quá 200 ký tự'],
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập giá sản phẩm'],
            min: [0, 'Giá sản phẩm không được âm'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        images: {
            type: [String], // Mảng URL ảnh từ Cloudinary
            default: [],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Vui lòng chọn danh mục'],
        },
        stock: {
            type: Number,
            required: [true, 'Vui lòng nhập số lượng tồn kho'],
            min: [0, 'Số lượng tồn kho không được âm'],
            default: 0,
        },
        specifications: {
            type: Map,
            of: String,
            default: {},
        },
        importantInfo: {
            type: String,
            trim: true,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Index để tìm kiếm nhanh theo tên
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
