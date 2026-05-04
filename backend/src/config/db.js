const mongoose = require('mongoose');
require('dotenv').config();

// Lấy URI từ file .env
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI không được tìm thấy trong file .env');
    process.exit(1);
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            // Các option tối ưu cho MongoDB Atlas
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
        });

        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB Atlas:', error.message);
        process.exit(1); // Thoát chương trình nếu kết nối thất bại
    }
};

module.exports = connectDB;