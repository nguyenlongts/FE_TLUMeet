# TLUMeeting Frontend

Giao diện người dùng của hệ thống quản lý cuộc họp TLUMeeting, xây dựng bằng React + Vite.

## Tech Stack

| Thư viện | Mục đích |
|---|---|
| React 19 + Vite 7 | Framework UI + build tool |
| Redux Toolkit + RTK Query | State management + data fetching |
| React Router DOM v7 | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Ant Design v6 | UI component library |


## Biến môi trường

Tạo file `.env` trong thư mục `FE/`:

```env
VITE_API_URL=http://localhost:5555/api
VITE_NOTI_API_URL=http://localhost:5555
VITE_MEETING_API_URL=http://localhost:5555/api
```

> Tất cả request đều đi qua API Gateway ở port `5555`.

## Cài đặt & Chạy

```bash
cd FE
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173`.

### Các lệnh khác

```bash
npm run build    # Build production
npm run preview  # Xem trước bản build
npm run lint     # Kiểm tra lint
```

## Cấu trúc thư mục

```
FE/
├── public/
├── src/
│   ├── assets/            # Hình ảnh, logo (tlumeet-logo.png)
│   ├── components/        # Component dùng chung
│   │   ├── NotificationBell.jsx   # Chuông thông báo + panel
│   │   ├── InviteModal.jsx        # Modal mời thành viên
│   │   └── StatCard.jsx           # Card thống kê dashboard
│   ├── locales/           # File dịch ngôn ngữ
│   │   ├── vi.json
│   │   └── en.json
│   ├── pages/
│   │   ├── auth/          # Đăng nhập, đăng ký
│   │   ├── dashboard/     # Dashboard chính + Sidebar
│   │   ├── meetings/      # Danh sách, tạo, phòng họp
│   │   ├── admin/         # Trang quản trị
│   │   └── profile/       # Trang hồ sơ cá nhân
│   ├── redux/
│   │   ├── store.js
│   │   └── features/
│   │       ├── auth/      # authApi, authSlice
│   │       └── meetings/  # meetingsApi (RTK Query)
│   ├── i18n.js            # Cấu hình i18next
│   ├── App.jsx
│   └── main.jsx
├── .env                   # Biến môi trường (không commit)
├── package.json
└── vite.config.js
```

## Tính năng chính

### Xác thực
- Đăng nhập / đăng ký qua AuthService
- JWT được lưu vào Redux store, tự động gắn vào header Authorization
- Phân quyền: user / admin

### Dashboard
- Thống kê số cuộc họp hôm nay, giờ đến cuộc họp tiếp theo
- Hiển thị 6 cuộc họp mới nhất, nút "Xem thêm" để chuyển sang trang Meetings

### Quản lý cuộc họp
- Tạo cuộc họp ngay lập tức hoặc lên lịch
- Validate form: tiêu đề (3–100 ký tự), mô tả (tối đa 500 ký tự), không cho phép đặt lịch trong quá khứ
- Sửa / xóa cuộc họp
- Mời thành viên qua email, kiểm tra trùng lặp lời mời

### Phòng họp (Video)
- Tích hợp JaaS (8x8.vc) Jitsi 
- Host có thể kết thúc cuộc họp cho tất cả thành viên
- Sau khi kết thúc, danh sách cuộc họp tự cập nhật (RTK Query cache invalidation)

### Thông báo
- Nhận thông báo real-time qua SignalR
- Click vào thông báo để xem chi tiết cuộc họp
- Trạng thái chấp nhận / từ chối lời mời được lưu trong session

### Đa ngôn ngữ
- Hỗ trợ Tiếng Việt và English
- Chuyển đổi ngôn ngữ không cần reload trang

## Kết nối Backend

Frontend kết nối với hệ thống backend qua API Gateway (`localhost:5555`).

Để khởi động toàn bộ backend:

```bash
# Tạo file .env ở thư mục gốc (TLUMeet-Microservice/)
JWT_KEY=<your_jwt_key>
SA_PASSWORD=<your_sql_password>
AUTH_VERSION=1.0.0
MEETING_VERSION=1.0.0
NOTI_VERSION=1.0.0

# Chạy Docker Compose
docker compose up -d
```

Các service backend:

| Service | Port |
|---|---|
| API Gateway | 5555 |
| AuthService | 8081 |
| MeetingService | 8083 |
| NotificationService | 8082 |
| SQL Server | 14333 |
| MongoDB | 27018 |
| Kowl (Kafka UI) | 8080 |
