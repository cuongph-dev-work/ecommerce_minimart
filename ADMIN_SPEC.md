# SPEC NGHIỆP VỤ ADMIN - ECOMMERCE MINIMART

## 1. TỔNG QUAN

Hệ thống admin cung cấp các chức năng quản lý toàn diện cho trang thương mại điện tử, đáp ứng các yêu cầu từ frontend bao gồm: trang chủ, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng, cửa hàng.

---

## 2. CÁC MODULE CHỨC NĂNG

### 2.1. DASHBOARD / THỐNG KÊ

**Mục đích:** Cung cấp cái nhìn tổng quan về hoạt động kinh doanh

**Chức năng:**
- Hiển thị thống kê tổng quan:
  - Tổng doanh thu (hôm nay, tháng này, năm này)
  - Tổng số đơn hàng
  - Tổng số sản phẩm
  - Tổng số khách hàng
  - Số lượng đơn hàng theo trạng thái (chờ xử lý, đang giao, hoàn thành, hủy)
- Biểu đồ doanh thu theo thời gian (ngày/tuần/tháng)
- Top sản phẩm bán chạy
- Đơn hàng mới nhất
- Cảnh báo: sản phẩm sắp hết hàng, đơn hàng chờ xử lý

---

### 2.2. QUẢN LÝ SẢN PHẨM

**Mục đích:** Quản lý toàn bộ sản phẩm trong hệ thống

**Chức năng:**

#### 2.2.1. Danh sách sản phẩm
- Hiển thị danh sách sản phẩm dạng bảng/Grid
- Tìm kiếm sản phẩm (theo tên, SKU, thương hiệu)
- Lọc sản phẩm (theo danh mục, thương hiệu, trạng thái, giá)
- Sắp xếp (theo tên, giá, ngày tạo, số lượng bán)
- Phân trang

#### 2.2.2. Thêm/Sửa sản phẩm
**Thông tin cơ bản:**
- Tên sản phẩm (bắt buộc)
- Mô tả ngắn
- Mô tả chi tiết (rich text editor)
- Danh mục (chọn từ danh sách)
- Thương hiệu (Brand)
- SKU/Mã sản phẩm (tự động hoặc nhập thủ công)
- Giá gốc (bắt buộc)
- Giá khuyến mãi (nếu có)
- Số lượng tồn kho (Stock)
- Trạng thái (Đang bán / Ngừng bán / Hết hàng)

**Hình ảnh:**
- Upload ảnh chính (1 ảnh)
- Upload ảnh phụ (nhiều ảnh, có thể sắp xếp thứ tự)
- Xóa ảnh
- Preview ảnh

**Cài đặt hiển thị:**
- Sản phẩm nổi bật (Featured) - checkbox
- Tham gia Flash Sale - checkbox
- Thứ tự hiển thị (Sort order)

**Thông tin bổ sung:**
- Đánh giá trung bình (tự động tính từ reviews)
- Số lượt đánh giá
- Số lượng đã bán (tự động cập nhật)

#### 2.2.3. Xóa sản phẩm
- Xóa một sản phẩm
- Xóa nhiều sản phẩm (bulk delete)
- Cảnh báo trước khi xóa

#### 2.2.4. Nhập/Xuất sản phẩm
- Export danh sách sản phẩm ra Excel/CSV
- Import sản phẩm từ Excel/CSV
- Template mẫu để download

---

### 2.3. QUẢN LÝ DANH MỤC

**Mục đích:** Quản lý các danh mục sản phẩm và cấu trúc phân cấp

**Chức năng:**

#### 2.3.1. Danh sách danh mục
- Hiển thị dạng tree/cây phân cấp hoặc grid
- Hiển thị thông tin:
  - Tên danh mục
  - Icon (preview)
  - Số lượng sản phẩm (tự động đếm)
  - Số lượng danh mục con (subcategories)
  - Trạng thái (Hiển thị / Ẩn)
  - Thứ tự hiển thị
- Tìm kiếm danh mục (theo tên)
- Lọc theo trạng thái
- Sắp xếp (theo tên, thứ tự, số lượng sản phẩm)
- Kéo thả để sắp xếp thứ tự (drag & drop)

