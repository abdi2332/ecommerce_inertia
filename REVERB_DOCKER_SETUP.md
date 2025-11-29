# Laravel Reverb Docker Configuration Guide

## ✅ Reverb Container Status

Your Laravel Reverb WebSocket server is now running successfully!

```
Container: laravel-reverb
Port: 8080 (exposed to host)
Status: Running
Command: php artisan reverb:start --host=0.0.0.0 --port=8080
```

---

## 🔧 Required Environment Configuration

You need to update your `.env` file with the correct Docker networking configuration:

### Backend Configuration (Laravel connects to Reverb)

```env
# Reverb Server Settings (for Laravel backend)
REVERB_APP_ID=599785
REVERB_APP_KEY=y5saqbxn2m2crojjnea6
REVERB_APP_SECRET=oqacabn03accqi54qile
REVERB_HOST=reverb              # ← CHANGE THIS! Use container name
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Frontend Configuration (Browser connects to Reverb)

```env
# Vite Environment Variables (for browser/frontend)
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST=localhost      # ← Browser connects via localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

### Broadcasting Configuration

```env
BROADCAST_CONNECTION=reverb     # Make sure this is set to 'reverb'
```

---

## 🔑 Key Points

1. **`REVERB_HOST=reverb`** - Laravel backend uses the container name for internal Docker networking
2. **`VITE_REVERB_HOST=localhost`** - Browser connects via the exposed port on localhost
3. **Port 8080** is exposed from the Reverb container to your host machine

---

## 🧪 Testing WebSocket Connection

### 1. Check Reverb is Running

```bash
docker-compose ps reverb
docker-compose logs reverb
```

Expected output: `INFO Starting server on 0.0.0.0:8080`

### 2. Test from Host Machine

```bash
curl http://localhost:8080
```

Expected: Should return Reverb server response

### 3. Test from Browser

Open your application at `http://localhost` and check:
- Browser DevTools → Network tab → WS (WebSockets)
- Look for connection to `ws://localhost:8080`
- Status should be "101 Switching Protocols"

---

## 🔄 Restart Services After Configuration

After updating your `.env` file:

```bash
# Restart PHP and Reverb containers to pick up new environment
docker-compose restart php reverb

# Or restart everything
docker-compose down
docker-compose up -d
```

---

## 📊 Service Ports Summary

| Service | Port | Access | Purpose |
|---------|------|--------|---------|
| Nginx | 80 | http://localhost | Web server |
| Vite | 5173 | http://localhost:5173 | React HMR |
| **Reverb** | **8080** | **ws://localhost:8080** | **WebSocket server** |
| MySQL | 3306 | localhost:3306 | Database |
| Redis | 6379 | localhost:6379 | Cache |
| Typesense | 8108 | localhost:8108 | Search |
| phpMyAdmin | 8081 | http://localhost:8081 | DB Admin |

---

## 🆘 Troubleshooting

### WebSocket Connection Refused

**Problem:** Browser can't connect to `ws://localhost:8080`

**Solution:**
1. Check Reverb container is running: `docker-compose ps reverb`
2. Check logs: `docker-compose logs reverb`
3. Verify port is exposed: `docker-compose port reverb 8080`

### Laravel Can't Connect to Reverb

**Problem:** Backend broadcasting fails

**Solution:**
1. Verify `.env` has `REVERB_HOST=reverb` (not `localhost` or `laravel-php`)
2. Restart PHP container: `docker-compose restart php`
3. Clear config cache: `docker-compose exec php php artisan config:clear`

### Events Not Broadcasting

**Problem:** Real-time events not working

**Solution:**
1. Check `BROADCAST_CONNECTION=reverb` in `.env`
2. Verify your event implements `ShouldBroadcast`
3. Check browser console for WebSocket errors
4. Verify `VITE_REVERB_HOST=localhost` (not container name)

---

## 🎯 Next Steps

1. **Update `.env` file** with the configuration above
2. **Restart containers:** `docker-compose restart php reverb`
3. **Clear Laravel cache:** `docker-compose exec php php artisan config:clear`
4. **Test real-time functionality** in your application
5. **Check browser DevTools** to verify WebSocket connection

Your Reverb server is ready! Just update the environment variables and restart the services.
