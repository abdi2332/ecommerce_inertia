-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS laravel_db;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'laravel_user'@'%' IDENTIFIED BY 'secret';

-- Grant privileges
GRANT ALL PRIVILEGES ON laravel_db.* TO 'laravel_user'@'%';

-- Apply privilege changes
FLUSH PRIVILEGES;