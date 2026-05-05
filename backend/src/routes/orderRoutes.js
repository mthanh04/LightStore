const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getMyOrders, updateOrderStatus, getOrderById, cancelOrder, deleteOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API quản lý đơn hàng
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     description: Khách vãng lai không cần token. User đăng nhập thì token sẽ được gắn vào user field.
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - shippingAddress
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: 665f1a2b3c4d5e6f7a8b9c0d
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                     example: Nguyen Van A
 *                   phone:
 *                     type: string
 *                     example: "0912345678"
 *                   address:
 *                     type: string
 *                     example: "123 Đường ABC, Quận 1, TP.HCM"
 *     responses:
 *       201:
 *         description: Đặt hàng thành công, trả về mã đơn hàng
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc hết hàng
 */
// Cho phép cả khách vãng lai (không bắt buộc token)
// Dùng middleware "optionalProtect" - tự xử lý trong controller nếu user là null
router.post('/', (req, res, next) => {
    // Thử xác thực token nếu có, nhưng không bắt lỗi nếu không có
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return protect(req, res, next);
    }
    next(); // Bỏ qua xác thực nếu không có token → khách vãng lai
}, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Xem tất cả đơn hàng (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng + phân trang
 */
router.get('/', protect, admin, getAllOrders);

/**
 * @swagger
 * /api/orders/myorders:
 *   get:
 *     summary: Xem lịch sử đơn hàng của user đang đăng nhập
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của user
 */
router.get('/myorders', protect, getMyOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled]
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.put('/:id/status', protect, admin, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng (Admin hoặc chính user)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 */
router.get('/:id', protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Hủy đơn hàng (User)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Đã hủy đơn hàng
 *       400:
 *         description: Trạng thái không hợp lệ để hủy
 */
router.put('/:id/cancel', protect, cancelOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Xóa đơn hàng (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
