# Cinema Booking Ticket System

Hệ thống đặt vé xem phim trực tuyến - Frontend Application

## Demo

- **Production URL**: https://cinema-booking-ticket-system.vercel.app
- **Backend API**: https://cinema-backend-yc14.onrender.com

## Tài khoản test

### Admin
- **Email**: admin@cinema.com
- **Password**: admin123
- **Quyền**: Quản lý toàn bộ hệ thống (phim, rạp, suất chiếu, đặt vé, ngườii dùng)

### Khách hàng (Customer)
Bạn có thể đăng ký tài khoản mới tại trang `/auth/login` hoặc sử dụng tài khoản test:
- Đăng ký với email bất kỳ để trải nghiệm đầy đủ tính năng

## Tính năng chính

### Admin Dashboard
- Quản lý phim (thêm, sửa, xóa, cập nhật trạng thái)
- Quản lý rạp chiếu và phòng chiếu
- Quản lý suất chiếu
- Quản lý đặt vé
- Quản lý ngườii dùng
- Thống kê doanh thu

### Customer Portal
- Xem danh sách phim đang chiếu và sắp chiếu
- Xem chi tiết phim
- Đặt vé với chọn ghế trực quan
- Xem lịch sử đặt vé
- Xem chi tiết vé (QR code, thông tin suất chiếu)
- Thanh toán (Mock VNPay cho demo)

## Công nghệ sử dụng

- **Framework**: Next.js 16.2.6
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Hooks

## Cài đặt và chạy local

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd booking-room-admin
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường
Tạo file `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://cinema-backend-yc14.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://cinema-backend-yc14.onrender.com
```

### Bước 4: Chạy development server
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Build production
```bash
npm run build
```

## Cấu trúc thư mục

```
booking-room-admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── customer/          # Customer portal pages
│   │   ├── auth/              # Authentication pages
│   │   └── payment/           # Payment callback
│   ├── components/            # React components
│   │   ├── ui/               # UI components (shadcn)
│   │   └── layout/           # Layout components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── services/              # API services
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── package.json
```

## API Endpoints

Frontend giao tiếp với backend qua REST API:

- **Base URL**: `https://cinema-backend-yc14.onrender.com/api`
- **Authentication**: JWT Token
- **WebSocket**: `wss://cinema-backend-yc14.onrender.com` (real-time seat updates)

## Deploy

### Vercel (Khuyến nghị)
1. Push code lên GitHub
2. Import project trên Vercel
3. Cấu hình environment variables
4. Deploy

### Environment Variables trên Vercel
```env
NEXT_PUBLIC_API_URL=https://cinema-backend-yc14.onrender.com/api
NEXT_PUBLIC_WS_URL=wss://cinema-backend-yc14.onrender.com
```

## Lưu ý

- Hệ thống sử dụng **mock payment** cho mục đích demo
- Database được reset định kỳ trên môi trường development
- Một số tính năng có thể bị giới hạn do dùng plan miễn phí của hosting services

## License

MIT License

## Liên hệ

Nếu có vấn đề hoặc góp ý, vui lòng tạo issue trên repository.
