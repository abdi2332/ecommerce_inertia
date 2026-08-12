# 1. Build frontend assets natively
npm ci && npm run build

# 2. Spin up containers
docker compose up -d --build

# 3. Install composer packages using your 'laravel' user
docker exec -u laravel -it ecom_app composer install --no-dev --optimize-autoloader

# 4. Set directory permissions
docker exec -it ecom_app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
docker exec -it ecom_app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# 5. Database migrations & Typesense indexing
docker exec -u laravel -it ecom_app php artisan migrate --force
docker exec -u laravel -it ecom_app php artisan scout:import "App\Models\Product"

# 6. Optimize Laravel performance
docker exec -u laravel -it ecom_app php artisan config:cache
docker exec -u laravel -it ecom_app php artisan route:cache
docker exec -u laravel -it ecom_app php artisan view:cache