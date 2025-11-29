# Complete Docker Setup Guide: Laravel Inertia React Application

## Introduction

This document explains how to set up a complete local development environment for a Laravel Inertia React application using Docker. The goal is to replicate a production hosting environment on your local Ubuntu machine. This guide assumes you have basic knowledge of Laravel and React, but no prior Docker experience.

## Understanding the Problem

When you develop a Laravel application locally, you typically install PHP, MySQL, Redis, and other dependencies directly on your machine. This approach has several problems:

1. Your local environment may differ from production servers
2. Different projects may require different PHP versions
3. Installing and managing multiple services is complex
4. Sharing your setup with team members is difficult
5. You cannot easily test how your application behaves in a production-like environment

Docker solves these problems by packaging each service into isolated containers that run consistently across any machine.

## What is Docker and Why Use It

Docker is a platform that allows you to run applications in isolated environments called containers. Think of a container as a lightweight virtual machine that contains everything needed to run a specific service.

For our Laravel Inertia React application, we need multiple services:
- A web server to handle HTTP requests
- PHP to run Laravel code
- A database to store data
- A cache server for performance
- A Node.js environment to build React components
- A WebSocket server for real-time features

Instead of installing all these on your Ubuntu machine, Docker allows us to run each service in its own container. These containers can communicate with each other through a virtual network that Docker creates.

## Project Architecture Overview

Before diving into the setup, let me explain what we are building. Our application uses Laravel as the backend framework and React as the frontend library. Laravel and React communicate through Inertia.js, which allows you to build single-page applications without building a separate API. The application also needs real-time features, which we implement using Laravel Reverb, a WebSocket server.

To run this application, we need eight separate services, each running in its own Docker container:

1. **Nginx** - Web server that receives HTTP requests from browsers
2. **PHP-FPM** - Runs the Laravel application code
3. **MySQL** - Stores application data in a relational database
4. **Redis** - Provides fast in-memory caching and session storage
5. **Vite** - Builds and serves React components with hot module replacement
6. **Reverb** - Handles WebSocket connections for real-time features
7. **Typesense** - Provides fast search functionality for products
8. **phpMyAdmin** - Web interface to manage the MySQL database

## Step 1: Understanding Docker Images

A Docker image is a template that contains the operating system, software, and configuration needed to run a service. When you start a container, Docker uses an image as the blueprint.

Docker Hub is a public repository where people share pre-built images. For our project, we use these base images:

**php:8.3-fpm** - The official PHP image with version 8.3 and FPM (FastCGI Process Manager). FPM is a PHP implementation optimized for handling web requests. It manages multiple PHP worker processes and is designed to work with web servers like Nginx. We chose version 8.3 because our Laravel dependencies require it.

**nginx:alpine** - The official Nginx web server image. The "alpine" variant means it is based on Alpine Linux, a minimal Linux distribution that results in a much smaller image size (approximately 40MB compared to 130MB for regular Nginx).

**node:20-alpine** - The official Node.js image with version 20. We need Node.js to run Vite, which is the build tool for our React frontend. Vite provides fast hot module replacement, meaning when you edit a React component, the browser updates instantly without a full page reload.

**mysql:8.0** - The official MySQL database image that stores all application data.

**redis:7** - The official Redis image. Redis is an in-memory data store used for caching and session management. It is extremely fast because it stores data in RAM rather than on disk.

**typesense/typesense:0.25.0** - The official Typesense image. Typesense is a search engine optimized for speed with features like typo tolerance and faceted search.

**phpmyadmin/phpmyadmin** - The official phpMyAdmin image that provides a web-based interface for managing MySQL databases.

## Step 2: Creating the Docker Compose File

Docker Compose is a tool that allows you to define and run multiple Docker containers together. Instead of starting each container manually, you create a single YAML file that describes all your services and their configuration.

Create a file called `docker-compose.yml` in your project root:

```yaml
version: "3.8"

services:
    # Services will be defined here

networks:
    laravel:
        driver: bridge

volumes:
    mysql_data:
    typesense_data:
```

The version declaration specifies which Docker Compose syntax version we are using. Version 3.8 is stable and supports all features we need.

