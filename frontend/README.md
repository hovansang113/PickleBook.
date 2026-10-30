# Terra Pickleball — Frontend

Frontend cho hệ thống đặt sân pickleball Terra Pickleball. Xem tổng quan toàn dự án (bao gồm backend) tại [../README.md](../README.md), và chi tiết từng tính năng tại [../FEATURE.md](../FEATURE.md).

## Tech stack

- **React 19** + **Vite** — build tool, HMR
- **Tailwind CSS v4** — theme màu/font tuỳ chỉnh riêng (xem `src/index.css`, khối `@theme`), không dùng file `tailwind.config.js` (Tailwind v4 cấu hình thẳng trong CSS)
- **React Router v7** — điều hướng, bảo vệ route theo trạng thái đăng nhập/role
- **Zustand** — quản lý state đăng nhập (`useAuthStore`), có middleware `persist` lưu vào `localStorage`
- **Axios** — gọi API
- **React Toastify** — thông báo
- **Recharts** — biểu đồ ở trang Dashboard admin

## Cài đặt & chạy

```bash
npm install
npm run dev       # chạy dev server tại http://localhost:5173
npm run build     # build production
npm run lint      # kiểm tra ESLint
```

**Yêu cầu:** backend phải đang chạy ở `http://localhost:5050` (xem `../README.md`) — mọi gọi API trong `src/features/*/**Service.jsx` đang trỏ cứng tới địa chỉ này.

## Cấu trúc thư mục

```
src/
├── page/           Các trang (route-level components)
├── components/      Component dùng chung (Button, Card, Header, AdminSidebar...)
├── features/        Logic theo domain — mỗi domain có Service gọi API riêng
│   ├── auth/         useAuthStore.jsx, AuthService.jsx
│   ├── courts/        CourtService.jsx, courtTypeLabel.jsx
│   ├── bookings/       BookingService.jsx, PaymentService.jsx, bookingStatus.jsx
│   └── admin/          AdminService.jsx
└── assets/           Ảnh tĩnh
```

**Quy ước:** mỗi domain trong `features/` chỉ chứa logic gọi API + state, không chứa JSX render — JSX luôn nằm ở `page/` hoặc `components/`.

## Thiết kế (Terra Design System)

Bảng màu/font định nghĩa tại `src/index.css`:

| Token | Ý nghĩa |
|---|---|
| `bg-primary`, `text-primary` | Xanh lá thương hiệu (`#4a7c59`) |
| `bg-background` | Nền kem ấm (`#faf6f0`) |
| `text-tertiary` | Vàng hổ phách (nhấn/badge) |
| `neutral-50` → `neutral-900` | Thang xám ấm |
| `bg-success-bg`/`text-success`, tương tự cho `warning`/`error` | Màu trạng thái |
| `font-headline` | Literata (tiêu đề) |
| `font-body` | Nunito Sans (nội dung) |

Chi tiết đầy đủ về nguyên tắc thiết kế: xem mục 12 trong [FEATURE.md](../FEATURE.md).
