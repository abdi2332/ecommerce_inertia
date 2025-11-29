#!/bin/bash

# Fix Laravel Reverb Environment Configuration

echo "🔧 Fixing Reverb configuration in .env file..."

# Backup .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Fix REVERB_HOST (should be container name 'reverb', not 'laravel-php')
sed -i 's/^REVERB_HOST=.*/REVERB_HOST=reverb/' .env

# Ensure BROADCAST_CONNECTION is set to reverb
if grep -q "^BROADCAST_CONNECTION=" .env; then
    sed -i 's/^BROADCAST_CONNECTION=.*/BROADCAST_CONNECTION=reverb/' .env
else
    # Add it after BROADCAST line or at the end
    echo "BROADCAST_CONNECTION=reverb" >> .env
fi

# Verify changes
echo ""
echo "✅ Updated configuration:"
echo ""
grep -E "^(BROADCAST_CONNECTION|REVERB_HOST|VITE_REVERB)" .env

echo ""
echo "🔄 Now restart containers:"
echo "   docker-compose restart php reverb"
echo "   docker-compose exec php php artisan config:clear"
