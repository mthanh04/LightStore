const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên danh mục'],
            trim: true,
            unique: true,
            maxlength: [100, 'Tên danh mục không được quá 100 ký tự'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Tự động tạo slug từ name trước khi lưu
categorySchema.pre('save', async function () {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