The networks section creates a virtual network called "laravel" with the bridge driver. This allows containers to communicate using their service names as hostnames.

The volumes section defines named volumes that persist data even when containers are stopped.

## Step 3: Configuring the Nginx Service

Nginx is our web server. When someone visits your application in a browser, their request first reaches Nginx. Nginx then decides what to do with the request.

For static files like images, CSS, and JavaScript, Nginx serves them directly. For dynamic requests that need PHP processing, Nginx forwards the request to the PHP-FPM container through the FastCGI protocol.

Add the Nginx service to `docker-compose.yml`:

```yaml
services:
    nginx:
        image: nginx:alpine
        container_name: laravel-nginx
        restart: always
        ports:
            - "80:80"
            - "443:443"
        volumes:
            - ./:/var/www/html
            - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
            - ./docker/nginx/ssl:/etc/nginx/ssl
        depends_on:
            - php
            - vite
        networks:
            - laravel
```

Let me explain each part:

- `image: nginx:alpine` - Use the Alpine-based Nginx image
- `container_name: laravel-nginx` - Name the container for easy identification
- `restart: always` - Automatically restart if the container crashes
- `ports: "80:80"` - Map port 80 on host to port 80 in container (HTTP)
- `ports: "443:443"` - Map port 443 on host to port 443 in container (HTTPS)
- `volumes: ./:/var/www/html` - Mount project directory into container
- `volumes: ./docker/nginx/default.conf` - Mount custom Nginx configuration
- `depends_on: php` - Ensure PHP starts before Nginx
- `networks: laravel` - Connect to the laravel network

## Step 4: Creating the Nginx Configuration File

Nginx needs a configuration file that tells it how to handle requests. Create the directory structure and file:

```bash
mkdir -p docker/nginx
```

Create `docker/nginx/default.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name localhost myshop.local;
    root /var/www/html/public;

    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass php:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Key parts explained:

- `listen 80` - Listen on port 80 for IPv4
- `listen [::]:80` - Listen on port 80 for IPv6
- `root /var/www/html/public` - Laravel's public directory is the web root. This is important because Laravel keeps application code outside the web root for security.
- `try_files $uri $uri/ /index.php?$query_string` - This implements Laravel's routing. First try to serve a file, then try a directory, otherwise send to Laravel's index.php
- `fastcgi_pass php:9000` - Forward PHP requests to the PHP container on port 9000. Note we use "php" (the service name) not "localhost"
- `location ~ /\.(?!well-known).*` - Block access to hidden files like .env and .git, except .well-known (needed for SSL)

## Step 5: Understanding Why We Need a Custom PHP Image

The base `php:8.3-fpm` image contains PHP and FPM, but it does not include the extensions that Laravel requires. PHP extensions are additional modules that provide functionality like database connectivity, image processing, and internationalization.

Laravel requires several extensions:
- **pdo_mysql** - For connecting to MySQL databases
- **mbstring** - For handling multi-byte strings like UTF-8
- **gd** - For image manipulation (resize, crop, etc.)
- **zip** - For creating and extracting ZIP files
- **bcmath** - For precise decimal arithmetic needed for money calculations
- **intl** - For internationalization features

Additionally, our project uses Filament (an admin panel package) that specifically requires the **intl** extension. Without it, Composer will refuse to install the dependencies.

We also need the **Redis** extension to connect to our Redis cache server, and we need **Composer** to manage PHP dependencies.

Because the base image does not include these extensions, we must create a custom image by writing a Dockerfile.

## Step 6: Creating the PHP Dockerfile

A Dockerfile is a text file that contains instructions for building a Docker image. Each instruction creates a layer in the image.

Create the directory and file:

```bash
mkdir -p docker/php
```

Create `docker/php/Dockerfile`:

```dockerfile
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

# Install PHP extensions needed for Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer directly (avoiding Docker Hub timeout)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/www/html

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u 1000 -d /home/laravel laravel
RUN mkdir -p /home/laravel/.composer && \
    chown -R laravel:laravel /home/laravel

