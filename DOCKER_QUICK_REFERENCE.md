# Docker Setup - Quick Reference Guide

## 🎯 What Was Built

A complete local hosting environment with 8 Docker containers:

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│    ↓                                                    │
│  localhost:80 ────────> Nginx ──────> PHP-FPM          │
│  localhost:5173 ──────> Vite (React HMR)               │
│  localhost:8080 ──────> Reverb (WebSockets)            │
│  localhost:3306 ──────> MySQL                          │
│  localhost:6379 ──────> Redis                          │
│  localhost:8108 ──────> Typesense                      │
│  localhost:8081 ──────> phpMyAdmin                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Docker Images Used

| Image | Version | Purpose | Size |
|-------|---------|---------|------|
| `php:8.3-fpm` | 8.3 | Laravel backend | Custom built |
| `nginx:alpine` | latest | Web server | ~40MB |
| `node:20-alpine` | 20 | Vite dev server | ~180MB |
| `mysql:8.0` | 8.0 | Database | ~500MB |
| `redis:7` | 7 | Cache/Sessions | ~30MB |
| `typesense/typesense` | 0.25.0 | Search engine | ~80MB |
| `phpmyadmin/phpmyadmin` | latest | DB admin | ~150MB |

---

## 🔧 Custom PHP Extensions Installed

```
✅ pdo_mysql  - Database connectivity
✅ mbstring   - UTF-8 string handling
✅ exif       - Image metadata
✅ pcntl      - Process control (queues)
✅ bcmath     - Precise math (money)
✅ gd         - Image manipulation
✅ zip        - File compression
✅ intl       - Internationalization (Filament)
✅ redis      - Redis support
```

---

## 🐛 Issues Fixed

### 1. Composer Timeout
**Error:** `i/o timeout` when pulling composer:latest  
**Fix:** Direct download via curl

### 2. PHP Version
**Error:** Requires PHP 8.3+  
**Fix:** Changed from `php:8.2-fpm` to `php:8.3-fpm`

### 3. Missing intl
**Error:** Filament requires ext-intl  
**Fix:** Added `libicu-dev` + `intl` extension

### 4. Docker Compose Bug
**Error:** `KeyError: 'ContainerConfig'`  
**Fix:** Complete restart with `docker-compose down && up -d`

### 5. Port Conflict
**Error:** Port 8080 in use  
**Fix:** Changed phpMyAdmin to port 8081

---

## 📝 Key Configuration Files

### 1. `docker-compose.yml`
Orchestrates all 8 containers

### 2. `docker/php/Dockerfile`
Custom PHP 8.3 image with extensions

### 3. `docker/nginx/default.conf`
Nginx configuration for Laravel

### 4. `vite.config.js`
Vite config with Docker HMR support

### 5. `.env`
Environment variables for Docker networking

---

## 🌐 Docker Networking

### Internal (Container to Container)
```env
DB_HOST=mysql          # Not localhost!
REDIS_HOST=redis       # Not localhost!
REVERB_HOST=reverb     # Not localhost!
```

### External (Browser to Container)
```env
VITE_REVERB_HOST=localhost
TYPESENSE_HOST=localhost
```

**Rule:** Use container names internally, localhost externally!

---

## 🚀 Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f reverb

# Run Laravel commands
docker-compose exec php php artisan migrate
docker-compose exec php composer install

# Restart services
docker-compose restart php reverb

# Rebuild image
docker-compose build --no-cache php

# Stop everything
docker-compose down

# Delete everything (including data!)
docker-compose down -v
```

---

## 🔍 Troubleshooting

### Container won't start?
```bash
docker-compose ps
docker-compose logs <container-name>
```

### Permission errors?
```bash
docker-compose exec php chmod -R 775 storage bootstrap/cache
```

### Config not updating?
```bash
docker-compose exec php php artisan config:clear
docker-compose restart php
```

### WebSocket not connecting?
1. Check Reverb logs: `docker-compose logs reverb`
2. Verify `.env` has `REVERB_HOST=reverb`
3. Check browser DevTools → Network → WS

---

## 📚 Documentation Files

- **`walkthrough.md`** - Complete technical documentation
- **`DOCKER_GUIDE.md`** - General Docker usage guide
- **`REVERB_DOCKER_SETUP.md`** - Reverb configuration
- **`REVERB_TROUBLESHOOTING.md`** - Reverb debugging

---

## ✅ Verification Checklist

- [ ] All containers running: `docker-compose ps`
- [ ] Nginx responds: `curl http://localhost`
- [ ] Vite HMR working: Check http://localhost:5173
- [ ] Reverb running: `docker-compose logs reverb`
- [ ] Database accessible: http://localhost:8081
- [ ] WebSocket connected: Browser DevTools → Network → WS

---

## 🎉 Success Indicators

✅ `docker-compose ps` shows all containers "Up"  
✅ Browser loads http://localhost  
✅ React hot reload works when editing files  
✅ WebSocket shows "101 Switching Protocols"  
✅ Real-time events work without page refresh  

**You now have production-like hosting on your local PC!** 🚀
