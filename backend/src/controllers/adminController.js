const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Lấy danh sách tất cả user (có phân trang, tìm kiếm)
// @route   GET /api/admin/users
const getAllUsers = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = {};
    if (req.query.search) {
        searchQuery.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ];
    }
    if (req.query.role) searchQuery.role = req.query.role;

    const [users, total] = await Promise.all([
        User.find(searchQuery).skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(searchQuery),
    ]);

    res.json({
        status: 'success',
        results: users.length,
        pagination: { currentPage: page, totalPages: Math.ceil(total / limit), totalItems: total },
        data: users,
    });
});

// @desc    Admin cập nhật role user
// @route   PUT /api/admin/users/:id
const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
        return next(new AppError('Bạn không thể tự hạ cấp quyền Admin của chính mình', 400));
    }

    const allowedFields = ['name', 'role'];
    const updateData = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) updateData[field] = req.body[field]; });

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ status: 'success', data: updatedUser });
});

// @desc    Admin xóa tài khoản user
// @route   DELETE /api/admin/users/:id
const deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Không tìm thấy người dùng', 404));
    if (user._id.toString() === req.user._id.toString()) {
        return next(new AppError('Bạn không thể xóa tài khoản của chính mình', 400));
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ status: 'success', message: 'Đã xóa tài khoản thành công' });
});

// @desc    Lấy thống kê dashboard (Admin) — đầy đủ cho biểu đồ
// @route   GET /api/admin/dashboard
const getDashboardStats = catchAsync(async (req, res, next) => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // ── 1. Tổng quan ────────────────────────────────────────────────────────
    const [allOrders, totalUsers, totalProducts] = await Promise.all([
        Order.find().populate('orderItems.product', 'category'),
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
    ]);

    const validOrders = allOrders.filter(o => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((s, o) => s + o.totalPrice, 0);
    const totalOrders = allOrders.length;

    // So sánh kỳ trước (30 ngày gần đây vs 30 ngày trước đó)
    const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
    const d60 = new Date(now); d60.setDate(d60.getDate() - 60);

    const ordersThisPeriod  = allOrders.filter(o => new Date(o.createdAt) >= d30);
    const ordersPrevPeriod  = allOrders.filter(o => new Date(o.createdAt) >= d60 && new Date(o.createdAt) < d30);
    const revThis  = ordersThisPeriod.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0);
    const revPrev  = ordersPrevPeriod.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.totalPrice, 0);

    const usersThisPeriod = await User.countDocuments({ createdAt: { $gte: d30 } });
    const usersPrevPeriod = await User.countDocuments({ createdAt: { $gte: d60, $lt: d30 } });

    const pct = (cur, prev) => prev === 0 ? (cur > 0 ? 100 : 0) : parseFloat(((cur - prev) / prev * 100).toFixed(1));

    // ── 2. Đơn hàng theo trạng thái ─────────────────────────────────────────
    const statusMap = { Delivered: 0, Shipped: 0, Pending: 0, Cancelled: 0, Processing: 0 };
    allOrders.forEach(o => { if (statusMap[o.status] !== undefined) statusMap[o.status]++; });

    // ── 3. Doanh thu theo ngày (30 ngày gần nhất) ────────────────────────────
    const dailyMap = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        dailyMap[key] = 0;
    }
    validOrders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d >= d30) {
            const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (dailyMap[key] !== undefined) dailyMap[key] += o.totalPrice;
        }
    });
    const dailyRevenue = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue }));

    // ── 4. Doanh thu theo tháng — năm nay vs năm trước ─────────────────────
    const monthlyThis  = Array(12).fill(0);
    const monthlyPrev  = Array(12).fill(0);
    allOrders.forEach(o => {
        if (o.status === 'Cancelled') return;
        const d = new Date(o.createdAt);
        const y = d.getFullYear();
        const m = d.getMonth(); // 0-11
        if (y === currentYear)     monthlyThis[m] += o.totalPrice;
        if (y === currentYear - 1) monthlyPrev[m] += o.totalPrice;
    });
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
        month: `T${i + 1}`,
        current: monthlyThis[i],
        prev: monthlyPrev[i],
    }));

    // ── 5. Doanh thu theo danh mục ──────────────────────────────────────────
    const categories = await Category.find().select('name');
    const catRevenueMap = {};
    categories.forEach(c => { catRevenueMap[c._id.toString()] = { name: c.name, revenue: 0 }; });
    catRevenueMap['other'] = { name: 'Khác', revenue: 0 };

    validOrders.forEach(o => {
        o.orderItems.forEach(item => {
            const catId = item.product?.category?.toString();
            if (catId && catRevenueMap[catId]) catRevenueMap[catId].revenue += item.price * item.quantity;
            else catRevenueMap['other'].revenue += item.price * item.quantity;
        });
    });
    const revenueByCategory = Object.values(catRevenueMap)
        .filter(c => c.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);

    // ── 6. Top sản phẩm bán chạy ────────────────────────────────────────────
    const productSales = {};
    validOrders.forEach(o => {
        o.orderItems.forEach(item => {
            const pid = item.product?._id?.toString() || item.product?.toString();
            if (!pid) return;
            if (!productSales[pid]) productSales[pid] = { name: item.name, image: item.image, quantity: 0, revenue: 0 };
            productSales[pid].quantity += item.quantity;
            productSales[pid].revenue  += item.price * item.quantity;
        });
    });
    const topProducts = Object.entries(productSales)
        .map(([id, v]) => ({ _id: id, ...v }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    // ── 7. Khách hàng mới nhất ──────────────────────────────────────────────
    const recentUsers = await User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt');

    // ── 8. Sản phẩm sắp hết hàng ────────────────────────────────────────────
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } }).select('name stock price');

    res.json({
        status: 'success',
        data: {
            // Stat cards
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            // Trends
            revenueTrend:  pct(revThis, revPrev),
            ordersTrend:   pct(ordersThisPeriod.length, ordersPrevPeriod.length),
            usersTrend:    pct(usersThisPeriod, usersPrevPeriod),
            // Charts
            ordersByStatus: statusMap,
            dailyRevenue,
            monthlyRevenue,
            revenueByCategory,
            topProducts,
            recentUsers,
            lowStockProducts,
        },
    });
});

module.exports = { getAllUsers, updateUser, deleteUser, getDashboardStats };
