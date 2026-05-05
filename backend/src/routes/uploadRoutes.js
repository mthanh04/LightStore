const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const upload = require('../middlewares/uploadMiddleware');
const { protect, admin } = require('../middlewares/authMiddleware');
const catchAsync = require('../utils/catchAsync');

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API upload ảnh lên Cloudinary
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload ảnh lên Cloudinary (Admin)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Trả về mảng URL ảnh an toàn (secure_url)
 *       400:
 *         description: Không có file hoặc file không hợp lệ
 */
router.post(
    '/',
    protect,
    admin,
    upload.array('images', 10),
    catchAsync(async (req, res, next) => {
        if (!req.files || req.files.length === 0) {
            const AppError = require('../utils/AppError');
            return next(new AppError('Vui lòng chọn ít nhất 1 file ảnh', 400));
        }

        // Stream từng file lên Cloudinary
        const uploadPromises = req.files.map(
            (file) =>
                new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'lightstore/products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(file.buffer);
                })
        );

        const urls = await Promise.all(uploadPromises);

        res.json({
            status: 'success',
            data: urls,
        });
    })
);

module.exports = router;
