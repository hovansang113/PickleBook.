# SangPickle — Workflow dự án

> Hệ thống đặt sân pickleball: React (frontend) + Spring Boot (backend, JWT stateless) + MySQL/JPA.
> Tài liệu này mô tả toàn bộ luồng nghiệp vụ hiện có trong code, không phải thiết kế lý thuyết — mọi API/field nêu dưới đây đều đã tồn tại trong repo tại thời điểm viết (2026-07-07).

---

## 1. Kiến trúc tổng quan

```
frontend/   React + Vite + Zustand (state) + axios + Tailwind
backend/    Spring Boot 3, Spring Security (JWT/Nimbus), Spring Data JPA, VNPay SDK tự viết
```

- **Auth**: JWT ký HS256 (secret trong `application.properties`), stateless, hạn 24h. Claim `role` map thành `ROLE_ADMIN`/`ROLE_CUSTOMER` cho Spring Security.
- **Phân quyền**: `/api/admin/**` yêu cầu `ROLE_ADMIN` ở tầng Security filter (không chỉ ẩn UI). Còn lại yêu cầu đăng nhập trừ `/api/auth/**` và `GET /api/courts/**`.
- **State frontend**: `useAuthStore` (zustand + persist) lưu `{ token, username, role }` vào localStorage; mỗi service gắn `Authorization: Bearer <token>` thủ công qua `authHeader()`.

---

## 2. Luồng khách hàng (Customer)

### 2.1 Đăng ký / Đăng nhập / Đăng xuất

1. **Đăng ký** — `RegisterPage` → `POST /api/auth/register` → `AuthService.register()`:
   - Luôn gán `Role.CUSTOMER` (không thể tự đăng ký ADMIN), `Membership.BRONZE`, `totalPoints = 0`, `Status.ACTIVE`.
   - Mật khẩu mã hoá BCrypt. Trả về JWT ngay nhưng frontend vẫn điều hướng về `/login` (không auto-login).
2. **Đăng nhập** — `LoginPage` → `POST /api/auth/login` → xác thực email/mật khẩu, chặn tài khoản `INACTIVE` (403), trả `{token, username, role}`. Sai email/sai mật khẩu đều trả cùng lỗi 401 `"Invalid email or password"` (không lộ email nào đã tồn tại).
3. **Đăng xuất** — Client-side only: `useAuthStore.logout()` xoá `user` khỏi store/localStorage rồi điều hướng `/login`. Gọi `POST /api/auth/logout` ở backend nhưng endpoint này không làm gì (JWT stateless, không có blacklist) — token cũ vẫn hợp lệ tới khi hết hạn 24h nếu bị lộ.
4. **Bảo vệ route Admin**: mỗi trang `AdminPage`/`AdminCourtsPage`/`AdminBookingsPage` tự kiểm tra `user.role === 'ADMIN'` và `<Navigate>` về `/` nếu không đúng (lặp lại ở 3 nơi, chưa gộp thành 1 `ProtectedRoute`).

### 2.2 Duyệt sân & đặt sân

1. **Trang chủ / danh sách sân** — `HomePage`, `CourtsPage` → `GET /api/courts` (public, chỉ trả sân `Status.ACTIVE`), lọc theo `CourtType` (`INSIDE`/`OUTSIDE`) ở client.
2. **Chi tiết sân** — `CourtDetailPage` → `GET /api/courts/{id}` + chọn ngày (lịch 14 ngày) → `GET /api/courts/{id}/timeslots?date=...` trả danh sách khung giờ theo `open_time`/`close_time`/`slot_duration_minutes` của sân, đánh dấu khung nào đã bị đặt.
3. **Đặt sân** — bấm "Book Now" (yêu cầu đăng nhập) → `POST /api/bookings` → `BookingService.createBooking()`:
   - Tính `totalPrice` = giá sân × số giờ.
   - Áp **giảm giá tự động theo hạng thành viên** (Đồng 0%, Bạc 3%, Vàng 7%, Kim Cương 15%) → `finalPrice`.
   - Tách cọc: `depositAmount` = 30% `finalPrice`, `remainingAmount` = 70% còn lại.
   - Booking tạo với `status = PENDING_PAYMENT`, `expiresAt = now + 15 phút`.
