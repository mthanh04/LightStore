const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Helper: Tái cấu trúc giỏ hàng thành định dạng response (có thông tin product chi tiết)
const formatCartResponse = async (cart) => {
    if (!cart) return [];
    
    // Populate product
    await cart.populate('items.product', 'name price images stock');
    
    // Format thành mảng giống localStorage
    return cart.items
        .filter(item => item.product !== null) // Loại bỏ nếu product bị xóa khỏi DB
        .map(item => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.images[0] || '',
            stock: item.product.stock,
            quantity: item.quantity
        }));
};

// @desc    Lấy giỏ hàng của user hiện tại
// @route   GET /api/cart
const getCart = catchAsync(async (req, res, next) => {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const formattedCart = await formatCartResponse(cart);

    res.json({
        status: 'success',
        data: formattedCart,
    });
});

// @desc    Đồng bộ giỏ hàng từ localStorage lên server
// @route   POST /api/cart/sync
const syncCart = catchAsync(async (req, res, next) => {
    const { items: localItems } = req.body; // Mảng CartItem từ localStorage

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    if (!localItems || !Array.isArray(localItems)) {
        return res.json({ status: 'success', data: await formatCartResponse(cart) });
    }

    // Merge logic: Giữ các item trên server, cập nhật/thêm các item từ local.
    // Nếu có cùng _id, lấy quantity ở local
    const serverItemsMap = new Map(cart.items.map(i => [i.product.toString(), i.quantity]));

    for (const localItem of localItems) {
        const productId = localItem._id;
        const quantity = localItem.quantity;

        // Chỉ thêm/cập nhật nếu product hợp lệ trong DB
        const productExists = await Product.exists({ _id: productId });
        if (productExists) {
            serverItemsMap.set(productId, quantity);
        }
    }

    // Convert map về dạng array cho cart.items
    cart.items = Array.from(serverItemsMap.entries()).map(([productId, quantity]) => ({
        product: productId,
        quantity: quantity
    }));

    await cart.save();

    res.json({
        status: 'success',
        data: await formatCartResponse(cart),
    });
});

// @desc    Thêm sản phẩm vào giỏ
// @route   POST /api/cart
const addToCart = catchAsync(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
        // Tăng số lượng (giới hạn theo stock)
        const newQuantity = cart.items[itemIndex].quantity + quantity;
        cart.items[itemIndex].quantity = Math.min(newQuantity, product.stock);
    } else {
        // Thêm mới
        cart.items.push({
            product: productId,
            quantity: Math.min(quantity, product.stock)
        });
    }

    await cart.save();

    res.status(201).json({
        status: 'success',
        data: await formatCartResponse(cart),
    });
});

// @desc    Cập nhật số lượng sản phẩm trong giỏ
// @route   PUT /api/cart/:productId
const updateCartItem = catchAsync(async (req, res, next) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
        return next(new AppError('Số lượng tối thiểu là 1', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Không tìm thấy sản phẩm', 404));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return next(new AppError('Giỏ hàng trống', 404));
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity = Math.min(quantity, product.stock);
        await cart.save();
    }

    res.json({
        status: 'success',
        data: await formatCartResponse(cart),
    });
});

// @desc    Xóa 1 sản phẩm khỏi giỏ
// @route   DELETE /api/cart/:productId
const removeCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        return res.json({ status: 'success', data: [] });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    res.json({
        status: 'success',
        data: await formatCartResponse(cart),
    });
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/cart
const clearCart = catchAsync(async (req, res, next) => {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.json({
        status: 'success',
        data: [],
    });
});

module.exports = {
    getCart,
    syncCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};
