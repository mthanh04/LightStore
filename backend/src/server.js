require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Import routes
const routes = require('./routes');

// Connect to database
connectDB();

const app = express();

// ============ BẢO MẬT ============
// Helmet: thiết lập các HTTP headers bảo mật
app.use(helmet({
    contentSecurityPolicy: false, // Tắt CSP để Swagger UI hoạt động bình thường
}));

// Rate Limiting: giới hạn 100 request / 15 phút / IP (chống brute-force, spam)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100,
    message: {
        status: 'fail',
        message: 'Quá nhiều request từ IP này. Vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// ============ MIDDLEWARES ============
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ SWAGGER UI ============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LightStore API Docs',
}));

// ============ ROUTES ============
app.use('/api', routes);

// Home route
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'LightStore API is running...',
        docs: '/api-docs',
    });
});

// ============ ERROR HANDLING ============
app.use(notFound);
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📄 Swagger docs available at http://localhost:${PORT}/api-docs`);
});
