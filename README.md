# LanhCare Admin Dashboard

Giao diện quản trị cho hệ thống LanhCare, được xây dựng với Next.js 14, TypeScript và Tailwind CSS.

## Tính năng

- ✅ Đăng nhập với xác thực JWT
- ✅ Dashboard tổng quan với thống kê
- ✅ Quản lý người dùng (CRUD đầy đủ)
- ✅ Quản lý bài viết với kiểm duyệt
- ✅ Quản lý bình luận với kiểm duyệt
- ✅ Quản lý gói dịch vụ
- ✅ Quản lý doanh thu và giao dịch
- ✅ Quản lý bệnh viện
- ✅ Quản lý ICD-11
- ✅ Quản lý dinh dưỡng
- ✅ Responsive design
- ✅ Error handling và notifications

## Yêu cầu

- Node.js 18+ 
- npm hoặc yarn

## Cài đặt

1. Clone repository hoặc tải source code
2. Cài đặt dependencies:

```bash
npm install
# hoặc
yarn install
```

3. Tạo file `.env.local` (tùy chọn, mặc định sẽ dùng `https://lanhcare.onrender.com`):

```env
NEXT_PUBLIC_API_URL=https://lanhcare.onrender.com
```

4. Chạy development server:

```bash
npm run dev
# hoặc
yarn dev
```

5. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt

## Đăng nhập

Sử dụng tài khoản Admin để đăng nhập:
- Email: `admin@lanhcare.com` (hoặc email admin khác từ backend)
- Password: Mật khẩu của tài khoản admin

**Lưu ý:** Chỉ tài khoản có role `ADMIN` mới có thể đăng nhập vào hệ thống.

## Cấu trúc Project

```
├── app/                    # Next.js App Router
│   ├── login/              # Trang đăng nhập
│   ├── dashboard/          # Dashboard tổng quan
│   └── admin/              # Các trang quản lý
│       ├── users/          # Quản lý người dùng
│       ├── posts/          # Quản lý bài viết
│       ├── comments/       # Quản lý bình luận
│       ├── service-plans/  # Quản lý gói dịch vụ
│       ├── revenue/        # Quản lý doanh thu
│       ├── hospitals/      # Quản lý bệnh viện
│       ├── icd11/          # Quản lý ICD-11
│       └── nutrition/      # Quản lý dinh dưỡng
├── components/             # React components
│   ├── AdminLayout.tsx    # Layout chính cho admin
│   ├── Sidebar.tsx        # Sidebar navigation
│   ├── Header.tsx         # Header với search và notifications
│   └── users/             # Components cho user management
├── lib/                    # Utilities và API clients
│   ├── api.ts             # Axios instance
│   ├── auth.ts            # Auth API
│   └── api/admin.ts       # Admin API endpoints
├── store/                  # Zustand stores
│   └── authStore.ts       # Authentication store
└── public/                 # Static files
```

## API Endpoints

Tất cả API calls được thực hiện thông qua `lib/api/admin.ts`. Backend API base URL: `https://lanhcare.onrender.com`

### Các module chính:

- **Users**: `/api/admin/users`
- **Posts**: `/api/admin/posts`
- **Comments**: `/api/admin/comments`
- **Service Plans**: `/api/admin/service-plans`
- **Revenue**: `/api/admin/revenue`
- **Hospitals**: `/api/admin/hospitals`
- **ICD-11**: `/api/admin/icd11`
- **Nutrition**: `/api/admin/nutrition`

## Build cho Production

```bash
npm run build
npm start
```

## Công nghệ sử dụng

- **Next.js 14**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **React Hook Form**: Form handling
- **Zustand**: State management
- **React Hot Toast**: Notifications
- **Lucide React**: Icons

## Lưu ý

- Đảm bảo backend API đang chạy và có thể truy cập được
- Token JWT được lưu trong localStorage
- Tất cả requests đều có Authorization header với Bearer token
- Error handling tự động redirect về login nếu token hết hạn

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Backend API có đang chạy không
2. CORS settings trên backend
3. Token có hợp lệ không
4. Console logs để xem lỗi chi tiết
