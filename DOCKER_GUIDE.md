# 🚀 Laravel Inertia React - Docker Local Hosting Guide

Complete guide for running your **Laravel Inertia React** e-commerce app locally using Docker.

## 📋 What's Included

Your Docker setup includes:
- **Nginx** - Web server (serves your app)
- **PHP-FPM** - Laravel backend with all extensions
- **Vite** - React dev server with Hot Module Replacement (HMR)
- **MySQL** - Database
- **Redis** - Cache & sessions
- **Typesense** - Search engine
- **phpMyAdmin** - Database management UI

## 🔧 Step 1: Install Docker

Check if Docker is installed:
```bash
docker --version
docker-compose --version
```

If not installed:
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

---

## 🚀 Step 2: Start Your Development Environment

### Option A: Development Mode (with Hot Reload)

```bash
cd /home/abdi/myp/ecommerce_inertia-1

# Start all containers
docker-compose up -d

# Wait for containers to start (check status)
docker-compose ps
```

This starts:
- ✅ Nginx on http://localhost
- ✅ Vite dev server on http://localhost:5173 (for React HMR)
- ✅ MySQL, Redis, Typesense
- ✅ phpMyAdmin on http://localhost:8080

### Option B: Production-like Mode (built assets)

```bash
# Build React assets first
npm install
npm run build

# Then start containers
docker-compose up -d
```

---

## 🛠️ Step 3: Setup Laravel Application

Run these commands **inside the PHP container**:

```bash
# Install PHP dependencies
docker-compose exec php composer install

# Generate application key
docker-compose exec php php artisan key:generate

# Run database migrations
docker-compose exec php php artisan migrate

# Seed database (optional)
docker-compose exec php php artisan db:seed

# Create storage link for file uploads
docker-compose exec php php artisan storage:link

# Fix permissions
docker-compose exec php chmod -R 775 storage bootstrap/cache
docker-compose exec php chown -R www-data:www-data storage bootstrap/cache
```

---

## 🌐 Step 4: Access Your Application

Open your browser:

- **Your App**: http://localhost
- **phpMyAdmin**: http://localhost:8080
  - Username: `root`
  - Password: `root`
- **Vite Dev Server**: http://localhost:5173 (auto-used by Laravel)

---

## ⚛️ How Inertia React Works in Docker

### Development Flow:

1. **Vite container** watches your React files in `resources/js/`
2. When you edit a `.jsx` file, Vite **hot reloads** instantly
3. **Laravel** serves the app through Nginx
4. **Inertia** bridges Laravel and React seamlessly

### File Structure:
```
resources/js/
├── app.jsx          # Inertia app entry point
├── Pages/           # Your React page components
└── Components/      # Reusable React components
```

---

## 📝 Common Commands

### Docker Container Management

```bash
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# Restart specific service
docker-compose restart nginx
docker-compose restart php
docker-compose restart vite

# View logs
docker-compose logs -f          # All containers
docker-compose logs -f vite     # Vite dev server
docker-compose logs -f php      # PHP errors
docker-compose logs -f nginx    # Web server
```

### Laravel Artisan Commands

```bash
# Run any artisan command
docker-compose exec php php artisan [command]

# Examples:
docker-compose exec php php artisan migrate:fresh --seed
docker-compose exec php php artisan cache:clear
docker-compose exec php php artisan config:clear
docker-compose exec php php artisan route:list
docker-compose exec php php artisan tinker
```

### Frontend Development

```bash
# Install npm packages (on host machine)
npm install

# Or inside Vite container
docker-compose exec vite npm install

# Build for production
npm run build
```

### Database Access

```bash
# Access MySQL CLI
docker-compose exec mysql mysql -u root -proot laravel_db

# Or use phpMyAdmin
# http://localhost:8080
```

---

## 🔍 Environment Configuration

Your `.env` file should have these settings for Docker:

```env
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=mysql              # Container name, not localhost!
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=secret

REDIS_HOST=redis           # Container name, not localhost!
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Typesense
TYPESENSE_HOST=typesense   # Container name
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz
```

