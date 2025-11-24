# Hướng dẫn Implement Search và Notification

## 1. Global Search (Tìm kiếm toàn cục)

### Mục đích
Cho phép admin tìm kiếm nhanh các entities (Products, Orders, Users, Stores) từ header.

### Cách implement:

#### Backend (API):
1. **Tạo endpoint global search:**
   ```typescript
   // apps/api/src/modules/search/search.controller.ts
   @Get('admin/search')
   async globalSearch(@Query('q') query: string, @Query('type') type?: string) {
     // type: 'all' | 'products' | 'orders' | 'users' | 'stores'
     // Nếu type = 'all', search tất cả
     // Nếu có type, chỉ search trong module đó
   }
   ```

2. **Service logic:**
   ```typescript
   // apps/api/src/modules/search/search.service.ts
   async search(query: string, type?: string) {
     const results = {
       products: [],
       orders: [],
       users: [],
       stores: [],
     };
     
     if (!type || type === 'all' || type === 'products') {
       // Search products by name, SKU, brand
       results.products = await this.productsService.search(query);
     }
     
     if (!type || type === 'all' || type === 'orders') {
       // Search orders by orderNumber, customerName, customerPhone
       results.orders = await this.ordersService.search(query);
     }
     
     // Tương tự cho users và stores
     
     return results;
   }
   ```

#### Frontend:
1. **Tạo Search Service:**
   ```typescript
   // apps/admin/src/services/search.service.ts
   class SearchService {
     async search(query: string, type?: string) {
       const response = await apiClient.get('/admin/search', {
         params: { q: query, type }
       });
       return response.data.data;
     }
   }
   ```

2. **Tạo Search Component với Dropdown:**
   ```typescript
   // apps/admin/src/components/GlobalSearch.tsx
   - Input với debounce (300ms)
   - Dropdown hiển thị kết quả khi typing
   - Group results theo type (Products, Orders, Users, Stores)
   - Click vào item → navigate đến detail page
   - Keyboard navigation (arrow keys, enter)
   ```

3. **Integrate vào AdminLayout:**
   ```typescript
   // Thay thế Input hiện tại bằng GlobalSearch component
   <GlobalSearch />
   ```

### UI Flow:
- User type → debounce 300ms → call API
- Hiển thị dropdown với kết quả grouped
- Mỗi item có: icon, title, subtitle, type badge
- Click → navigate đến detail page
- ESC để đóng dropdown

---

## 2. Notification System (Hệ thống thông báo)

### Mục đích
Hiển thị thông báo về:
- Orders mới cần xử lý
- Orders sắp hết hạn
- System alerts
- Updates từ admin khác

### Cách implement:

#### Backend (API):
1. **Tạo Notification Entity:**
   ```typescript
   // apps/api/src/entities/notification.entity.ts
   @Entity()
   export class Notification {
     @PrimaryKey({ type: 'uuid' })
     id: string = v4();
     
     @Property()
     title!: string;
     
     @Property({ type: 'text' })
     message!: string;
     
     @Property()
     type: 'order' | 'system' | 'alert' = 'system';
     
     @Property({ nullable: true })
     relatedId?: string; // ID của order/user/etc
     
     @Property({ default: false })
     read: boolean = false;
     
     @ManyToOne(() => User, { nullable: true })
     user?: User; // null = broadcast to all admins
     
     @Property({ onCreate: () => new Date() })
     createdAt: Date = new Date();
   }
   ```

2. **Tạo Notification Service:**
   ```typescript
   // apps/api/src/modules/notifications/notifications.service.ts
   - createNotification() // Tạo notification
   - getUserNotifications() // Lấy notifications của user
   - markAsRead() // Đánh dấu đã đọc
   - markAllAsRead() // Đánh dấu tất cả đã đọc
   - getUnreadCount() // Đếm số chưa đọc
   ```

3. **Auto-create notifications:**
   ```typescript
   // Trong orders.service.ts khi tạo order mới:
   await this.notificationsService.createNotification({
     title: 'Đơn hàng mới',
     message: `Đơn hàng ${order.orderNumber} cần xử lý`,
     type: 'order',
     relatedId: order.id,
   });
   ```

4. **WebSocket/SSE cho real-time (optional):**
   ```typescript
   // Sử dụng Socket.io hoặc Server-Sent Events
   // Để push notification real-time đến admin
   ```

#### Frontend:
1. **Tạo Notification Service:**
   ```typescript
   // apps/admin/src/services/notifications.service.ts
   class NotificationsService {
     async getAll() { }
     async getUnreadCount() { }
     async markAsRead(id: string) { }
     async markAllAsRead() { }
   }
   ```

2. **Tạo Notification Component:**
   ```typescript
   // apps/admin/src/components/NotificationDropdown.tsx
   - DropdownMenu trigger với Bell icon
   - Badge hiển thị số unread
   - DropdownContent hiển thị list notifications
   - Mỗi notification có:
     * Icon theo type
     * Title + message
     * Time ago
     * Read/unread state
     * Click → navigate đến related page
   - "Mark all as read" button
   - "View all" link
   ```

3. **Polling hoặc WebSocket:**
   ```typescript
   // Trong AdminLayout hoặc NotificationContext
   useEffect(() => {
     // Poll mỗi 30 giây để check notifications mới
     const interval = setInterval(() => {
       fetchNotifications();
     }, 30000);
     
     return () => clearInterval(interval);
   }, []);
   ```

4. **Integrate vào AdminLayout:**
   ```typescript
   <NotificationDropdown />
   ```

### UI Flow:
- Bell icon với badge số unread
- Click → mở dropdown với list notifications
- Unread có background highlight
- Click notification → navigate + mark as read
- "Mark all as read" → clear tất cả
- Auto refresh mỗi 30s hoặc real-time qua WebSocket

---

## 3. Implementation Priority

### Phase 1 (Cơ bản):
1. ✅ Global Search với dropdown results
2. ✅ Notification list với polling (30s)

### Phase 2 (Nâng cao):
1. ⬜ Keyboard shortcuts cho search (Cmd/Ctrl + K)
2. ⬜ Search history
3. ⬜ Real-time notifications với WebSocket
4. ⬜ Notification preferences/settings

---

## 4. Code Structure

```
apps/admin/src/
├── components/
│   ├── GlobalSearch.tsx
│   └── NotificationDropdown.tsx
├── services/
│   ├── search.service.ts
│   └── notifications.service.ts
└── contexts/
    └── NotificationContext.tsx (optional)

apps/api/src/
├── modules/
│   ├── search/
│   │   ├── search.controller.ts
│   │   ├── search.service.ts
│   │   └── search.module.ts
│   └── notifications/
│       ├── notifications.controller.ts
│       ├── notifications.service.ts
│       ├── notifications.module.ts
│       └── dto/
└── entities/
    └── notification.entity.ts
```

---

## 5. Example Code Snippets

### GlobalSearch Component:
```typescript
const [query, setQuery] = useState('');
const [results, setResults] = useState(null);
const [isOpen, setIsOpen] = useState(false);

const debouncedSearch = useDebounce(query, 300);

useEffect(() => {
  if (debouncedSearch.length >= 2) {
    searchService.search(debouncedSearch).then(setResults);
    setIsOpen(true);
  }
}, [debouncedSearch]);
```

### NotificationDropdown Component:
```typescript
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000);
  return () => clearInterval(interval);
}, []);
```

