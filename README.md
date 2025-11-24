# 🛒 E-Commerce Platform with Real-Time Features

A full-stack e-commerce platform built with **Laravel 12**, **React**, and **Inertia.js**, featuring real-time cart synchronization, live order tracking, and advanced search capabilities.

## 🌟 Key Features

### 🛍️ Shopping Experience
- **Product Search**: Powered by **Typesense** for blazing-fast, typo-tolerant search
- **Real-Time Stock Updates**: Live product availability broadcasting to all users
- **Smart Product Filtering**: Category-based filtering with faceted search
- **Product Details**: Comprehensive product pages with image galleries

### 🛒 Advanced Cart Management
- **Redis-Based Cart Storage**: Lightning-fast cart operations with Redis hash storage
- **Real-Time Cart Sync**: WebSocket-based cart synchronization across multiple tabs/devices
- **Guest to User Cart Migration**: Seamless cart merge on login using session-based sync
- **Broadcast Cart Events**: Live updates on cart add/remove/update actions
- **Session & User ID Broadcasting**: Dual-channel support for guest and authenticated users

### 📦 Order & Delivery Tracking
- **Real-Time Driver Location**: Live GPS tracking with Google Maps integration
- **ETA Calculations**: Dynamic distance and time estimates
- **Delivery Status Broadcasting**: Live order status updates via WebSockets
- **Multi-Role Order Channels**: Secure broadcasting for customers, drivers, and admins
- **Order History**: Complete order tracking with status timeline

### 🔐 Authentication & Authorization
- **Multi-Auth System**: Laravel Sanctum for API authentication
- **Google OAuth**: Social login integration with Laravel Socialite
- **Role-Based Access Control**: Spatie Laravel Permission (Admin, Driver, Customer)
- **Secure Sessions**: Session-based auth with CSRF protection

### 📊 Admin Dashboard (Filament)
- **Admin Panel**: Full-featured admin panel with Filament 4.0
- **Analytics Widgets**: Real-time stats (orders, revenue, users, products)
- **Chart Visualizations**: Orders and revenue trends over time
- **Resource Management**: CRUD operations for products, orders, users, drivers
- **Role-Based Widgets**: Admin-only dashboard with permission checks

### 🔄 Real-Time Broadcasting
- **Laravel Reverb**: WebSocket server for real-time events
- **Private Channels**: Secure user-specific cart and order channels
- **Public Channels**: Guest cart broadcasting
- **Event Broadcasting**:
  - `CartSynced` - Cart synchronization across sessions
  - `CartItemAdded/Updated/Removed` - Individual cart item changes
  - `DriverLocationUpdate` - Live driver GPS coordinates
  - `DeliveryStatus` - Order status changes
  - `StockUpdated` - Product availability updates

### 💳 Payment Processing
- **Payment Integration**: Secure checkout flow
- **Order Management**: Automated order creation and confirmation
- **Stock Management**: Real-time inventory updates with Redis caching

## 🛠️ Tech Stack

### Backend
- **Framework**: Laravel 12
- **Database**: MySQL/PostgreSQL
- **Cache & Queue**: Redis (Predis client)
- **Search Engine**: Typesense
- **Real-Time**: Laravel Reverb (WebSockets)
- **Background Jobs**: Laravel Horizon (Redis-based queue)
- **Authentication**: Laravel Sanctum + Laravel Socialite (Google OAuth)
- **Permissions**: Spatie Laravel Permission
- **Admin Panel**: Filament 4.0

### Frontend
- **Framework**: React 18
- **Router**: Inertia.js 2.0
- **Styling**: Tailwind CSS 3.0
- **UI Components**: Headless UI
- **Forms**: Tailwind Forms
- **Build Tool**: Vite
- **Real-Time**: Laravel Echo + Pusher.js
- **Search UI**: React InstantSearch + Typesense Adapter
- **Maps**: Google Maps React API
- **Notifications**: React Toastify

### DevOps & Tools
- **Development**: Laravel Sail (Docker)
- **Code Quality**: Laravel Pint, PHPUnit
- **Logging**: Laravel Pail
- **Route Generation**: Ziggy (Laravel routes in JavaScript)
- **Concurrency**: Concurrently (multi-process development)

## 📁 Project Structure