# Set permissions
RUN chown -R www-data:www-data /var/www/html
```

Let me explain each section:

**FROM php:8.3-fpm**
This tells Docker to start with the official PHP 8.3 FPM image as the base. Everything we add builds on top of this.

**System Dependencies**
```dockerfile
RUN apt-get update && apt-get install -y \
    git \              # Needed by Composer
    curl \             # To download Composer
    libpng-dev \       # Required for GD extension
    libonig-dev \      # Required for mbstring extension
    libxml2-dev \      # Required for XML parsing
    libzip-dev \       # Required for ZIP extension
    libicu-dev \       # CRITICAL: Required for intl extension (Filament needs this)
    wget
```

Each library is needed to compile specific PHP extensions. For example, `libicu-dev` provides the International Components for Unicode library that the intl extension requires.

**PHP Extensions**
```dockerfile
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl
```

This single command installs multiple extensions:
- `pdo_mysql` - MySQL database connectivity
- `mbstring` - Multi-byte string handling (UTF-8)
- `exif` - Read image metadata
- `pcntl` - Process control (for queues)
- `bcmath` - Precise decimal math (for money)
- `gd` - Image manipulation
- `zip` - ZIP file handling
- `intl` - Internationalization (required by Filament)

**Redis Extension**
```dockerfile
RUN pecl install redis && docker-php-ext-enable redis
```

Redis is not available through `docker-php-ext-install`, so we use PECL (PHP Extension Community Library). PECL downloads and compiles the extension, then we enable it.

**Composer Installation**
```dockerfile
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

Initially, I tried using `COPY --from=composer:latest /usr/bin/composer /usr/bin/composer` but this failed with a network timeout error:

```
invalid from flag value composer:latest: error pulling image configuration: 
download failed after attempts=6: i/o timeout
```

The solution was to download Composer directly using curl, which bypasses Docker Hub and is more reliable.

**User Creation**
```dockerfile
RUN useradd -G www-data,root -u 1000 -d /home/laravel laravel
```

We create a user with UID 1000 (which typically matches your Ubuntu user) to avoid permission issues when files are created inside the container.

## Step 7: Configuring the PHP Service in Docker Compose

Add the PHP service to `docker-compose.yml`:

```yaml
    php:
        build:
            context: ./docker/php
            dockerfile: Dockerfile
        container_name: laravel-php
        restart: always
        volumes:
            - ./:/var/www/html
            - ./docker/php/custom.ini:/usr/local/etc/php/conf.d/custom.ini
        working_dir: /var/www/html
        networks:
            - laravel
        depends_on:
            - mysql
            - redis
```

Instead of using a pre-built image, we tell Docker to build a custom image using our Dockerfile. The `build` section specifies where to find the Dockerfile.

## Step 8: Creating the PHP Configuration File

Create `docker/php/custom.ini`:

```ini
upload_max_filesize = 100M
post_max_size = 100M
memory_limit = 256M
max_execution_time = 300
```

These settings override PHP's defaults:
- Allow uploading files up to 100MB
- Allow POST requests up to 100MB
- Give PHP scripts up to 256MB of memory
- Allow scripts to run for up to 300 seconds

## Step 9: Configuring the Vite Service

Vite is a build tool for frontend assets. It compiles React components and provides hot module replacement during development.

Add the Vite service to `docker-compose.yml`:

```yaml
    vite:
        image: node:20-alpine
        container_name: laravel-vite
        restart: always
        ports:
            - "5173:5173"
        volumes:
            - ./:/var/www/html
        working_dir: /var/www/html
        command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
        networks:
            - laravel
```

The command runs `npm install` to install dependencies, then `npm run dev` to start Vite. The `--host 0.0.0.0` flag makes Vite listen on all network interfaces, not just localhost. This is necessary because Vite runs inside a container and needs to be accessible from your host machine.

## Step 10: Configuring Vite for Docker

Vite needs special configuration to work inside Docker. Edit `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
        watch: {
            usePolling: true,
        },
    },
});
```

Key configuration explained:

