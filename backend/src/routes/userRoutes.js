const express = require('express');
const router = express.Router();
const { toggleWishlist, getWishlist, updateProfile } = require('../controllers/userController');
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

router.put('/profile', protect, updateProfile);

module.exports = router;
