const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: [1, 'Số lượng phải ít nhất là 1'] },
        price: { type: Number, required: true },
        image: { type: String, default: '' },
    },
    { _id: false } // Không cần _id riêng cho từng item
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // null = khách vãng lai
        },
        orderItems: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (arr) => arr.length > 0,
                message: 'Đơn hàng phải có ít nhất 1 sản phẩm',
            },
        },
        shippingAddress: {
            fullName: { type: String, required: [true, 'Vui lòng nhập họ tên người nhận'] },
            phone: { type: String, required: [true, 'Vui lòng nhập số điện thoại'] },
            address: { type: String, required: [true, 'Vui lòng nhập địa chỉ giao hàng'] },
        },
        totalPrice: {
            type: Number,
            required: true,
            min: [0, 'Tổng tiền không được âm'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