4. **Checkout & giữ chỗ** — `CheckoutPage` hiện đồng hồ đếm ngược 15 phút (khớp `expiresAt`), bấm xác nhận → `POST /api/payments/vnpay?bookingId=...` → redirect sang cổng VNPay để thanh toán **tiền cọc**.
5. **Kết quả thanh toán** — VNPay redirect về `PaymentResultPage` (`GET /api/payments/vnpay/return`, endpoint public):
   - Thành công (`vnp_ResponseCode = 00`) → `booking.status = CONFIRMED`, ghi `Payment(type=DEPOSIT, status=SUCCESS)`.
   - Thất bại → `booking.status = CANCELLED`, ghi `Payment(status=FAILED)`.
6. **Booking tự huỷ nếu bỏ cọc** — `BookingScheduler.cancelExpiredPendingBookings()` chạy mỗi phút, huỷ mọi booking `PENDING_PAYMENT` đã quá `expiresAt`.

### 2.3 Tới sân & thanh toán phần còn lại (điểm mấu chốt đã xử lý)

> Trước đây: không ai xác nhận 70% còn lại đã thu chưa — booking tự chuyển `COMPLETED` theo giờ hệ thống mà không kiểm tra tiền. Đã sửa:

- Khách đến sân, chơi xong → **thanh toán tiền mặt/QR tại quầy** (ngoài hệ thống).
- Nhân viên vào Admin (`AdminBookingsPage`), bấm **"Hoàn thành"** trên booking `CONFIRMED` → hộp thoại xác nhận đúng số tiền `remainingAmount` cần thu → `PUT /api/admin/bookings/{id}/complete`.
- Backend (`BookingService.completeBookingWithPayment`):
  1. Ghi `Payment(type=REMAINING, method=CASH, status=SUCCESS, amount=remainingAmount)`.
  2. `booking.status = COMPLETED`, `pointsEarned = 10`.
  3. Ghi `PointTransaction(EARN, +10)`, cộng `user.totalPoints`.
  4. Đếm lại số booking `COMPLETED` của user → xét lại `membershipTier` (`Membership.fromCompletedCount`).
- **Không có đường nào khác để hoàn thành booking**: endpoint status chung (`PUT /api/admin/bookings/{id}/status`) chặn cứng việc set `COMPLETED` trực tiếp, bắt buộc đi qua luồng thu tiền ở trên. `NO_SHOW`/`CANCELLED` vẫn dùng endpoint status chung (không phát sinh tiền/điểm).

### 2.4 Điểm thưởng, hạng thành viên, đổi quà — `/rewards`

- **Tích điểm**: +10 điểm mỗi booking `COMPLETED` (xem 2.3).
- **Hạng thành viên** (theo tổng số booking `COMPLETED` — tính suốt vòng đời, không reset theo năm):

  | Hạng | Điều kiện (số lần đặt hoàn thành) | Giảm giá tự động |
  |---|---|---|
  | Đồng (BRONZE) | mặc định (0) | 0% |
  | Bạc (SILVER) | ≥ 30 | 3% |
  | Vàng (GOLD) | ≥ 50 | 7% |
  | Kim Cương (DIAMOND) | ≥ 100 | 15% |

- **Trang `/rewards`** (`RewardsPage`) gọi `GET /api/rewards/me/summary` hiển thị: điểm hiện tại, hạng, % giảm giá, thanh tiến trình lên hạng tiếp theo.
- **Đổi quà**: `GET /api/rewards` (danh mục, seed sẵn "1 Ly Nước" = 50đ, "1 Giờ Sân Miễn Phí" = 100đ) → `POST /api/rewards/{id}/redeem` trừ điểm, sinh mã (`RewardRedemption`, trạng thái `UNUSED`), ghi `PointTransaction(REDEEM, -points)`.
- **Dùng quà tại quầy**: khách đưa mã cho nhân viên → nhân viên xác nhận qua `PUT /api/admin/redemptions/{code}/use` (cùng triết lý "khách xuất trình trực tiếp, admin xác nhận thủ công" như mục 2.3).
- Lịch sử đổi quà xem qua `GET /api/rewards/redemptions/me`.

### 2.5 Đánh giá sân (Review) — **chưa hoàn thiện, chỉ có schema**

