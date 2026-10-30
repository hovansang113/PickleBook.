# Terra Pickleball

Hệ thống đặt sân pickleball trực tuyến — tìm sân, đặt lịch, thanh toán cọc qua VNPay, và quản trị (dashboard, quản lý sân/booking) cho admin.

Tài liệu chi tiết từng tính năng + luồng hoạt động: xem [FEATURE.md](./FEATURE.md).

## Kiến trúc

Dự án gồm 2 phần tách biệt, chạy độc lập:

```
SangPickle/
├── backend/    Spring Boot (Java) + MySQL + JWT + VNPay
└── frontend/   React + Vite + Tailwind CSS v4
```

## Tech stack

**Backend**
- Spring Boot (Web, Data JPA, Security, OAuth2 Resource Server, Validation)
- MySQL
- JWT (Nimbus JOSE) cho xác thực, phân quyền theo role qua `JwtAuthenticationConverter`
- Tích hợp thanh toán VNPay (sandbox)
- `@Scheduled` job tự động huỷ/hoàn thành booking theo thời gian

**Frontend**
- React 19 + Vite
- Tailwind CSS v4 (theme màu/font tuỳ chỉnh — xem `frontend/src/index.css`)
- React Router v7
- Zustand (state quản lý auth, có `persist` vào `localStorage`)
- Recharts (biểu đồ dashboard admin)
- Axios, React Toastify

## Chạy dự án

### 1. Backend

Yêu cầu: JDK, Docker Desktop. MySQL chạy qua Docker ở `localhost:3307`:

```bash
cd backend
docker compose up -d
```

```bash
cd backend
# Cấu hình DB + VNPay trong src/main/resources/application.properties trước khi chạy
./gradlew bootRun
```

Backend chạy ở `http://localhost:5050`. Khi khởi động lần đầu, seeder tự động tạo:
- Tài khoản admin: `admin@gmail.com` / `admin@123`
- 6 sân mẫu (Sân 1–6)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy ở `http://localhost:5173`.

## Ghi chú cấu hình quan trọng

- CORS ở backend (`SecurityConfiguration.java`) cho phép `http://localhost:3000`, `http://localhost:5173` và `http://127.0.0.1:5173` — đổi frontend port thì phải cập nhật lại.
- VNPay sandbox cần `vnp_TmnCode` + `vnp_HashSecret` đúng cặp (đăng ký tại `sandbox.vnpayment.vn`), khai báo trong `application.properties`.
- `vnp_ReturnUrl` trỏ về frontend (`/payment/result`), không phải backend — frontend nhận query param rồi tự gọi lại backend để xác nhận.
