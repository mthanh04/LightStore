const express = require('express');
const router = express.Router();

// Import các file routes khác ở đây khi cần
// const productRoutes = require('./productRoutes');
// const authRoutes = require('./authRoutes');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Kiểm tra trạng thái server
 *     description: Trả về trạng thái hoạt động của server
 *     responses:
 *       200:
 *         description: Server hoạt động bình thường
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
  });
});

// Sử dụng các routes khác
// router.use('/products', productRoutes);
// router.use('/auth', authRoutes);

module.exports = router;
