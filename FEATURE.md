# Terra Pickleball — Tài liệu tính năng

Tài liệu này mô tả toàn bộ tính năng đã xây dựng trong hệ thống đặt sân pickleball, luồng hoạt động của từng tính năng, và các file liên quan (backend + frontend) cho mỗi tính năng. Dùng file này làm điểm bắt đầu khi cần hiểu hoặc mở rộng bất kỳ phần nào của hệ thống.

## Mục lục

1. [Xác thực & phân quyền](#1-xác-thực--phân-quyền)
2. [Trang chủ](#2-trang-chủ)
3. [Danh sách & chi tiết sân](#3-danh-sách--chi-tiết-sân)
4. [Đặt sân](#4-đặt-sân)
5. [Thanh toán VNPay](#5-thanh-toán-vnpay)
6. [Lịch sử đặt sân & huỷ booking (khách hàng)](#6-lịch-sử-đặt-sân--huỷ-booking-khách-hàng)
7. [Tự động hoá trạng thái booking](#7-tự-động-hoá-trạng-thái-booking)
8. [Trang quản trị — Dashboard](#8-trang-quản-trị--dashboard)
9. [Trang quản trị — Quản lý sân (CRUD)](#9-trang-quản-trị--quản-lý-sân-crud)
10. [Trang quản trị — Quản lý booking](#10-trang-quản-trị--quản-lý-booking)
11. [Trang giới thiệu (About)](#11-trang-giới-thiệu-about)
12. [Hệ thống thiết kế (Terra Design System)](#12-hệ-thống-thiết-kế-terra-design-system)

---

## 1. Xác thực & phân quyền

**Mục đích:** Đăng ký/đăng nhập tài khoản, phân biệt quyền `CUSTOMER` (khách đặt sân) và `ADMIN` (quản trị).

### Luồng hoạt động

1. **Đăng ký** (`POST /api/auth/register`) — nhận `username`, `email`, `password`, `phone`. Kiểm tra trùng email/username, mã hoá mật khẩu bằng BCrypt, tạo `User` với `role = CUSTOMER` mặc định (không có đường nào tạo `ADMIN` qua API — chỉ qua seeder).
2. **Đăng nhập** (`POST /api/auth/login`) — kiểm tra email/mật khẩu, phát hành **JWT** (HMAC-SHA256) chứa claim `sub` (email) và `role`, hết hạn sau `app.jwt.expiration` (24h).
3. **Phân quyền theo role** — `SecurityConfiguration.java` dùng `JwtAuthenticationConverter` để map claim `role` trong JWT thành Spring Security authority (`ROLE_ADMIN`/`ROLE_CUSTOMER`). Route `/api/admin/**` yêu cầu `hasAuthority("ROLE_ADMIN")`.
4. **Lưu phiên đăng nhập ở frontend** — `useAuthStore` (Zustand + middleware `persist`) lưu toàn bộ response `{token, username, role}` vào `localStorage`, tự khôi phục khi reload trang.
5. **Đăng xuất** — xoá `user` khỏi store, điều hướng về `/login`.

### File liên quan

| Vai trò | File |
|---|---|
| Backend entity | `entity/user/User.java`, `Role.java`, `Status.java`, `Membership.java` |
| Backend logic | `service/AuthService.java`, `controller/AuthController.java` |
| Backend bảo mật | `config/SecurityConfiguration.java`, `config/JwtUtil.java` |
| Backend seed admin | `config/AdminSeeder.java` (tạo sẵn `admin@gmail.com` / `admin@123`) |
| Frontend state | `features/auth/useAuthStore.jsx`, `features/auth/AuthService.jsx` |
| Frontend UI | `page/LoginPage.jsx`, `page/RegisterPage.jsx`, `components/AuthLayout.jsx` |

### Lưu ý kỹ thuật quan trọng

- JWT lưu ở `localStorage` qua Zustand `persist` — mọi request cần xác thực phải tự đính `Authorization: Bearer <token>` (xem `authHeader()` trong các `*Service.jsx`).
- Trước khi có `JwtAuthenticationConverter`, phân quyền theo role **hoàn toàn không hoạt động** dù JWT có claim `role` — đây là lỗi đã phát hiện và sửa khi xây tính năng Admin.

---

## 2. Trang chủ

**Mục đích:** Trang landing giới thiệu, hiển thị danh sách sân.

### Luồng hoạt động

- Gọi `GET /api/courts` (public, không cần đăng nhập) lấy danh sách sân đang `ACTIVE`.
- Hiện hero section (tĩnh) + lưới `CourtCard` cho từng sân (ảnh, tên, địa chỉ, loại sân, giá, rating nếu có).

### File liên quan

`page/HomePage.jsx`, `components/CourtCard.jsx`, `features/courts/CourtService.jsx`

---

## 3. Danh sách & chi tiết sân

**Mục đích:** Xem toàn bộ sân, lọc theo loại, xem chi tiết + chọn ngày/giờ để đặt.

### Luồng hoạt động

1. `CourtsPage.jsx` — gọi `GET /api/courts`, lọc phía client theo `court_type` (`INSIDE`/`OUTSIDE`).
2. `CourtDetailPage.jsx` — gọi `GET /api/courts/{id}` lấy chi tiết sân, và `GET /api/courts/{id}/timeslots?date=` mỗi khi đổi ngày.
3. **Sinh khung giờ** (`BookingService.getTimeSlots`): lặp từ `open_time` tới `close_time` của sân, mỗi bước = `slot_duration_minutes`; so với danh sách booking đã có trong ngày đó (`findByCourtIdAndBookingDate`) để đánh dấu `available: true/false`.
4. Chọn ngày (14 ngày tới) + chọn giờ còn trống → bấm "Đặt ngay".

### File liên quan

| Vai trò | File |
|---|---|
| Backend | `controller/CourtController.java` (list, detail), `controller/BookingController.java` (timeslots) |
| Backend logic | `service/CourtService.java`, `service/BookingService.java#getTimeSlots` |
| Frontend | `page/CourtsPage.jsx`, `page/CourtDetailPage.jsx`, `features/courts/CourtService.jsx`, `features/courts/courtTypeLabel.jsx` |

---

## 4. Đặt sân

**Mục đích:** Tạo booking mới, giữ chỗ tạm thời trong khi chờ thanh toán cọc.

### Luồng hoạt động

1. Yêu cầu **đăng nhập** — `CourtDetailPage` kiểm tra `user` trong store trước khi gọi API; chưa đăng nhập → toast + điều hướng `/login`.
2. `POST /api/bookings` (`BookingService.createBooking`):
   - Lấy user từ JWT (không tin `userId` client gửi).
   - Kiểm tra slot còn trống (`existsByCourtIdAndBookingDateAndStartTime`) → trùng thì báo lỗi `409 Conflict`.
   - Tính `totalPrice` = giá/giờ × số giờ, `depositAmount` = 30% tổng, `remainingAmount` = 70% còn lại.
   - Tạo booking với status **`PENDING_PAYMENT`**, `expiresAt` = hiện tại + 15 phút.
3. Điều hướng sang `CheckoutPage` kèm dữ liệu booking (qua `react-router` state).

### File liên quan

| Vai trò | File |
|---|---|
| Backend DTO | `dto/booking/BookingRequest.java`, `BookingResponse.java` |
| Backend logic | `service/BookingService.java#createBooking`, `entity/booking/Booking.java`, `BookingStatus.java` |
| Frontend | `page/CourtDetailPage.jsx`, `page/CheckoutPage.jsx`, `features/bookings/BookingService.jsx` |

### Vòng đời trạng thái booking

```
PENDING_PAYMENT → CONFIRMED → COMPLETED
                ↘ CANCELLED
```

---

## 5. Thanh toán VNPay

**Mục đích:** Thanh toán tiền cọc qua cổng VNPay (sandbox), xác nhận kết quả để chuyển booking sang `CONFIRMED`.

### Luồng hoạt động chi tiết

1. **Tạo URL thanh toán** — `CheckoutPage` bấm "Xác nhận thanh toán" → `POST /api/payments/vnpay?bookingId=X`.
   - `PaymentService.createPaymentUrl()` kiểm tra booking đang `PENDING_PAYMENT`.
   - `VNPayUtil.createPaymentUrl()`: gom tham số (`vnp_Amount`, `vnp_TxnRef`, `vnp_CreateDate`, `vnp_ExpireDate`...) vào `TreeMap` (tự sắp alphabet), nối chuỗi `key=value&key=value` (**không** có `&` thừa ở cuối), tính **HMAC-SHA512** bằng `vnp_HashSecret` → `vnp_SecureHash`, ghép vào URL.
   - `bookingId` được nhét vào `vnp_TxnRef` theo format `id_timestamp` (VNPay không cho thêm field tuỳ ý).
2. **Redirect** — frontend `window.location.href = paymentUrl`, rời khỏi app sang trang VNPay thật.
3. **User thanh toán** trên trang VNPay (thẻ test NCB `9704198526191432198`, OTP `123456`).
4. **VNPay redirect về** `vnp_ReturnUrl` (= `http://localhost:5173/payment/result`) kèm query params + `vnp_SecureHash` do **VNPay tự ký**.
5. `PaymentResultPage.jsx` đọc query params từ URL, gọi `GET /api/payments/vnpay/return` (route public, không cần JWT vì đây là redirect từ bên ngoài, không phải call từ app).
6. `PaymentService.handleVNPayReturn()`:
   - `VNPayUtil.verifyPayment()` tính lại hash, so với `vnp_SecureHash` nhận được — **không khớp thì không tin dữ liệu**, dù `vnp_ResponseCode` có báo gì.
   - Tách `bookingId` từ `vnp_TxnRef`.
   - Hash đúng + `vnp_ResponseCode == "00"` → booking `CONFIRMED`, tạo `Payment` status `SUCCESS`.
   - Ngược lại → booking `CANCELLED`, `Payment` status `FAILED`.
7. Frontend hiện kết quả thành công/thất bại + mã đặt sân + số tiền.

### File liên quan

| Vai trò | File |
|---|---|
| Backend config | `config/payment/VNPayConfig.java`, `application.properties` (`vnpay.*`) |
| Backend logic | `util/VNPayUtil.java`, `service/PaymentService.java` |
| Backend entity | `entity/payment/Payment.java`, `PaymentType.java`, `PaymentStatus.java`, `PaymentMethod.java` |
| Backend API | `controller/PaymentController.java` |
| Frontend | `page/CheckoutPage.jsx`, `page/PaymentResultPage.jsx`, `features/bookings/PaymentService.jsx` |

### Lỗi đã gặp và cách sửa (tham khảo khi debug lại)

1. Thiếu dấu `&` giữa các tham số khi build chuỗi hash → sai chữ ký.
2. Thiếu tham số bắt buộc `vnp_ExpireDate`.
3. `vnp_IpAddr` gửi dạng IPv6 loopback (`::1`) khi test local → cần chuẩn hoá về `127.0.0.1`.
4. `vnp_OrderInfo` chứa dấu tiếng Việt bị mã hoá lỗi (US-ASCII) → cần bỏ dấu trước khi đưa vào URL (`removeDiacritics`).
5. **Nguyên nhân gốc thật sự của lỗi "Invalid signature"**: `vnp_HashSecret` cấu hình sai (không phải bug thuật toán) — xác minh bằng cách tính HMAC-SHA512 độc lập qua `openssl` và so khớp với kết quả Java.

---

## 6. Lịch sử đặt sân & huỷ booking (khách hàng)

**Mục đích:** Khách hàng xem lại các booking của mình, huỷ nếu cần.

### Luồng hoạt động

- `GET /api/bookings/me` — lấy user từ JWT, trả toàn bộ booking của user đó.
- `PUT /api/bookings/{id}/cancel` — kiểm tra đúng chủ booking (`ForbiddenActionException` nếu không phải), không cho huỷ booking đã `CANCELLED`/`COMPLETED` (`BookingConflictException`).

### File liên quan

`page/MyBookingsPage.jsx`, `service/BookingService.java#getMyBookings/#cancelBooking`, `features/bookings/bookingStatus.jsx` (nhãn + màu trạng thái dùng chung)

---

## 7. Tự động hoá trạng thái booking

**Mục đích:** Không cần con người can thiệp thủ công để chuyển trạng thái booking theo thời gian.

### 2 job chạy nền (`scheduler/BookingScheduler.java`, cần `@EnableScheduling` ở `SangApplication.java`)

| Job | Chu kỳ | Điều kiện | Hành động |
|---|---|---|---|
| `cancelExpiredPendingBookings` | 1 phút | `status = PENDING_PAYMENT` và `expiresAt < now` | Chuyển `CANCELLED` (huỷ giữ chỗ vì không thanh toán kịp 15 phút) |
| `completeFinishedBookings` | 5 phút | `status = CONFIRMED` và `bookingDate + endTime < now` | Chuyển `COMPLETED` (buổi chơi đã kết thúc) |

**Đã test qua dữ liệu thật**: tạo booking test với `expiresAt`/ngày giờ chỉnh về quá khứ qua SQL trực tiếp, xác nhận cả 2 job tự nhặt và chuyển đúng trạng thái mà không cần gọi API thủ công.

### Việc chưa làm (đã xác định nhưng chưa xây)

- Cộng điểm thưởng (`pointsEarned` → `user.totalPoints`) khi booking `COMPLETED`.
- Tự động nâng hạng thành viên (`membershipTier`) theo điểm.
- Ràng buộc chỉ cho viết `Review` khi booking đã `COMPLETED`.

---

## 8. Trang quản trị — Dashboard

**Mục đích:** Tổng quan hoạt động kinh doanh cho admin.

### Luồng hoạt động

`GET /api/admin/dashboard` (`AdminService.getDashboardStats`) tính từ dữ liệu thật:

- **Tổng doanh thu**: tổng `Payment` có `status = SUCCESS`.
- **% thay đổi so tuần trước**: so doanh thu 7 ngày gần nhất vs 7 ngày trước đó.
- **Tổng lượt đặt**: đếm toàn bộ `Booking`.
- **Người dùng hoạt động**: đếm `User` có `status = ACTIVE`.
- **Tỷ lệ lấp đầy (hôm nay)**: (số slot đã đặt hôm nay) / (tổng slot khả dụng của các sân `ACTIVE` hôm nay) × 100.
- **Doanh thu 7 ngày gần nhất**: gom `Payment` theo ngày, hiện dạng biểu đồ cột (**recharts** `BarChart`).
- **5 booking gần nhất**: `findTop5ByOrderByIdDesc`.

### File liên quan

| Vai trò | File |
|---|---|
| Backend | `service/AdminService.java`, `controller/AdminController.java`, `dto/admin/*.java` |
| Frontend | `page/AdminPage.jsx`, `features/admin/AdminService.jsx`, `components/AdminSidebar.jsx` |

### Bảo vệ route

- Backend: `/api/admin/**` yêu cầu `ROLE_ADMIN` (403 nếu không phải).
- Frontend: `AdminPage.jsx` tự kiểm tra `user.role !== 'ADMIN'` → `<Navigate to="/" />` ngay, không cần đợi lỗi từ backend.

---

## 9. Trang quản trị — Quản lý sân (CRUD)

**Mục đích:** Admin thêm/sửa/xoá sân, xem tất cả sân kể cả không `ACTIVE` (khác trang public chỉ thấy sân `ACTIVE`).

### Luồng hoạt động

- `GET /api/admin/courts` — toàn bộ sân bất kể trạng thái.
- `POST /api/admin/courts` — tạo sân mới (validate qua `CourtRequest`).
- `PUT /api/admin/courts/{id}` — sửa toàn bộ thông tin sân.
- `DELETE /api/admin/courts/{id}` — xoá sân, **chặn nếu sân đã có booking** (`existsByCourtId` → `BookingConflictException`, `409`).
- Frontend: bảng có tìm kiếm theo tên (client-side), lọc theo trạng thái, phân trang, modal dùng chung cho cả thêm/sửa.

### File liên quan

| Vai trò | File |
|---|---|
| Backend | `dto/court/CourtRequest.java`, `service/CourtService.java`, `controller/AdminCourtController.java` |
| Frontend | `page/AdminCourtsPage.jsx` |

---

## 10. Trang quản trị — Quản lý booking

**Mục đích:** Admin xem toàn bộ booking của mọi khách hàng, can thiệp thủ công khi cần (ngoài 2 job tự động ở mục 7).

### Luồng hoạt động

- `GET /api/admin/bookings` — toàn bộ booking, sắp xếp mới nhất trước.
- `PUT /api/admin/bookings/{id}/cancel` — huỷ **không cần kiểm tra chủ sở hữu** (khác bản dành cho khách hàng ở mục 6).
- `PUT /api/admin/bookings/{id}/status` — đổi trạng thái tuỳ ý (dùng để bấm "Hoàn thành" thủ công, phòng khi cần hoàn thành sớm hơn job tự động 5 phút).

### File liên quan

| Vai trò | File |
|---|---|
| Backend | `service/BookingService.java#getAllBookingsForAdmin/#adminCancelBooking/#updateBookingStatus`, `controller/AdminBookingController.java` |
| Frontend | `page/AdminBookingsPage.jsx` |

---

## 11. Trang giới thiệu (About)

**Mục đích:** Trang nội dung tĩnh giới thiệu thương hiệu — không có dữ liệu động, không gọi API.

### File liên quan

`page/AboutPage.jsx` — hero, tầm nhìn/sứ mệnh, tiện ích nội khu, thông tin liên hệ tĩnh (không có form gửi liên hệ hay bản đồ thật vì không có backend nhận).

---

## 12. Hệ thống thiết kế (Terra Design System)

**Mục đích:** Đảm bảo giao diện nhất quán ("Rooted Warmth" — ấm áp, hữu cơ, gần gũi thiên nhiên).

### Token màu & font (`src/index.css`, khối `@theme` của Tailwind v4)

| Nhóm | Token |
|---|---|
| Thương hiệu | `primary`, `primary-hover`, `background`, `tertiary` |
| Neutral (ấm) | `neutral-50` → `neutral-900` |
| Viền | `outline`, `outline-strong` |
| Focus | `ring` |
| Trạng thái | `success`, `warning`, `error` (+ `-bg` cho nền nhạt) |
| Font | `font-headline` (Literata), `font-body` (Nunito Sans) |
| Đổ bóng | `shadow-soft` |

### Component dùng chung

`Button.jsx`, `Card.jsx`, `Input.jsx`, `Label.jsx`, `AuthLayout.jsx` (khung ảnh trái/form phải cho Login+Register), `Header.jsx` (nav + dropdown user), `Footer.jsx`, `AdminSidebar.jsx`, `CourtCard.jsx`.

---

## Danh sách toàn bộ API endpoint

| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký |
| POST | `/api/auth/login` | Public | Đăng nhập |
| POST | `/api/auth/logout` | Cần đăng nhập | Đăng xuất |
| GET | `/api/courts` | Public | Danh sách sân `ACTIVE` |
| GET | `/api/courts/{id}` | Public | Chi tiết 1 sân |
| GET | `/api/courts/{id}/timeslots` | Public | Khung giờ trống/đã đặt |
| POST | `/api/bookings` | Cần đăng nhập | Tạo booking |
| GET | `/api/bookings/me` | Cần đăng nhập | Lịch sử booking của tôi |
| PUT | `/api/bookings/{id}/cancel` | Cần đăng nhập (chủ booking) | Huỷ booking |
| POST | `/api/payments/vnpay` | Cần đăng nhập | Tạo URL thanh toán |
| GET | `/api/payments/vnpay/return` | Public | Xác nhận kết quả thanh toán |
| GET | `/api/admin/dashboard` | ADMIN | Thống kê tổng quan |
| GET/POST/PUT/DELETE | `/api/admin/courts/**` | ADMIN | CRUD sân |
| GET | `/api/admin/bookings` | ADMIN | Toàn bộ booking |
| PUT | `/api/admin/bookings/{id}/cancel` | ADMIN | Huỷ booking (bất kỳ) |
| PUT | `/api/admin/bookings/{id}/status` | ADMIN | Đổi trạng thái booking |