#### 2.3.2. Thêm/Sửa danh mục
**Thông tin cơ bản:**
- Tên danh mục (bắt buộc)
- Slug/URL friendly (tự động tạo từ tên, có thể chỉnh sửa)
- Mô tả ngắn
- Mô tả chi tiết (rich text editor)

**Icon:**
- Chọn icon từ icon library (Lucide Icons)
- Hoặc upload icon tùy chỉnh
- Preview icon trước khi lưu
- Màu nền icon (gradient: từ đỏ đến cam)

**Cấu trúc phân cấp:**
- Danh mục cha (Parent category) - chọn từ dropdown
- Nếu là danh mục cấp 1: không có danh mục cha
- Nếu là danh mục cấp 2: chọn danh mục cha
- Hiển thị breadcrumb khi có danh mục cha

**Danh mục con (Subcategories):**
- Quản lý danh sách subcategories:
  - Thêm subcategory mới (tên, icon, mô tả)
  - Sửa subcategory
  - Xóa subcategory
  - Sắp xếp thứ tự subcategories
- Hiển thị số lượng subcategories (ví dụ: "5 loại")
- Mỗi subcategory có thể có:
  - Tên
  - Icon (tùy chọn)
  - Mô tả ngắn
  - Slug

**Hình ảnh:**
- Hình ảnh đại diện (banner) - upload
- Có thể crop/resize ảnh
- Preview ảnh

**Cài đặt hiển thị:**
- Trạng thái (Hiển thị / Ẩn)
- Thứ tự hiển thị (Sort order) - số hoặc kéo thả
- Hiển thị trên trang chủ (Featured category)
- Hiển thị trong menu chính

**SEO & Meta:**
- Meta title
- Meta description
- Meta keywords
- OG image (cho social sharing)

**Thống kê:**
- Tổng số sản phẩm trong danh mục (tự động cập nhật)
- Tổng số sản phẩm bao gồm cả danh mục con
- Số lượng đơn hàng có sản phẩm thuộc danh mục
- Doanh thu từ danh mục

#### 2.3.3. Xóa danh mục
- Xóa một danh mục
- Xóa nhiều danh mục (bulk delete)
- Kiểm tra ràng buộc trước khi xóa:
  - Không cho phép xóa nếu có sản phẩm thuộc danh mục
  - Không cho phép xóa nếu có danh mục con
  - Cảnh báo và đề xuất chuyển sản phẩm sang danh mục khác
- Tùy chọn khi xóa:
  - Chuyển sản phẩm sang danh mục khác
  - Xóa luôn sản phẩm (cảnh báo nguy hiểm)

#### 2.3.4. Quản lý nâng cao
- Import/Export danh mục (Excel/CSV)
- Sao chép danh mục (duplicate)
- Di chuyển danh mục (đổi danh mục cha)
- Merge danh mục (gộp 2 danh mục thành 1)
- Xem lịch sử thay đổi danh mục (audit log)

---

### 2.4. QUẢN LÝ BANNER

**Mục đích:** Quản lý banner slider trên trang chủ

**Chức năng:**

#### 2.4.1. Danh sách banner
- Hiển thị danh sách banner với preview
- Hiển thị: Hình ảnh, Tiêu đề, Trạng thái, Thứ tự

#### 2.4.2. Thêm/Sửa banner
- Tiêu đề (Title)
- Mô tả (Description)
- Hình ảnh (Upload, có thể crop/resize)
- Link chuyển hướng (URL)
- Màu gradient (Color scheme)
- Trạng thái (Hiển thị / Ẩn)
- Thứ tự hiển thị (Sort order)
- Thời gian bắt đầu/kết thúc (nếu cần)

#### 2.4.3. Xóa banner
- Xóa banner
- Cảnh báo trước khi xóa

---

### 2.5. QUẢN LÝ FLASH SALE

**Mục đích:** Quản lý các chương trình flash sale

**Chức năng:**