- `host: '0.0.0.0'` - Listen on all network interfaces
- `hmr.host: 'localhost'` - Tell the browser to connect to localhost for hot module replacement. Even though Vite runs in a container, the browser connects through the exposed port on your host machine.
- `watch.usePolling: true` - Enable polling for file changes. Docker volumes do not support native file system events, so Vite must periodically check for changes.

## Step 11: Understanding the Need for a Separate Reverb Service

Laravel Reverb is a WebSocket server that enables real-time features like notifications and live updates. WebSockets maintain a persistent connection between the browser and server, unlike HTTP requests which are short-lived.

You might wonder why we cannot run Reverb in the same container as PHP-FPM. The reason is that PHP-FPM and Reverb have fundamentally different process models:

**PHP-FPM Process Model:**
```
Browser Request → Nginx → PHP-FPM Worker
                          ↓
                    Process Request
                          ↓
                    Return Response
                          ↓
                    Worker becomes available for next request
```

PHP-FPM is designed for HTTP requests. It spawns worker processes that handle a request and then become available for the next request. Each request is independent and short-lived (typically milliseconds to seconds).

**Reverb Process Model:**
```
Browser → WebSocket Connection → Reverb Server
          ↓                       ↓
    Stays Connected          Maintains thousands
    for minutes/hours        of concurrent connections
```

Reverb maintains long-lived WebSocket connections. A single Reverb process can handle thousands of concurrent connections that stay open for extended periods.

If we tried to run Reverb in the PHP-FPM container, we would need to start it as a background process. This is problematic because:

1. Docker is designed to run one main process per container
2. If the main process exits, the container stops
3. Managing multiple processes requires additional tools like supervisord
4. Logging and error handling become complicated

The Docker philosophy is **one service per container**. This makes containers easier to manage, scale, and debug. Therefore, we create a separate container specifically for Reverb.

## Step 12: Configuring the Reverb Service

Add the Reverb service to `docker-compose.yml`:

```yaml
    reverb:
        build:
            context: ./docker/php
            dockerfile: Dockerfile
        container_name: laravel-reverb
        restart: always
        ports:
            - "8080:8080"
        volumes:
            - ./:/var/www/html
            - ./docker/php/custom.ini:/usr/local/etc/php/conf.d/custom.ini
        working_dir: /var/www/html
        command: php artisan reverb:start --host=0.0.0.0 --port=8080
        networks:
            - laravel
        depends_on:
            - mysql
            - redis
```

The Reverb service uses the same custom PHP image we built because Reverb is a PHP application. However, instead of running PHP-FPM, we override the command to start the Reverb server:

```yaml
command: php artisan reverb:start --host=0.0.0.0 --port=8080
```

This starts Reverb listening on all interfaces on port 8080.

## Step 13: Configuring MySQL

Add the MySQL service to `docker-compose.yml`:

```yaml
    mysql:
        image: mysql:8.0
        container_name: laravel-mysql
        restart: always
        environment:
            MYSQL_ROOT_PASSWORD: root
            MYSQL_DATABASE: laravel_db
            MYSQL_USER: laravel_user
            MYSQL_PASSWORD: secret
        ports:
            - "3306:3306"
        volumes:
            - mysql_data:/var/lib/mysql
            - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql
        networks:
            - laravel
```

Environment variables configure the database:
- `MYSQL_ROOT_PASSWORD` - Root user password
- `MYSQL_DATABASE` - Creates a database named laravel_db
- `MYSQL_USER` - Creates a user named laravel_user
- `MYSQL_PASSWORD` - Sets the user's password

The volume `mysql_data:/var/lib/mysql` persists database files. Without this, all data would be lost when the container stops.

## Step 14: Configuring Redis, Typesense, and phpMyAdmin

Add the remaining services to `docker-compose.yml`:

```yaml
    redis:
        image: redis:7
        container_name: laravel-redis
        restart: always
        ports:
            - "6379:6379"
        networks:
            - laravel

    typesense:
        image: typesense/typesense:0.25.0
        container_name: typesense
        restart: always
        ports:
            - "8108:8108"
        volumes:
            - typesense_data:/data
        environment:
            TYPESENSE_API_KEY: xyz
            TYPESENSE_DATA_DIR: /data
        networks:
            - laravel

    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        container_name: laravel-phpmyadmin
        restart: always
        ports:
            - "8081:80"
        environment:
            PMA_HOST: mysql
            PMA_USER: root
            PMA_PASSWORD: root
        depends_on:
            - mysql
        networks:
            - laravel
```