---

## 🆘 Troubleshooting

### Port Already in Use

**Problem**: Port 80, 3306, or 5173 already in use

**Solution**:
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :3306

# Stop conflicting services
sudo systemctl stop apache2
sudo systemctl stop mysql

# Or change ports in docker-compose.yml
```

### Vite Not Hot Reloading

**Problem**: React changes not reflecting

**Solution**:
```bash
# Restart Vite container
docker-compose restart vite

# Check Vite logs
docker-compose logs -f vite

# Make sure vite.config.js has correct settings
```

### Permission Errors

**Problem**: Can't write to storage/logs

**Solution**:
```bash
docker-compose exec php chmod -R 775 storage bootstrap/cache
docker-compose exec php chown -R www-data:www-data storage bootstrap/cache
```

### Database Connection Failed

**Problem**: SQLSTATE[HY000] [2002] Connection refused

**Solution**:
- Check `.env` has `DB_HOST=mysql` (not localhost)
- Verify MySQL container is running: `docker-compose ps`
- Clear config cache: `docker-compose exec php php artisan config:clear`

### Composer Install Fails

**Problem**: Memory limit or timeout errors

**Solution**:
```bash
# Run with more memory
docker-compose exec php php -d memory_limit=-1 /usr/bin/composer install
```

---

## 🎯 Development Workflow

### Daily Development Routine:

```bash
# 1. Start containers (once per day)
docker-compose up -d

# 2. Make changes to your React components
# Edit files in resources/js/Pages/...

# 3. Changes auto-reload in browser (thanks to Vite HMR)

# 4. When done, stop containers
docker-compose down
```

### Making Backend Changes:

```bash
# 1. Edit Laravel controllers/models
# 2. Clear cache if needed
docker-compose exec php php artisan cache:clear

# 3. Run migrations if database changed
docker-compose exec php php artisan migrate
```

---

## 🌟 Optional Enhancements

### Add Custom Domain

```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1    myshop.local
```

Update `.env`:
```env
APP_URL=http://myshop.local
```

Access at: http://myshop.local

### Enable HTTPS (SSL)

```bash
# Generate self-signed certificate
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/nginx.key \
  -out docker/nginx/ssl/nginx.crt \
  -subj "/CN=myshop.local"
```

Then update Nginx config to use SSL.

---

## 📊 Service Ports Reference

| Service | Internal Port | External Port | Access |
|---------|--------------|---------------|--------|
| Nginx | 80 | 80 | http://localhost |
| Nginx SSL | 443 | 443 | https://localhost |
| Vite HMR | 5173 | 5173 | http://localhost:5173 |
| MySQL | 3306 | 3306 | localhost:3306 |
| Redis | 6379 | 6379 | localhost:6379 |
| Typesense | 8108 | 8108 | localhost:8108 |
| phpMyAdmin | 80 | 8080 | http://localhost:8080 |

---

## 🎨 What Makes This Special for Inertia React?

✅ **Hot Module Replacement** - React changes update instantly  
✅ **Vite Dev Server** - Lightning-fast builds  
✅ **Proper Routing** - Inertia handles SPA routing  
✅ **SSR Ready** - Can add server-side rendering later  
✅ **Production-like** - Exactly like real hosting  

---

## 📚 Summary

You now have a **complete production-like hosting environment** for your Laravel Inertia React app:

- ✅ Web server (Nginx)
- ✅ PHP application server with all extensions
- ✅ React dev server with hot reload
- ✅ Database (MySQL)
- ✅ Cache (Redis)
- ✅ Search (Typesense)
- ✅ Database UI (phpMyAdmin)

**This is REAL hosting on your PC!** The only difference from production is the domain name.

---

## 🆘 Quick Help

```bash
# Check all container statuses
docker-compose ps

# View all logs
docker-compose logs

# Restart everything
docker-compose restart

# Stop everything
docker-compose down

# Nuclear option (delete everything and start fresh)
docker-compose down -v
docker-compose up -d --build
```

Happy coding! 🚀