#### 2.5.1. Danh sách Flash Sale
- Hiển thị danh sách các flash sale đang diễn ra và sắp tới
- Hiển thị: Tên chương trình, Thời gian, Số sản phẩm, Trạng thái

#### 2.5.2. Tạo/Sửa Flash Sale
- Tên chương trình
- Thời gian bắt đầu
- Thời gian kết thúc
- Trạng thái (Sắp diễn ra / Đang diễn ra / Đã kết thúc)

#### 2.5.3. Quản lý sản phẩm trong Flash Sale
- Thêm sản phẩm vào flash sale
- Chọn sản phẩm từ danh sách
- Thiết lập cho mỗi sản phẩm:
  - Giá gốc
  - Giá khuyến mãi
  - Phần trăm giảm giá (tự động tính)
  - Số lượng khuyến mãi (Total)
  - Số lượng đã bán (tự động cập nhật)
- Xóa sản phẩm khỏi flash sale

---

### 2.6. QUẢN LÝ VOUCHER / MÃ GIẢM GIÁ

**Mục đích:** Quản lý các mã giảm giá, voucher

**Chức năng:**

#### 2.6.1. Danh sách voucher
- Hiển thị danh sách voucher
- Hiển thị: Mã, Loại, Giá trị, Số lượt sử dụng, Trạng thái

#### 2.6.2. Tạo/Sửa voucher
- Mã voucher (bắt buộc, unique)
- Tiêu đề
- Mô tả
- Loại giảm giá:
  - Giảm theo số tiền cố định (Fixed amount)
  - Giảm theo phần trăm (Percentage)
- Giá trị giảm giá
- Giảm tối đa (nếu là phần trăm)
- Đơn hàng tối thiểu (Min purchase)
- Số lượt sử dụng tối đa (Max uses)
- Số lượt đã sử dụng (tự động cập nhật)
- Ngày hết hạn
- Trạng thái (Hoạt động / Tạm dừng / Hết hạn)
- Áp dụng cho:
  - Tất cả sản phẩm
  - Danh mục cụ thể
  - Sản phẩm cụ thể
  - Khách hàng mới

#### 2.6.3. Xóa voucher
- Xóa voucher
- Cảnh báo trước khi xóa

---

### 2.7. QUẢN LÝ CỬA HÀNG

**Mục đích:** Quản lý thông tin các chi nhánh cửa hàng

**Chức năng:**

#### 2.7.1. Danh sách cửa hàng
- Hiển thị danh sách các chi nhánh
- Hiển thị: Tên, Địa chỉ, Số điện thoại, Trạng thái

#### 2.7.2. Thêm/Sửa cửa hàng
- Tên chi nhánh (bắt buộc)
- Địa chỉ đầy đủ
- Tọa độ (Latitude, Longitude) - để hiển thị trên bản đồ
- Số điện thoại
- Email
- Giờ làm việc:
  - Thứ 2 - Thứ 6: Giờ bắt đầu - Giờ kết thúc
  - Thứ 7 - Chủ nhật: Giờ bắt đầu - Giờ kết thúc
- Dịch vụ tại cửa hàng (danh sách checkbox):
  - Trải nghiệm sản phẩm trực tiếp
  - Tư vấn chuyên sâu từ chuyên gia
  - Hỗ trợ cài đặt và kích hoạt
  - Bảo hành và sửa chữa nhanh
  - Đổi trả trong 7 ngày
  - Miễn phí gửi xe ô tô, xe máy
- Trạng thái (Hoạt động / Tạm đóng)

#### 2.7.3. Xóa cửa hàng
- Xóa cửa hàng
- Cảnh báo trước khi xóa

---

### 2.8. QUẢN LÝ ĐÁNH GIÁ

**Mục đích:** Quản lý đánh giá của khách hàng về sản phẩm

**Chức năng:**

#### 2.8.1. Danh sách đánh giá
- Hiển thị danh sách đánh giá
- Hiển thị: Sản phẩm, Khách hàng, Số sao, Ngày đánh giá, Trạng thái
- Lọc theo:
  - Sản phẩm
  - Số sao
  - Trạng thái (Đã duyệt / Chờ duyệt / Đã ẩn)

