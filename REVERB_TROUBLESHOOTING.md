# Reverb Real-time Troubleshooting Checklist

## ✅ What's Fixed

1. **Environment Configuration**
   - ✅ `REVERB_HOST=reverb` (was: laravel-php)
   - ✅ `BROADCAST_CONNECTION=reverb` (added)
   - ✅ `VITE_REVERB_HOST=localhost` (correct)
   - ✅ Containers restarted
   - ✅ Config cache cleared

## 🔍 Diagnostic Steps

### 1. Check Reverb Server is Running
```bash
docker-compose ps reverb
docker-compose logs reverb
```
**Expected:** `INFO Starting server on 0.0.0.0:8080 (reverb)`

### 2. Test WebSocket from Browser Console

Open your application in browser, then in DevTools Console:
```javascript
// Check if Echo is loaded
console.log(window.Echo);

// Check Reverb configuration
console.log({
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST,
    port: import.meta.env.VITE_REVERB_PORT
});
```

### 3. Check Network Tab
- Open DevTools → Network → WS (WebSockets)
- Refresh page
- Look for connection to `ws://localhost:8080/app/...`
- Status should be **101 Switching Protocols**

### 4. Test Broadcasting

In your Laravel code, try broadcasting a test event:
```php
use Illuminate\Support\Facades\Broadcast;

// In a controller or tinker
broadcast(new \App\Events\YourEvent($data));
```

## 🐛 Common Issues

### Issue: "WebSocket connection failed"

**Check 1:** Reverb container running?
```bash
docker-compose ps reverb
```

**Check 2:** Port 8080 accessible?
```bash
curl http://localhost:8080
```

**Check 3:** Browser console errors?
- Look for CORS errors
- Look for connection refused errors

### Issue: "Connection established but no events received"

**Check 1:** Event implements ShouldBroadcast?
```php
class YourEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public function broadcastOn(): array
    {
        return [
            new Channel('channel-name'),
        ];
    }
}
```

**Check 2:** Listening on correct channel?
```javascript
window.Echo.channel('channel-name')
    .listen('YourEvent', (e) => {
        console.log('Event received:', e);
    });
```

**Check 3:** Check Reverb logs for incoming connections
```bash
docker-compose logs -f reverb
```

### Issue: "CORS error"

If you see CORS errors, check `config/cors.php`:
```php
'allowed_origins' => ['http://localhost', 'http://localhost:5173'],
```

## 📝 Quick Test Script

Create `test-reverb.php` in your project:
```php
<?php
// Run: docker-compose exec php php test-reverb.php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Testing Reverb connection...\n";
echo "REVERB_HOST: " . env('REVERB_HOST') . "\n";
echo "REVERB_PORT: " . env('REVERB_PORT') . "\n";
echo "BROADCAST_CONNECTION: " . env('BROADCAST_CONNECTION') . "\n";

// Try to connect
try {
    $client = new \GuzzleHttp\Client();
    $response = $client->get('http://reverb:8080');
    echo "✅ Reverb is accessible from PHP container\n";
} catch (\Exception $e) {
    echo "❌ Cannot reach Reverb: " . $e->getMessage() . "\n";
}
```

## 🎯 Next Steps

1. Open browser DevTools → Console
2. Check for Echo object: `console.log(window.Echo)`
3. Check Network → WS tab for WebSocket connection
4. Try triggering a broadcast event
5. Check Reverb logs: `docker-compose logs -f reverb`

If still not working, share:
- Browser console errors
- Network tab WebSocket status
- Reverb container logs
