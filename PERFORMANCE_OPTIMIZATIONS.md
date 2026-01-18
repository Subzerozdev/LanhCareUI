# Tối ưu Performance - LanhCare Admin Dashboard

## Vấn đề đã phát hiện

1. **Login mất hơn 10 giây** để vào Dashboard
2. **Table loading mất vài giây** để hiển thị dữ liệu
3. **Backend trên Render** có thể chậm do cold start (free tier)

## Các tối ưu đã thực hiện

### 1. ✅ Tối ưu Login Flow

**File:** `app/page.tsx`, `app/login/page.tsx`

**Thay đổi:**
- ❌ Bỏ `setTimeout(100)` không cần thiết trong `app/page.tsx`
- ❌ Bỏ `router.refresh()` sau `router.push()` trong login page
- ✅ Redirect ngay lập tức sau khi login thành công

**Kết quả:** Giảm delay ~100-200ms

### 2. ✅ Tối ưu Dashboard API Calls

**File:** `app/dashboard/page.tsx`

**Thay đổi:**
- ❌ Trước: 4 API calls tuần tự (sequential) - tổng thời gian = sum của tất cả
- ✅ Sau: 4 API calls song song (parallel) với `Promise.allSettled()` - tổng thời gian = max của tất cả

**Kết quả:** Giảm thời gian load dashboard từ ~4-8 giây xuống ~2-4 giây (nếu backend chậm)

### 3. ✅ Thêm Debounce cho Search

**File:** `lib/hooks/useDebounce.ts`, `app/admin/users/page.tsx`

**Thay đổi:**
- ✅ Tạo custom hook `useDebounce` với delay 500ms
- ✅ Áp dụng cho search input trong Users page
- ✅ Giảm số lượng API calls khi user đang gõ

**Kết quả:** Giảm API calls không cần thiết khi user đang gõ

### 4. ✅ Thêm Timeout cho API Calls

**File:** `lib/api.ts`

**Thay đổi:**
- ✅ Thêm `timeout: 30000` (30 giây) cho Axios instance
- ✅ Xử lý timeout error với message thân thiện
- ✅ Tránh đợi vô hạn nếu backend không phản hồi

**Kết quả:** Tránh đợi quá lâu, có error message rõ ràng

### 5. ✅ Giảm Console.log trong Production

**Files:** `lib/api.ts`, `lib/api/admin.ts`, `store/authStore.ts`, `app/login/page.tsx`

**Thay đổi:**
- ✅ Wrap tất cả `console.log/error/warn` trong `process.env.NODE_ENV === 'development'`
- ✅ Chỉ log trong development mode
- ✅ Giảm overhead trong production

**Kết quả:** Giảm overhead, code chạy nhanh hơn trong production

### 6. ✅ Tối ưu AdminLayout Auth Check

**File:** `components/AdminLayout.tsx`

**Thay đổi:**
- ✅ Check localStorage ngay lập tức (sync) trước khi gọi `checkAuth()`
- ✅ Set state ngay nếu có token hợp lệ trong localStorage
- ✅ Không chặn render nếu đã có auth data trong localStorage

**Kết quả:** Giảm delay khi vào các trang admin

## Các tối ưu khuyến nghị tiếp theo

### Backend (Render.com)

1. **Upgrade Render Plan:**
   - Free tier có cold start ~10-30 giây
   - Paid tier ($7/month) không có cold start
   - Hoặc dùng service như Railway, Fly.io

2. **Database Optimization:**
   - Kiểm tra indexes trên các cột thường query
   - Tối ưu queries trong backend
   - Sử dụng connection pooling

3. **Caching:**
   - Thêm Redis cache cho các queries thường dùng
   - Cache stats trong dashboard
   - Cache user list với TTL ngắn

### Frontend

1. **Thêm Loading Skeletons:**
   - Thay vì spinner, hiển thị skeleton UI
   - User cảm thấy app responsive hơn

2. **Pagination Optimization:**
   - Giảm page size mặc định từ 20 xuống 10-15
   - Load more thay vì pagination nếu cần

3. **Lazy Loading:**
   - Code splitting cho các routes
   - Lazy load các components lớn

4. **Service Worker / Caching:**
   - Cache static assets
   - Cache API responses với TTL ngắn

5. **Áp dụng Debounce cho tất cả Search:**
   - Các trang: Posts, Comments, Hospitals, etc.
   - Đã làm cho Users page, cần làm cho các trang khác

## Monitoring

Để theo dõi performance:

1. **Browser DevTools:**
   - Network tab: Xem thời gian API calls
   - Performance tab: Xem render time

2. **Backend Logs:**
   - Check Render logs để xem response time
   - Identify slow queries

3. **Frontend Analytics:**
   - Có thể thêm Sentry hoặc LogRocket để track performance

## Kết quả mong đợi

Sau các tối ưu này:
- **Login:** Giảm từ 10+ giây xuống ~2-3 giây (nếu backend không cold start)
- **Dashboard:** Giảm từ 4-8 giây xuống ~2-3 giây
- **Table loading:** Giảm từ vài giây xuống ~1-2 giây

**Lưu ý:** Nếu backend trên Render free tier vẫn cold start, vẫn sẽ có delay ~10-30 giây ở lần request đầu tiên sau khi idle.
