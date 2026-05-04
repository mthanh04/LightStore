# 🎨 HỆ THỐNG WEBSITE BÁN ĐÈN (LightStore) - FRONTEND PLAN

## 1. Tổng quan công nghệ
- **Framework**: ReactJS (Vite)
- **Ngôn ngữ**: TypeScript (đảm bảo type safety, code rõ ràng).
- **Styling**: Tailwind CSS (Thiết kế nhanh, nhất quán, hỗ trợ Responsive cực tốt).
- **Icons**: Heroicons (Icon SVG nhẹ, đẹp, dễ tùy chỉnh bằng class Tailwind).
- **State Management**: Zustand hoặc Redux Toolkit (quản lý Giỏ hàng, User Session).
- **Routing**: React Router DOM v6.
- **Data Fetching**: Axios hoặc React Query (SWR).

## 2. Giao diện và Thiết kế (UI/UX)
- **Phong cách**: Hiện đại, sang trọng, tập trung vào hình ảnh sản phẩm rực rỡ (tận dụng ảnh Cloudinary).
- **Màu sắc chủ đạo**: Nền trắng sáng hoặc tông tối (Dark Mode) huyền bí để làm nổi bật ánh sáng của đèn. Màu nhấn (Primary) có thể là Vàng ấm (Amber) hoặc Cam nhẹ.
- **Hiệu ứng (Animations)**: Hover nâng sản phẩm lên, chuyển cảnh mượt mà, Toast notification khi thêm vào giỏ.

## 3. Cấu trúc Component & Các Trang

### 3.1. Các Components dùng chung (Shared)
- `Header/Navbar`: Logo, Menu điều hướng, Thanh tìm kiếm, Nút Giỏ hàng (kèm badge hiển thị số lượng), Nút Đăng nhập/Avatar.
- `Footer`: Thông tin liên hệ, links, chính sách.
- `ProductCard`: Box hiển thị 1 sản phẩm. Chứa: Ảnh (với hover zoom nhẹ), Tên, Giá, và nút Add to Cart.
- `Pagination`: Thanh phân trang.
- `Button, Input`: Các UI elements được style sẵn bằng Tailwind.

### 3.2. Landing Page (Trang chủ)
- **Hero Banner**: Slider hoặc hình ảnh full width hiển thị không gian nội thất có dùng đèn cực đẹp. Đi kèm Call-to-action (CTA) "Khám phá ngay".
- **Featured Categories**: Các khối hình ảnh danh mục (Đèn trần, Đèn bàn, Đèn trang trí) - Dùng Grid layout.
- **Trending Products**: Hiển thị 4-8 sản phẩm bán chạy nhất bằng `ProductCard`.
- **Why Choose Us**: Icon Heroicons (Shipping nhanh, Bảo hành, Chất lượng cao).

### 3.3. Shop Page (Danh sách sản phẩm)
- **Layout**: Sidebar bên trái (Lọc/Danh mục), Danh sách sản phẩm bên phải.
- **Sidebar**:
  - Filter theo danh mục (Radio/Checkbox).
  - Filter theo khoảng giá.
- **Top Bar**: Dropdown sắp xếp (Giá tăng/giảm, Mới nhất) và text tìm kiếm.
- **Product Grid**: Render danh sách `ProductCard` (có Responsive: mobile 2 cột, desktop 4 cột).
- **Pagination Area**: Render các nút số trang. Khi click sẽ thay đổi tham số URL (VD: `?page=2`) và gọi API lấy data mới.

### 3.4. Product Detail Page (Chi tiết sản phẩm)
- Khối trái: Thư viện ảnh (Main image to, các thumbnail nhỏ bên dưới).
- Khối phải:
  - Tên, Giá sản phẩm.
  - Trạng thái kho (Còn hàng / Hết hàng).
  - Bộ đếm số lượng (+ / -).
  - Nút "Thêm vào giỏ" & "Mua ngay".
  - Tab mô tả chi tiết sản phẩm.

### 3.5. Cart & Checkout (Giỏ hàng & Đặt hàng)
- **Cart Sidebar/Page**: Hiển thị List các item. Có nút Xóa, tăng giảm số lượng. Tính tổng tiền.
- **Checkout Page**: Form điền Tên, Số điện thoại, Địa chỉ giao hàng. Nút "Xác nhận đặt hàng". Sau khi thành công hiện màn hình "Cảm ơn".

### 3.6. Admin Dashboard (Quản trị viên)
- Route riêng bảo vệ (`/admin/*`). Layout gồm Sidebar trái và Content phải.
- **Product Management**: Table chứa danh sách sản phẩm.
  - Nút **Add Product**: Mở Modal form nhập liệu và ô Input Type File để chọn ảnh.
  - Hiển thị ảnh thu nhỏ trong bảng.
- **Category Management**: Quản lý danh mục.
- **Order Management**: Xem danh sách các đơn đặt hàng mới.

## 4. Luồng hoạt động chính của Frontend

### Luồng 1: Xử lý hiển thị danh sách có phân trang
1. User vào trang `/shop`.
2. `useEffect` lấy tham số `page` từ URL (mặc định 1).
3. Gửi Axios GET request tới Backend: `/api/products?page=1&limit=8`.
4. Nhận dữ liệu, lưu vào state `products`.
5. Render list sản phẩm ra UI. Render component `<Pagination totalPages={data.totalPages} currentPage={1} />`.
6. Khi user click trang 2, update URL thành `?page=2`, trigger lại quá trình fetch API.

### Luồng 2: Quản lý giỏ hàng (Local State)
1. User bấm "Thêm vào giỏ" ở `ProductCard`.
2. Action của Zustand/Redux được gọi. Nó kiểm tra xem sản phẩm đã có trong giỏ chưa.
  - Nếu có: Tăng `quantity` lên 1.
  - Nếu chưa: Push object `{id, name, price, quantity: 1, image}` vào mảng cart.
3. State thay đổi làm Badge trên Navbar update số (VD từ 0 -> 1).
4. Hiển thị thông báo Toast góc màn hình "Đã thêm thành công".
5. Dữ liệu Cart được tự động sync vào `localStorage` để không bị mất khi F5.

### Luồng 3: Upload ảnh phía Admin
1. Admin chọn ảnh trong form tạo sản phẩm.
2. File được giữ trong state (`const [file, setFile] = useState()`).
3. Khi bấm Submit, tạo `FormData` append file ảnh và các text field.
4. Gửi Axios POST với header `multipart/form-data` tới Backend.
5. Hiển thị Loading spinner trong lúc chờ Cloudinary xử lý.
6. Nhận kết quả thành công, refresh lại bảng danh sách.

## 5. Tổ chức thư mục dự án (Directory Structure)
```text
src/
 ┣ assets/         # Hình ảnh tĩnh nội bộ
 ┣ components/     # UI components (Header, Footer, ProductCard...)
 ┣ hooks/          # Custom hooks (useCart, useFetch...)
 ┣ layouts/        # Layout bọc ngoài (MainLayout, AdminLayout)
 ┣ pages/          # Các trang chính (Home, Shop, Cart, Dashboard...)
 ┣ services/       # File chứa các hàm gọi Axios API (api.ts, productApi.ts)
 ┣ store/          # File setup Zustand/Redux (cartStore.ts, authStore.ts)
 ┣ types/          # TypeScript interfaces/types
 ┣ utils/          # Các hàm helper format tiền tệ, ngày tháng
 ┗ App.tsx         # File cấu hình Routing
```
