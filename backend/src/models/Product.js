const mongoose = require('mongoose');

// Sub-schema cho từng dòng thông số kỹ thuật
const specificationSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false } // Không cần _id cho từng mục
);

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

        // --- Chi tiết sản phẩm ---
        brand: {
            type: String,
            trim: true,
            default: '',
        },
        // Thông số kỹ thuật — mảng object có thứ tự
        // Ví dụ: [{ key: "Công suất", value: "18W" }, { key: "Điện áp", value: "220V" }]
        specifications: {
            type: [specificationSchema],
            default: [],
        },
        warranty: {
            type: String,
            trim: true,
            default: '',
        },
        usage: {
            type: String,
            trim: true,
            default: '',
        },
        importantInfo: {
            type: String,
            trim: true,
            default: '',
        },
        weight: {
            type: String,
            trim: true,
            default: '',
        },
        dimensions: {
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