Note that phpMyAdmin uses port 8081 instead of 8080 because Reverb uses 8080.

## Step 15: Building and Starting the Containers

Now that all configuration files are in place, build the custom PHP image:

```bash
docker-compose build
```

This command reads the Dockerfile and executes each instruction. The first build takes several minutes because Docker must download system packages and compile PHP extensions. However, Docker caches each layer, so subsequent builds are much faster.

During the first build attempt, we encountered this error:

```
Step 6/10 : COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
invalid from flag value composer:latest: error pulling image configuration: 
download failed after attempts=6: dial tcp: lookup docker-images-prod...
i/o timeout
ERROR: Service 'php' failed to build : Build failed
```

The solution was to change the Dockerfile to download Composer directly:

```dockerfile
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

After fixing this and rebuilding, start all containers:

```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (in the background). Docker starts containers in the correct order based on `depends_on` directives.

Check the status:

```bash
docker-compose ps
```

All containers should show "Up" status.

## Step 16: Installing Laravel Dependencies

With containers running, install Laravel's PHP dependencies:

```bash
docker-compose exec php composer install
```

This command executes `composer install` inside the PHP container.

During this step, we encountered an error:

```
openspout/openspout is locked to version v4.32.0 and an update of this package was not requested.
openspout/openspout v4.32.0 requires php ~8.3.0 || ~8.4.0 || ~8.5.0 
-> your php version (8.2.29) does not satisfy that requirement.
```

The problem was our Dockerfile used `FROM php:8.2-fpm`. We fixed it by changing to:

```dockerfile
FROM php:8.3-fpm
```

After rebuilding and running `composer install` again, we encountered another error:

```
filament/support v4.2.0 requires ext-intl * -> it is missing from your system.
```

We fixed this by adding `libicu-dev` to system dependencies and `intl` to PHP extensions in the Dockerfile:

```dockerfile
RUN apt-get install -y libicu-dev
RUN docker-php-ext-install ... intl
```

After the final rebuild, `composer install` succeeded.

## Step 17: Configuring Environment Variables

Laravel uses a `.env` file for environment configuration. Update it to use Docker container names:

```env
# Database Configuration
DB_HOST=mysql              # Use container name, not localhost
DB_PORT=3306
DB_DATABASE=laravel_db
DB_USERNAME=laravel_user
DB_PASSWORD=secret

# Redis Configuration
REDIS_HOST=redis           # Use container name, not localhost
REDIS_PORT=6379

# Broadcasting Configuration
BROADCAST_CONNECTION=reverb

# Reverb Backend Configuration (Laravel connects to Reverb)
REVERB_HOST=reverb         # Use container name, not localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Reverb Frontend Configuration (Browser connects to Reverb)
VITE_REVERB_HOST=localhost # Browser connects via host machine
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

This is critical: Inside the Docker network, containers use service names as hostnames. The PHP container connects to MySQL using `mysql:3306`, not `localhost:3306`.

However, the browser runs on your host machine, not inside Docker. So the browser connects to Reverb using `localhost:8080`, which Docker maps to the Reverb container.

After updating `.env`, restart containers and clear Laravel's config cache:

```bash
docker-compose restart php reverb
docker-compose exec php php artisan config:clear
```

## Step 18: Understanding Docker Networking

Docker creates a virtual network for our containers. Here is how it works:

**Internal Communication (Container to Container):**
```
PHP Container → mysql:3306 → MySQL Container
PHP Container → redis:6379 → Redis Container
PHP Container → reverb:8080 → Reverb Container
```

Containers use service names as hostnames. Docker's DNS server resolves these to container IP addresses.

**External Access (Host to Container):**
```
Browser → localhost:80 → Docker Port Mapping → Nginx Container:80
Browser → localhost:8080 → Docker Port Mapping → Reverb Container:8080
```

Port mapping in `docker-compose.yml` allows external access. The format `"8080:8080"` means port 8080 on the host maps to port 8080 in the container.

## Step 19: Understanding the Complete Request Flow

When a user visits the application, here is the complete flow:

**HTTP Request Flow:**
```
1. Browser sends HTTP request to http://localhost
2. Request reaches host machine's port 80
3. Docker forwards to Nginx container's port 80
4. Nginx checks if request is for static file
   - If yes: Nginx serves file directly
   - If no: Continue to step 5