```
├── app/
│   ├── Events/                    # Broadcasting events
│   │   ├── CartSynced.php        # Cart sync across sessions
│   │   ├── CartItemAdded.php      # Cart item events
│   │   ├── DriverLocationUpdate.php  # GPS broadcasting
│   │   └── DeliveryStatus.php     # Order status updates
│   ├── Services/
│   │   ├── CartService.php        # Redis-based cart logic
│   │   └── CheckoutService.php    # Checkout processing
│   ├── Filament/Admin/            # Admin panel
│   │   ├── Resources/            # CRUD resources
│   │   └── Widgets/              # Dashboard widgets
│   └── Http/Controllers/
│       ├── CartController.php     # Cart operations
│       ├── OrderController.php    # Order & tracking  
│       └── GoogleAuthController.php  # OAuth
├── resources/js/
│   ├── Pages/                     # Inertia pages
│   │   ├── Welcome.jsx           # Product listing
│   │   ├── ProductDetail.jsx     # Product page
│   │   ├── Checkout.jsx          # Checkout flow
│   │   └── CustomerTrack.jsx      # Order tracking
│   └── components/
│       ├── CartProvider.jsx       # Cart state + real-time sync
│       ├── StatusProvider.jsx     # Order status broadcasting
│       ├── StockProvider.jsx      # Stock update listener
│       └── ProductHit.jsx         # Typesense search results
└── routes/
    └── channels.php              # Broadcast channel authorization
```

## 🚀 Key Implementations

### 1. Redis Cart with Session Sync
```php
// Dual identifier support: sessionId for guests, userId for authenticated
$identifier = auth()->check() ? 'user:' . auth()->id() : 'session:' . session()->getId();
Redis::hincrby("cart:{$identifier}", $productId, $quantity);
```

### 2. Guest to User Cart Migration
```php
// MergeGuestCartOnLogin listener
$guestCart = Redis::hgetall("cart:session:{$oldSessionId}");
foreach ($guestCart as $productId => $qty) {
    Redis::hincrby("cart:user:{$userId}", $productId, $qty);
}
Redis::del("cart:session:{$oldSessionId}");
```

### 3. Real-Time Cart Broadcasting
```php
// CartSynced event with dual channel support
public function broadcastOn(): array {
    if ($this->isAuthenticated) {
        return [new PrivateChannel("cart.{$this->identifier}")];
    }
    return [new Channel("cart.{$this->identifier}")];
}
```

### 4. Driver Location Broadcasting
```php
// Real-time GPS updates to customer
broadcast(new DriverLocationUpdate(
    $orderId, 
    ['lat' => $lat, 'lng' => $lng, 'eta' => $eta],
    $userId
))->toOthers();
```

### 5. Typesense Product Search
```php
// Scout searchable configuration
public function toSearchableArray() {
    return [
        'id' => (string) $this->id,
        'name' => $this->name,
        'description' => $this->description,
        'price' => (float) $this->price,
        'category' => $this->category->name,
    ];
}
```

## 📡 Broadcasting Channels

| Channel | Type | Purpose |
|---------|------|---------|
| `cart.{sessionId}` | Public | Guest cart updates |
| `cart.{userId}` | Private | Authenticated user cart |
| `order.{userId}` | Private | Order status & driver location |

## ⚡ Performance Features

- **Redis Caching**: Cart data, driver locations, ETA calculations
- **Lazy Loading**: Optimized React component loading
- **Queue Processing**: Background jobs with Horizon
- **Typesense Indexing**: Sub-50ms search responses
- **WebSocket Persistence**: Maintained connections for real-time updates

## 🔧 Setup & Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- Redis
- MySQL/PostgreSQL
- Typesense Server

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce_inertia
```

2. **Install dependencies**
```bash
composer install
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure services**
```env
# Database
DB_CONNECTION=mysql
DB_DATABASE=ecommerce

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Typesense
SCOUT_DRIVER=typesense
TYPESENSE_API_KEY=your-api-key
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108

# Broadcasting
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

5. **Database migration & seeding**
```bash
php artisan migrate --seed
```

6. **Index products in Typesense**
```bash
php artisan scout:import "App\Models\Product"
```

7. **Build frontend assets**
```bash
npm run build
```

### Development

Run all services concurrently:
```bash
composer dev
```

This starts:
- Laravel server (`php artisan serve`)
- Queue worker (`php artisan queue:listen`)
- Vite dev server (`npm run dev`)
- Pail logger (`php artisan pail`)

Or run individually:
```bash
# Terminal 1: Backend
php artisan serve

# Terminal 2: Reverb WebSocket
php artisan reverb:start

# Terminal 3: Queue worker
php artisan queue:work

# Terminal 4: Frontend
npm run dev
```

## 👤 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full dashboard access, manage all resources, view analytics |
| **Driver** | Update delivery status, share GPS location |
| **Customer** | Browse products, manage cart, place orders, track deliveries |

## 🎯 Use Cases

1. **Customer Journey**: Browse → Search → Add to Cart → Login (cart merges) → Checkout → Track Order
2. **Driver Workflow**: Accept order → Update location → Mark delivered
3. **Admin Operations**: Monitor sales → Manage inventory → View analytics

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Multi-vendor support
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] SMS order updates
- [ ] Advanced analytics dashboard

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using Laravel, React, TypeSense, and Redis**
