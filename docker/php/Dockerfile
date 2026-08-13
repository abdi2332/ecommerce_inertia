FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    wget

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions needed for Laravel & Filament
RUN docker-php-ext-configure intl \
 && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer directly
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Create system user 'laravel' (UID 1000) and set up home directory
RUN useradd -G www-data,root -u 1000 -d /home/laravel laravel && \
    mkdir -p /home/laravel/.composer /home/laravel/.config && \
    chown -R laravel:laravel /home/laravel

# Configure Git safe directory globally for laravel user
RUN su laravel -c "git config --global --add safe.directory /var/www/html"

# Set proper ownership on working directory
RUN chown -R laravel:www-data /var/www/html

# Switch to laravel user by default
USER laravel