5. Nginx forwards to PHP-FPM container on port 9000 via FastCGI
6. PHP-FPM executes Laravel code
7. Laravel queries MySQL at mysql:3306
8. Laravel reads/writes Redis at redis:6379
9. Laravel generates HTML response
10. Response flows back: PHP → Nginx → Browser
```

**WebSocket Connection Flow:**
```
1. Browser JavaScript connects to ws://localhost:8080
2. Request reaches host machine's port 8080
3. Docker forwards to Reverb container's port 8080
4. Reverb accepts WebSocket connection (stays open)
5. When Laravel broadcasts event:
   - Laravel connects to reverb:8080
   - Sends event data to Reverb
6. Reverb forwards event to all connected browsers
```

## Step 20: Testing the Application

Access the application by opening http://localhost in a browser. Nginx receives the request and forwards it to PHP-FPM, which executes Laravel code.

To verify WebSocket connection:

1. Open browser Developer Tools
2. Go to Network tab
3. Filter by WS (WebSockets)
4. Refresh the page
5. Look for connection to `ws://localhost:8080`
6. Status should be "101 Switching Protocols"

If you see this status, WebSocket connection is working correctly.

## Step 21: Common Issues and Solutions

Throughout this setup, we encountered several issues. Here is how we solved them:

**Issue 1: Composer Installation Timeout**

Error:
```
invalid from flag value composer:latest: error pulling image configuration
```

Solution: Changed from `COPY --from=composer:latest` to direct download:
```dockerfile
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

**Issue 2: PHP Version Mismatch**

Error:
```
requires php ~8.3.0 -> your php version (8.2.29) does not satisfy that requirement
```

Solution: Changed Dockerfile from `FROM php:8.2-fpm` to `FROM php:8.3-fpm`

**Issue 3: Missing intl Extension**

Error:
```
filament/support requires ext-intl * -> it is missing from your system
```

Solution: Added to Dockerfile:
```dockerfile
RUN apt-get install -y libicu-dev
RUN docker-php-ext-install ... intl
```

**Issue 4: Docker Compose ContainerConfig Error**

Error:
```
KeyError: 'ContainerConfig'
```

This was a bug in Docker Compose v1.29.2. Solution:
```bash
docker-compose down
docker-compose up -d
```

**Issue 5: Port 8080 Conflict**

Error:
```
bind: address already in use
```

Solution: Changed phpMyAdmin port from 8080 to 8081 in docker-compose.yml

**Issue 6: Reverb Not Working**

Problem: Real-time features not working

Solution: Fixed `.env` file:
```env
REVERB_HOST=reverb  # Was incorrectly set to laravel-php
BROADCAST_CONNECTION=reverb  # Was missing
```

Then restarted containers:
```bash
docker-compose restart php reverb
docker-compose exec php php artisan config:clear
```

## Conclusion

This setup provides a complete development environment that closely mimics production hosting. All services run in isolated containers, making the environment reproducible and consistent across different machines.

Key takeaways:

1. Docker containers isolate services and their dependencies
2. Docker Compose orchestrates multiple containers
3. Custom Dockerfiles allow building images with specific requirements
4. Docker networking enables containers to communicate using service names
5. Port mapping allows external access to containerized services
6. Different services have different process models (why Reverb needs its own container)
7. Environment variables must be configured correctly for Docker networking

The complete file structure:

```
project-root/
├── docker-compose.yml
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   └── php/
│       ├── Dockerfile
│       └── custom.ini
├── vite.config.js
└── .env
```

With this setup, you can develop your Laravel Inertia React application in an environment that closely matches production, reducing the risk of environment-specific bugs.
