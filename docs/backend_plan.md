# 📘 HỆ THỐNG WEBSITE BÁN ĐÈN (LightStore) - BACKEND PLAN

## 1. Tổng quan công nghệ
- **Ngôn ngữ & Framework**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Lưu trữ hình ảnh**: Cloudinary
- **Authentication**: JSON Web Token (JWT) & bcrypt cho mã hóa mật khẩu

## 2. Thiết kế Database (Mongoose Schemas)

### 2.1. Product Model (Sản phẩm)
- `name` (String): Tên đèn.
- `price` (Number): Giá sản phẩm.
- `description` (String): Mô tả chi tiết.
- `images` (Array of Strings): Mảng chứa các URL ảnh được upload từ Cloudinary.
- `category` (ObjectId): Tham chiếu đến Category.
- `stock` (Number): Số lượng tồn kho.
- `createdAt`, `updatedAt` (Timestamps).

### 2.2. Category Model (Danh mục)
- `name` (String): Tên danh mục (Đèn chùm, Đèn bàn, Đèn tường...).
- `slug` (String): Dùng cho URL thân thiện.

### 2.3. User Model (Người dùng)
- `name` (String): Tên người dùng.
- `email` (String): Email đăng nhập (Unique).
- `password` (String): Mật khẩu đã hash.
- `role` (String): `admin` hoặc `user` (Mặc định: `user`).

### 2.4. Order Model (Đơn hàng)
- `user` (ObjectId): Tham chiếu đến User (Nếu người dùng có đăng nhập, ngược lại có thể lưu null cho khách vãng lai).
- `orderItems` (Array): Danh sách sản phẩm mua gồm `product` (ObjectId), `name`, `quantity`, `price`, `image`.
- `shippingAddress` (Object): Thông tin người nhận gồm `fullName`, `phone`, `address`.
- `totalPrice` (Number): Tổng tiền đơn hàng.
- `status` (String): Trạng thái đơn (Pending, Processing, Shipped, Delivered).

## 3. Cấu trúc API Endpoints

### 3.1. Products (Sản phẩm)
- `GET /api/products`: Lấy danh sách sản phẩm. Hỗ trợ query: `?page=1&limit=8&category=id&search=keyword&sort=price_asc`. (Xử lý **Phân trang**, **Lọc**, **Tìm kiếm**).
- `GET /api/products/:id`: Lấy chi tiết 1 sản phẩm.
- `POST /api/products` (Admin): Thêm sản phẩm mới. (Gửi kèm file ảnh).
- `PUT /api/products/:id` (Admin): Sửa thông tin sản phẩm.
- `DELETE /api/products/:id` (Admin): Xóa sản phẩm.

### 3.2. Categories (Danh mục)
- `GET /api/categories`: Lấy toàn bộ danh mục.
- `POST /api/categories` (Admin): Thêm mới danh mục.
- `PUT /api/categories/:id` (Admin): Cập nhật danh mục.
- `DELETE /api/categories/:id` (Admin): Xóa danh mục.

### 3.3. Orders (Đơn hàng)
- `POST /api/orders`: Tạo đơn hàng mới. (Nhận data từ giỏ hàng frontend).
- `GET /api/orders` (Admin): Xem tất cả đơn hàng.
- `GET /api/orders/myorders` (User): Xem lịch sử mua hàng của user đang đăng nhập.

### 3.4. Upload (Cloudinary)
- `POST /api/upload`: API nhận file ảnh từ client thông qua thư viện `multer`, sau đó stream upload lên **Cloudinary** và trả về URL ảnh an toàn.

### 3.5. Authentication (Xác thực)
- `POST /api/auth/register`: Tạo tài khoản mới.
- `POST /api/auth/login`: Trả về JWT Token.

## 4. Luồng hoạt động chính của Backend

### Luồng 1: Admin thêm sản phẩm với ảnh
1. Client gọi API `POST /api/products` gửi kèm FormData (thông tin + file ảnh).
2. Middleware `multer` hứng file ảnh tạm thời.
3. Service Cloudinary xử lý đẩy file lên server Cloudinary.
4. Cloudinary trả về mảng URL chứa đường dẫn tĩnh của ảnh.
5. Controller lưu thông tin sản phẩm cùng URL ảnh vào MongoDB qua Mongoose.
6. Trả kết quả JSON về cho Frontend.

### Luồng 2: Khách hàng xem danh sách và phân trang
1. Client gọi `GET /api/products?page=2&limit=8&sort=-price`.
2. Controller parse query params.
3. Tính toán `skip = (page - 1) * limit`.
4. Gọi `Product.find().skip(skip).limit(8).sort({price: -1})` để truy vấn MongoDB.
5. Đếm tổng số lượng document bằng `Product.countDocuments()`.
6. Trả về cấu trúc JSON chứa `data` (mảng 8 sản phẩm), `totalItems`, `totalPages`, `currentPage`.

### Luồng 3: Xử lý đặt hàng
1. Client gửi `POST /api/orders` với mảng `orderItems` và `shippingAddress`.
2. Backend kiểm tra tồn kho của từng sản phẩm trong `orderItems`.
3. Tính toán `totalPrice` từ giá của DB (để tránh fake giá từ client).
4. Khởi tạo Document Order mới và lưu vào MongoDB.
5. Cập nhật giảm số lượng `stock` của các Product tương ứng.
6. Trả về mã đơn hàng.

## 5. Yêu cầu hệ thống và Kiến trúc
- Xây dựng theo mô hình **MVC** (Routes - Controllers - Models).
- Sử dụng **Middlewares**:
  - `authMiddleware`: Xác minh JWT Token hợp lệ hay không.
  - `adminMiddleware`: Kiểm tra `req.user.role === 'admin'`.
  - `errorMiddleware`: Xử lý gom lỗi (Global Error Handling).
- **Bảo mật**: Helmet, CORS hợp lý, Rate Limiting để chống Spam API.