#### 2.8.2. Duyệt/Ẩn đánh giá
- Duyệt đánh giá (hiển thị trên website)
- Ẩn đánh giá (không hiển thị)
- Xóa đánh giá (nếu vi phạm)

#### 2.8.3. Phản hồi đánh giá
- Admin có thể phản hồi lại đánh giá của khách hàng

---

### 2.9. QUẢN LÝ ĐƠN HÀNG

**Mục đích:** Quản lý toàn bộ đơn hàng của khách hàng

**Chức năng:**

#### 2.9.1. Danh sách đơn hàng
- Hiển thị danh sách đơn hàng dạng bảng
- Hiển thị: Mã đơn, Khách hàng, Tổng tiền, Trạng thái, Ngày đặt
- Tìm kiếm (theo mã đơn, tên khách hàng, số điện thoại)
- Lọc theo:
  - Trạng thái đơn hàng
  - Khoảng thời gian
  - Phương thức thanh toán
- Sắp xếp (theo ngày, tổng tiền)
- Phân trang

#### 2.9.2. Chi tiết đơn hàng
- Thông tin khách hàng:
  - Họ tên (bắt buộc)
  - Số điện thoại (bắt buộc)
  - Email (tùy chọn)
  - Ghi chú đơn hàng (nếu có)
- Thông tin địa điểm nhận hàng:
  - Phương thức nhận hàng:
    - Nhận tại cửa hàng (chọn chi nhánh)
    - Giao hàng tận nơi (nhập địa chỉ)
  - Nếu nhận tại cửa hàng:
    - Tên chi nhánh
    - Địa chỉ chi nhánh
    - Số điện thoại chi nhánh
  - Nếu giao hàng:
    - Địa chỉ giao hàng đầy đủ
    - Phường/Xã
    - Quận/Huyện
    - Tỉnh/Thành phố
- Thông tin đơn hàng:
  - Mã đơn hàng (tự động tạo)
  - Ngày đặt
  - Phương thức thanh toán (chỉ COD - Thanh toán khi nhận hàng)
  - Phương thức vận chuyển (Nhận tại cửa hàng / Giao hàng)
  - Mã giảm giá (nếu có)
  - Phí vận chuyển (nếu giao hàng)
  - Tổng tiền
- Danh sách sản phẩm:
  - Hình ảnh, Tên, Số lượng, Giá, Thành tiền
- Lịch sử cập nhật trạng thái
- Lịch sử liên hệ với khách hàng

#### 2.9.3. Cập nhật trạng thái đơn hàng
- Các trạng thái:
  - Chờ xác nhận (mới tạo)
  - Đã xác nhận (admin đã xác nhận đơn hàng)
  - Đang chuẩn bị hàng
  - Sẵn sàng nhận hàng (nếu nhận tại cửa hàng)
  - Đang giao hàng (nếu giao hàng)
  - Đã giao hàng / Đã nhận hàng
  - Đã hủy
  - Hoàn trả
- Ghi chú khi cập nhật trạng thái
- Gửi thông báo cho khách hàng:
  - SMS (số điện thoại)
  - Email (nếu có)
  - Zalo (nếu có số Zalo)
- Xác nhận thanh toán:
  - Đánh dấu đã thanh toán (khi khách thanh toán COD)
  - Ghi chú số tiền đã nhận
  - Upload ảnh chứng từ (nếu cần)

#### 2.9.4. In hóa đơn & Chứng từ
- Xuất hóa đơn PDF
- In hóa đơn
- Mẫu hóa đơn bao gồm:
  - Thông tin cửa hàng
  - Thông tin khách hàng
  - Danh sách sản phẩm
  - Tổng tiền, phí vận chuyển, giảm giá
  - Phương thức thanh toán (COD)
  - Ngày đặt, ngày giao/nhận

#### 2.9.5. Liên hệ khách hàng
- Gọi điện cho khách hàng (tích hợp click-to-call)
- Gửi SMS thông báo (nếu có tích hợp)
- Gửi email thông báo (nếu có email)
- Ghi chú cuộc gọi/liên hệ
- Lịch sử liên hệ với khách hàng

