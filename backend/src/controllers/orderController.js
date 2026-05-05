const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
const createOrder = catchAsync(async (req, res, next) => {
    const { orderItems, shippingAddress } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return next(new AppError('Đơn hàng phải có ít nhất 1 sản phẩm', 400));
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
        return next(new AppError('Vui lòng nhập đầy đủ thông tin giao hàng', 400));
    }

    // Lấy giá từ DB (không tin giá frontend gửi lên → chống fake giá)
    const productIds = orderItems.map((item) => item.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    // Kiểm tra tồn kho & tính tổng tiền từ DB
    const validatedItems = [];
    let totalPrice = 0;

    for (const item of orderItems) {
        const dbProduct = dbProducts.find((p) => p._id.toString() === item.product.toString());

        if (!dbProduct) {
            return next(new AppError(`Sản phẩm với id "${item.product}" không tồn tại`, 404));
        }
        if (dbProduct.stock < item.quantity) {
            return next(
                new AppError(
                    `Sản phẩm "${dbProduct.name}" chỉ còn ${dbProduct.stock} trong kho`,
                    400
                )
            );
        }

        validatedItems.push({
            product: dbProduct._id,
            name: dbProduct.name,
            quantity: item.quantity,
            price: dbProduct.price, // Giá lấy từ DB
            image: dbProduct.images[0] || '',
        });

        totalPrice += dbProduct.price * item.quantity;
    }

    // Tạo đơn hàng
    const order = await Order.create({
        user: req.user ? req.user._id : null, // null nếu là khách vãng lai
        orderItems: validatedItems,
        shippingAddress,
        totalPrice,
    });

    // Giảm tồn kho của các sản phẩm
    const stockUpdatePromises = validatedItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
    );
    await Promise.all(stockUpdatePromises);

    res.status(201).json({
        status: 'success',
        data: order,
    });
});

// @desc    Admin xem tất cả đơn hàng (có phân trang, lọc theo status)
// @route   GET /api/orders
const getAllOrders = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
        filter.status = req.query.status;
    }

    const [orders, totalItems] = await Promise.all([
        Order.find(filter)
            .populate('user', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        Order.countDocuments(filter),
    ]);

    res.json({
        status: 'success',
        data: orders,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
        },
    });
});

// @desc    User xem lịch sử đơn hàng của chính mình
// @route   GET /api/orders/myorders
const getMyOrders = catchAsync(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
        status: 'success',
        results: orders.length,
        data: orders,
    });
});

// @desc    Admin cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
        return next(new AppError(`Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`, 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    order.status = status;
    await order.save();

    res.json({
        status: 'success',
        data: order,
    });
});

// @desc    Lấy chi tiết 1 đơn hàng (Admin/User)
// @route   GET /api/orders/:id
const getOrderById = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    // Nếu không phải admin thì chỉ được xem đơn của chính mình
    if (req.user.role !== 'admin' && order.user && order.user._id.toString() !== req.user._id.toString()) {
        return next(new AppError('Bạn không có quyền xem đơn hàng này', 403));
    }

    res.json({
        status: 'success',
        data: order,
    });
});

// @desc    User tự hủy đơn hàng
// @route   PUT /api/orders/:id/cancel
const cancelOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    if (order.user && order.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }

    if (order.status !== 'Pending') {
        return next(new AppError('Chỉ có thể hủy đơn hàng ở trạng thái Chờ xử lý (Pending)', 400));
    }

    order.status = 'Cancelled';
    await order.save();

    // Hoàn lại stock (tồn kho)
    const stockUpdatePromises = order.orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    );
    await Promise.all(stockUpdatePromises);

    res.json({
        status: 'success',
        message: 'Đã hủy đơn hàng thành công',
        data: order,
    });
});

// @desc    Admin xóa đơn hàng
// @route   DELETE /api/orders/:id
const deleteOrder = catchAsync(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return next(new AppError('Không tìm thấy đơn hàng', 404));
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Đã xóa đơn hàng thành công',
    });
});

module.exports = { createOrder, getAllOrders, getMyOrders, updateOrderStatus, getOrderById, cancelOrder, deleteOrder };
