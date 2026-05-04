const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/adminController');

/**
 * @swagger
 * tags:
 *   name: Admin - Users
 *   description: API quản lý người dùng (chỉ Admin)
 */

// Tất cả route dưới đây đều yêu cầu đăng nhập + quyền Admin
router.use(protect, admin);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách tất cả user (phân trang, tìm kiếm)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số user mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm theo tên hoặc email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Lọc theo vai trò
 *     responses:
 *       200:
 *         description: Danh sách user với phân trang
 *       403:
 *         description: Không có quyền Admin
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user (đổi role)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID của user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Không thể tự hạ cấp chính mình
 *       404:
 *         description: Không tìm thấy user
 */
router.put('/users/:id', updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Xóa tài khoản user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID của user
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       400:
 *         description: Không thể tự xóa chính mình
 *       404:
 *         description: Không tìm thấy user
 */
router.delete('/users/:id', deleteUser);

module.exports = router;
