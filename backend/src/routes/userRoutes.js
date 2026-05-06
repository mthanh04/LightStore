const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API Quản lý tài khoản (Wishlist)
 */

/**
 * @swagger
 * /api/users/wishlist:
 *   get:
 *     summary: Lấy danh sách sản phẩm yêu thích
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm trong wishlist
 *       401:
 *         description: Chưa đăng nhập
 */
router.get('/wishlist', protect, getWishlist);

/**
 * @swagger
 * /api/users/wishlist:
 *   post:
 *     summary: Thêm hoặc xóa sản phẩm khỏi danh sách yêu thích (Toggle)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thao tác thành công
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.post('/wishlist', protect, toggleWishlist);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Cập nhật thông tin cá nhân
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
router.put('/profile', protect, updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Thay đổi mật khẩu
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công, trả về token mới
 *       400:
 *         description: Mật khẩu cũ không đúng
 */
router.put('/change-password', protect, changePassword);

module.exports = router;