- Entity `Review` (rating 1–5, comment, gắn với `User` + `Court` + `Booking`) và `ReviewRepository.findAverageRatingByCourtId` đã tồn tại, được `CourtService` gọi để hiển thị rating trung bình trên thẻ sân.
- **Không có `ReviewController`/`ReviewService`** — khách hàng hiện **không có cách nào gửi đánh giá** qua API. Rating trung bình hiển thị sẽ luôn rỗng cho tới khi tính năng này được xây (viết thêm controller/service cho phép tạo review sau khi booking `COMPLETED`).

---

## 3. Luồng quản trị (Admin)

### 3.1 Đăng nhập Admin
Dùng chung `/api/auth/login`, phân biệt bằng `role` trả về. Tài khoản admin mặc định seed sẵn: `admin@gmail.com` / `admin@123` (`AdminSeeder`).

### 3.2 Dashboard (`AdminPage` → `GET /api/admin/dashboard`)
- `totalRevenue`, `revenueChangePercent` (tuần này so với tuần trước, dựa trên `Payment` status `SUCCESS`).
- `totalBookings`, `activeUsers` (status `ACTIVE`).
- `fillRate`: tỉ lệ khung giờ đã đặt hôm nay / tổng khung giờ khả dụng của các sân đang hoạt động.
- `weeklyRevenue`: doanh thu 7 ngày gần nhất (nhãn "Thứ 2"…"Chủ Nhật"), vẽ biểu đồ cột (Recharts).
- `recentBookings`: 5 booking gần nhất.

### 3.3 Quản lý sân (`AdminCourtsPage` → `/api/admin/courts`)
CRUD đầy đủ: tạo/sửa/xoá sân (`name, description, address, image, price_per_hour, open_time, close_time, slot_duration_minutes, status, courtType`). Không cho xoá sân đã từng có booking (`existsByCourtId` → chặn bằng `BookingConflictException`). `status` sân có 3 giá trị: `ACTIVE / INACTIVE / MAINTENANCE`.

### 3.4 Quản lý booking (`AdminBookingsPage` → `/api/admin/bookings`)
- Xem tất cả booking, lọc theo trạng thái/tên khách/tên sân.
- **Hoàn thành + thu tiền còn lại**: xem mục 2.3 (`PUT /{id}/complete`).
- **Huỷ booking**: `PUT /{id}/cancel` hoặc set `NO_SHOW`/`CANCELLED` qua `PUT /{id}/status`.

### 3.5 Xác nhận đổi quà tại quầy
`PUT /api/admin/redemptions/{code}/use` — xem mục 2.4.

---

## 4. Sơ đồ trạng thái Booking

```
PENDING_PAYMENT --(quá 15' chưa cọc)--> CANCELLED   [tự động, BookingScheduler]
PENDING_PAYMENT --(cọc VNPay thành công)--> CONFIRMED
PENDING_PAYMENT --(cọc VNPay thất bại)--> CANCELLED
CONFIRMED --(admin xác nhận đã thu đủ tiền còn lại)--> COMPLETED   [+10 điểm, xét lại hạng]
CONFIRMED --(admin thao tác thủ công)--> CANCELLED / NO_SHOW
```

Lưu ý: **không có đường tự động nào dẫn tới `COMPLETED`** — luôn cần một hành động thủ công của nhân viên xác nhận đã thu tiền, đây là điểm đã sửa để bịt lỗ hổng "tiền còn lại đi đâu".

---

## 5. Các điểm còn hạn chế / có thể cải thiện (chưa làm trong lần này)

1. **Review**: có schema, chưa có API tạo/đọc review theo booking cụ thể (chỉ có avg rating).
2. **Logout**: không vô hiệu hoá token phía server (giới hạn cố hữu của JWT stateless không có blacklist).
3. **Guard admin lặp code**: 3 trang admin tự viết logic kiểm tra role giống nhau, nên gộp thành 1 `<ProtectedRoute>`.
4. **Không có axios interceptor 401 toàn cục**: token hết hạn giữa chừng không tự động đá về `/login`.
5. **Trang "Hồ sơ của tôi" đầy đủ** (sửa tên/SDT/email) trong ảnh mẫu ban đầu chưa được xây — hiện `/rewards` chỉ có phần điểm/hạng/đổi quà.
