# Báo cáo lỗi Backend - Admin User CRUD

## Vấn đề

Khi gọi API `GET /api/admin/users` để lấy danh sách users, backend trả về lỗi **500 Internal Server Error** với message:
```
No enum constant com.lanhcare.enums.healthprofile.HealthGoal.Tăng cơ, cải thiện sức khỏe tim mạch
```

## Nguyên nhân

1. **Account Entity có relationship với UserHealthProfile**:
   ```java
   @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
   private UserHealthProfile healthProfile;
   ```

2. **Database có dữ liệu không hợp lệ**:
   - Trong bảng `UserHealthProfile`, field `health_goals` có giá trị: `"Tăng cơ, cải thiện sức khỏe tim mạch"`
   - Enum `HealthGoal` chỉ có 3 giá trị: `LOSE_WEIGHT`, `MAINTAIN`, `EXTREME_GAIN`
   - Khi JPA load `Account` entity, nó có thể trigger lazy load `healthProfile`
   - Khi Jackson serialize hoặc JPA parse enum, nó throw exception vì giá trị không khớp

3. **Luồng xử lý hiện tại**:
   - `AdminUserController.getAllUsers()` → `AdminUserService.getAllUsers()`
   - `getAllUsers()` gọi `mapToUserResponse(Account account)`
   - `mapToUserResponse()` chỉ map các field cơ bản, **KHÔNG load healthProfile**
   - Nhưng khi JPA load `Account` entity từ database, nó có thể trigger lazy load `healthProfile` relationship
   - Khi parse enum `healthGoals` từ database, nó throw exception

## Giải pháp Backend cần sửa

### Option 1: Không load healthProfile relationship (RECOMMENDED)

Trong `Account.java`, thêm `@JsonIgnore` hoặc set `FetchType.LAZY` và đảm bảo không serialize:

```java
@OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
@JsonIgnore  // Hoặc dùng @JsonView
private UserHealthProfile healthProfile;
```

### Option 2: Handle exception khi load healthProfile

Trong `AdminUserService.mapToUserResponse()`, thêm try-catch:

```java
private AdminUserResponse mapToUserResponse(Account account) {
    // Đảm bảo không trigger lazy load healthProfile
    // Hoặc catch exception nếu có
    try {
        // Existing code...
    } catch (Exception e) {
        // Log và continue without healthProfile
    }
}
```

### Option 3: Dùng DTO Projection thay vì Entity

Thay vì load `Account` entity, dùng DTO projection để chỉ select các field cần thiết:

```java
@Query("SELECT new com.lanhcare.dto.admin.user.AdminUserResponse(...) FROM Account a WHERE ...")
Page<AdminUserResponse> findAllUsersProjection(...);
```

### Option 4: Sửa dữ liệu trong Database

Update các record có `health_goals` không hợp lệ:
- `"Tăng cơ, cải thiện sức khỏe tim mạch"` → `EXTREME_GAIN` hoặc `MAINTAIN`
- Hoặc set `NULL` nếu không cần thiết

## Luồng đúng nên làm

**GET /api/admin/users** (List users):
- Chỉ cần: `id`, `email`, `fullname`, `role`, `status`, `transactionCount`, `totalSpent`
- **KHÔNG CẦN**: `healthProfile`, `transactions` details, `dailyLogs`, etc.

**GET /api/admin/users/{id}** (User detail):
- Có thể load `healthProfile` nếu cần
- Nhưng phải handle exception nếu enum không hợp lệ

## File cần sửa

1. `src/main/java/com/lanhcare/entity/Account.java`
   - Thêm `@JsonIgnore` trên `healthProfile` relationship
   - Hoặc set `fetch = FetchType.LAZY` và đảm bảo không serialize

2. `src/main/java/com/lanhcare/service/admin/AdminUserService.java`
   - Đảm bảo `mapToUserResponse()` không trigger load healthProfile
   - Hoặc thêm try-catch để handle exception

3. Database (nếu có thể):
   - Update các record có `health_goals` không hợp lệ

## Test case

Sau khi fix, test:
1. `GET /api/admin/users?page=0&size=20` → Should return 200 OK
2. `GET /api/admin/users/{id}` → Should return 200 OK (có thể có healthProfile nếu cần)