---

### 2.10. QUẢN LÝ NGƯỜI DÙNG / KHÁCH HÀNG

**Mục đích:** Quản lý thông tin người dùng và khách hàng

**Chức năng:**

#### 2.10.1. Danh sách người dùng
- Hiển thị danh sách người dùng
- Hiển thị: Tên, Email, Số điện thoại, Vai trò, Trạng thái, Ngày đăng ký
- Tìm kiếm (theo tên, email, số điện thoại)
- Lọc theo vai trò, trạng thái
- Phân trang

#### 2.10.2. Chi tiết người dùng
- Thông tin cá nhân:
  - Họ tên
  - Email
  - Số điện thoại
  - Địa chỉ
  - Ngày đăng ký
- Lịch sử đơn hàng
- Lịch sử đánh giá
- Trạng thái tài khoản (Hoạt động / Khóa)

#### 2.10.3. Quản lý tài khoản
- Khóa/Mở khóa tài khoản
- Đặt lại mật khẩu
- Xóa tài khoản (cảnh báo trước)

---

### 2.11. QUẢN LÝ NGƯỜI DÙNG ADMIN

**Mục đích:** Quản lý tài khoản admin và phân quyền

**Chức năng:**

#### 2.11.1. Danh sách admin
- Hiển thị danh sách tài khoản admin
- Hiển thị: Tên, Email, Vai trò, Trạng thái, Ngày tạo

#### 2.11.2. Thêm/Sửa admin
- Tên đăng nhập
- Email
- Mật khẩu
- Vai trò (Role):
  - Super Admin (toàn quyền)
  - Admin (quản lý sản phẩm, đơn hàng)
  - Editor (chỉnh sửa nội dung)
  - Viewer (chỉ xem)
- Phân quyền chi tiết (nếu cần):
  - Quản lý sản phẩm
  - Quản lý đơn hàng
  - Quản lý người dùng
  - Quản lý cấu hình
- Trạng thái (Hoạt động / Khóa)

#### 2.11.3. Xóa admin
- Xóa tài khoản admin
- Cảnh báo trước khi xóa

---

### 2.12. CẤU HÌNH HỆ THỐNG

**Mục đích:** Quản lý các cấu hình chung của hệ thống

**Chức năng:**

#### 2.12.1. Thông tin cửa hàng
- Tên cửa hàng
- Logo
- Số điện thoại hotline
- Email liên hệ
- Địa chỉ
- Mô tả ngắn
- Link mạng xã hội (Facebook, Instagram, Telegram, YouTube)

#### 2.12.2. Cấu hình vận chuyển
- Phí vận chuyển mặc định
- Miễn phí vận chuyển cho đơn hàng từ X VNĐ
- Thời gian giao hàng dự kiến

#### 2.12.3. Cấu hình thanh toán
**Lưu ý:** Hệ thống không hỗ trợ thanh toán online, chỉ hỗ trợ thanh toán offline.

- Phương thức thanh toán mặc định:
  - **Thanh toán khi nhận hàng (COD)** - Bắt buộc
  - Khách hàng thanh toán khi nhận hàng tại cửa hàng hoặc khi nhận hàng giao tận nơi
  
- Thông tin chuyển khoản (nếu khách muốn chuyển khoản trước):
  - Số tài khoản ngân hàng
  - Tên chủ tài khoản
  - Tên ngân hàng
  - Chi nhánh
  - Nội dung chuyển khoản (mẫu)
  - Lưu ý: Khách hàng tự chuyển khoản và gửi ảnh chứng từ, admin xác nhận thủ công

- Cấu hình COD:
  - Phí thu hộ (nếu có)
  - Giới hạn số tiền COD tối đa
  - Khu vực áp dụng COD

#### 2.12.4. Cấu hình khác
- Chính sách bảo hành
- Chính sách đổi trả
- Hướng dẫn mua hàng
- Câu hỏi thường gặp (FAQ)
- Nội dung footer

---

## 3. YÊU CẦU KỸ THUẬT

### 3.1. Giao diện
- Responsive design (hỗ trợ mobile, tablet, desktop)
- UI/UX hiện đại, dễ sử dụng
- Dark mode (tùy chọn)

