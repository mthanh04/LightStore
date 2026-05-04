# 📂 CẤU TRÚC THƯ MỤC DỰ ÁN LIGHTSTORE

Tài liệu này mô tả chi tiết cách tổ chức các thư mục và file cho cả Backend và Frontend của hệ thống LightStore. Việc tổ chức thư mục tốt giúp dự án dễ dàng mở rộng, bảo trì và làm việc nhóm hiệu quả.

---

## 1. 🖥️ FRONTEND (ReactJS + Vite + TypeScript)

Cấu trúc tiêu chuẩn áp dụng cho dự án React quy mô vừa/lớn, chia theo tính năng (Feature-based) hoặc vai trò (Role-based).

```text
frontend/
│
├── public/                 # Các file tĩnh (favicon.ico, robots.txt, logo.png...)
│
├── src/                    # Chứa toàn bộ source code của Frontend
│   │
│   ├── assets/             # Hình ảnh tĩnh, icon, font chữ nội bộ của dự án
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/         # Các UI components dùng chung (Dumb/Presentational Components)
│   │   ├── common/         # Button, Input, Modal, LoadingSpinner...
│   │   ├── layout/         # Header, Footer, Sidebar...
│   │   └── product/        # ProductCard, Pagination...
│   │
│   ├── contexts/           # React Context (nếu không dùng Redux/Zustand) để share state
│   │
│   ├── hooks/              # Custom hooks tái sử dụng logic
│   │   ├── useAuth.ts      # Xử lý logic đăng nhập/đăng xuất
│   │   ├── useCart.ts      # Logic quản lý giỏ hàng
│   │   └── useFetch.ts     # Wrapper cho việc gọi API
│   │
│   ├── layouts/            # Chứa các component bao bọc trang (Layouts)
│   │   ├── MainLayout.tsx  # Layout cho khách (có Header, Footer)
│   │   └── AdminLayout.tsx # Layout cho admin (có Sidebar trái)
│   │
│   ├── pages/              # Chứa các component đại diện cho từng trang (Page/Container Components)
│   │   ├── Home/           # Trang chủ (Hero, Banner)
│   │   ├── Shop/           # Trang danh sách sản phẩm
│   │   ├── ProductDetail/  # Trang chi tiết 1 sản phẩm
│   │   ├── Cart/           # Giỏ hàng và Checkout
│   │   ├── Auth/           # Login / Register
│   │   └── Admin/          # Các trang quản trị (Dashboard, Products, Orders)
│   │
│   ├── routes/             # Cấu hình định tuyến của ứng dụng (React Router)
│   │   ├── AppRoutes.tsx   # Danh sách các Route
│   │   └── ProtectedRoute.tsx # Route cần đăng nhập mới vào được
│   │
│   ├── services/           # Chứa logic gọi API (Axios instance)
│   │   ├── api.ts          # Cấu hình Axios (BaseURL, Interceptors đính kèm Token)
│   │   ├── authService.ts  # API login, register
│   │   └── productService.ts # API CRUD sản phẩm
│   │
│   ├── store/              # State management toàn cục (Zustand hoặc Redux Toolkit)
│   │   ├── authStore.ts    # Lưu thông tin User
│   │   └── cartStore.ts    # Lưu danh sách sản phẩm trong giỏ
│   │
│   ├── types/              # Định nghĩa các Interfaces/Types của TypeScript
│   │   ├── product.type.ts # Giao diện dữ liệu cho Product
│   │   └── user.type.ts    # Giao diện dữ liệu cho User
│   │
│   ├── utils/              # Các hàm tiện ích (Helpers)
│   │   ├── formatCurrency.ts # Hàm chuyển đổi số sang tiền (VNĐ)
│   │   └── formatDate.ts   # Hàm format ngày tháng
│   │
│   ├── App.tsx             # Component gốc của ứng dụng (Bọc Provider, Router)
│   ├── index.css           # Cấu hình Tailwind CSS, biến CSS toàn cục
│   └── main.tsx            # Điểm entry point khởi chạy React
│
├── .env                    # Biến môi trường (VITE_API_URL,...)
├── package.json            # Chứa thông tin cấu hình và các thư viện cần cài đặt
├── tailwind.config.js      # Cấu hình màu sắc, theme cho Tailwind
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite (build tool)
```

---

## 2. ⚙️ BACKEND (Node.js + Express + MongoDB)

Cấu trúc thiết kế theo mô hình **MVC (Model - View - Controller)** kết hợp với chia lớp (Layered Architecture).

```text
backend/
│
├── public/                 # Chứa các file tĩnh nếu server cần serve ảnh/file (tuỳ chọn)
│
├── src/                    # Chứa toàn bộ logic của hệ thống Backend
│   │
│   ├── config/             # Cấu hình kết nối DB, tích hợp các dịch vụ bên thứ 3
│   │   ├── db.js           # Kết nối MongoDB (Mongoose)
│   │   └── cloudinary.js   # Cấu hình Cloudinary API Keys
│   │
│   ├── controllers/        # Chứa logic xử lý Request/Response (C)
│   │   ├── authController.js    # Logic Login/Register
│   │   ├── productController.js # Logic CRUD sản phẩm, phân trang
│   │   ├── orderController.js   # Logic đặt hàng
│   │   └── categoryController.js # Logic danh mục
│   │
│   ├── middlewares/        # Các hàm can thiệp vào giữa Request và Controller
│   │   ├── authMiddleware.js    # Verify JWT Token
│   │   ├── adminMiddleware.js   # Check quyền Admin
│   │   ├── errorMiddleware.js   # Gom lỗi Global
│   │   └── uploadMiddleware.js  # Xử lý form-data file (Multer)
│   │
│   ├── models/             # Định nghĩa Database Schema (M)
│   │   ├── User.js         # Mongoose Schema cho người dùng
│   │   ├── Product.js      # Mongoose Schema cho sản phẩm
│   │   ├── Order.js        # Mongoose Schema cho đơn hàng
│   │   └── Category.js     # Mongoose Schema cho danh mục
│   │
│   ├── routes/             # Định nghĩa API Endpoints và gán cho Controllers phù hợp
│   │   ├── authRoutes.js   # '/api/auth/...'
│   │   ├── productRoutes.js# '/api/products/...'
│   │   ├── orderRoutes.js  # '/api/orders/...'
│   │   └── index.js        # File tổng hợp tất cả route lại
│   │
│   ├── services/           # (Tùy chọn) Chứa Business Logic phức tạp tách ra từ Controller
│   │   └── uploadService.js# Chứa logic upload ảnh qua Cloudinary
│   │
│   ├── utils/              # Các tiện ích dùng chung
│   │   ├── generateToken.js# Hàm tạo JWT
│   │   ├── AppError.js     # Class xử lý lỗi tùy chỉnh
│   │   └── catchAsync.js   # Bọc try/catch cho các hàm async
│   │
│   └── server.js           # File khởi chạy Express App, mount routes, handle lỗi cuối cùng
│
├── .env                    # Biến môi trường bảo mật (PORT, MONGO_URI, JWT_SECRET, CLOUDINARY_URL)
├── package.json            # Chứa script chạy ứng dụng và danh sách thư viện
└── .gitignore              # Bỏ qua node_modules, .env khi push lên Git
```
