const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Xác thực người dùng (Đăng ký, Đăng nhập)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nva@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *     responses:
 *       201:
 *         description: Đăng ký thành công, trả về thông tin user + token
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc Email đã tồn tại
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     description: Trả về token + role để frontend phân hướng giao diện (admin → Dashboard, user → Trang chủ)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nva@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token + role
 *       401:
 *         description: Email hoặc mật khẩu không đúng
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng đang đăng nhập
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin user (name, email, role)
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 */
router.get('/me', protect, getMe);

module.exports = router;