### 3.2. Bảo mật
- Xác thực người dùng (Login/Logout)
- Phân quyền theo vai trò
- Bảo vệ CSRF
- Validate dữ liệu đầu vào

### 3.3. Hiệu năng
- Tối ưu hóa truy vấn database
- Cache dữ liệu khi cần
- Lazy loading cho danh sách dài
- Upload ảnh với compression

### 3.4. Tích hợp
- API RESTful để frontend gọi
- Webhook cho các sự kiện (đơn hàng mới, v.v.)
- Export/Import dữ liệu (Excel, CSV)

---

## 4. QUY TRÌNH NGHIỆP VỤ

### 4.1. Quy trình xử lý đơn hàng

**Đối với đơn hàng nhận tại cửa hàng:**
1. Khách hàng điền form đặt hàng (họ tên, SĐT, email, chọn cửa hàng) → Đơn hàng ở trạng thái "Chờ xác nhận"
2. Admin xác nhận đơn hàng và liên hệ khách hàng → Trạng thái "Đã xác nhận"
3. Admin chuẩn bị hàng → Trạng thái "Đang chuẩn bị hàng"
4. Hàng sẵn sàng → Trạng thái "Sẵn sàng nhận hàng", thông báo khách đến nhận
5. Khách hàng đến cửa hàng nhận và thanh toán → Trạng thái "Đã nhận hàng"
6. Hoặc khách hàng hủy → Trạng thái "Đã hủy"

**Đối với đơn hàng giao hàng:**
1. Khách hàng điền form đặt hàng (họ tên, SĐT, email, địa chỉ giao hàng) → Đơn hàng ở trạng thái "Chờ xác nhận"
2. Admin xác nhận đơn hàng và liên hệ khách hàng → Trạng thái "Đã xác nhận"
3. Admin chuẩn bị hàng → Trạng thái "Đang chuẩn bị hàng"
4. Giao cho đơn vị vận chuyển hoặc nhân viên giao hàng → Trạng thái "Đang giao hàng"
5. Khách hàng nhận hàng và thanh toán COD → Trạng thái "Đã giao hàng"
6. Hoặc khách hàng hủy → Trạng thái "Đã hủy"

### 4.2. Quy trình quản lý Flash Sale
1. Admin tạo chương trình Flash Sale
2. Thiết lập thời gian bắt đầu/kết thúc
3. Thêm sản phẩm vào flash sale với giá khuyến mãi
4. Hệ thống tự động hiển thị trên frontend khi đến thời gian
5. Tự động ẩn khi hết thời gian

### 4.3. Quy trình duyệt đánh giá
1. Khách hàng đánh giá sản phẩm → Trạng thái "Chờ duyệt"
2. Admin xem và duyệt đánh giá → Trạng thái "Đã duyệt"
3. Đánh giá hiển thị trên trang chi tiết sản phẩm

---

## 5. BÁO CÁO VÀ THỐNG KÊ

### 5.1. Báo cáo doanh thu
- Doanh thu theo ngày/tuần/tháng/năm
- So sánh với kỳ trước
- Biểu đồ xu hướng

### 5.2. Báo cáo sản phẩm
- Top sản phẩm bán chạy
- Sản phẩm tồn kho nhiều
- Sản phẩm sắp hết hàng

### 5.3. Báo cáo khách hàng
- Số lượng khách hàng mới
- Khách hàng mua nhiều nhất
- Tỷ lệ khách hàng quay lại

---

## 6. LƯU Ý BỔ SUNG

- Tất cả các thao tác quan trọng (xóa, cập nhật trạng thái) cần có xác nhận
- Lưu lịch sử thay đổi (audit log) cho các thao tác quan trọng
- Hỗ trợ đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
- Hỗ trợ tìm kiếm và lọc nâng cao ở tất cả các module
- Export dữ liệu ra Excel/PDF khi cần
- Thông báo real-time cho admin khi có đơn hàng mới

---

**Ngày tạo:** 2025-01-27  
**Phiên bản:** 1.0

