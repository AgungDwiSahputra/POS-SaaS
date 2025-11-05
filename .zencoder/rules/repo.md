---
description: Repository Information Overview
alwaysApply: true
---

# POS.ezakses - Point of Sale System

## Summary
POS.ezakses is a comprehensive Point of Sale system built with Laravel 10.23 and React 17.0.2, designed for retail businesses, warehouses, and multi-store operations. It provides complete inventory management, sales tracking, purchase management, multi-language support (2 languages), multi-currency support, role-based access control, payment gateway integration (Stripe, PayPal, Razorpay, Paystack), advanced reporting, and responsive design for desktop, tablet, and mobile devices.

## Structure
- **app/**: Laravel application code (controllers, models, services, commands, notifications, observers)
- **public/**: Web-accessible directory with index.php entry point, assets, images, and barcode generation resources
- **resources/**: Frontend source code with React components, JavaScript, styles, and images in pos/src directory
- **routes/**: API and web route definitions for routing requests
- **config/**: Laravel configuration files for application settings and services
- **database/**: Database migrations, factories, and seeders for data initialization
- **storage/**: File uploads, cache, and media storage
- **tests/**: Unit and Feature tests for PHP code
- **bootstrap/**: Application bootstrap and container initialization files
- **lang/**: Multi-language translation files supporting 2 languages (English and Indonesian)

## Language & Runtime
**Primary Language**: PHP 8.1+ backend with React 17.0.2 frontend
**Framework**: Laravel 10.23 - Backend web framework
**Frontend Framework**: React 17.0.2 with Redux state management, React Router v6
**Build Tool**: Laravel Mix 6.0.49 (Webpack-based asset compilation)
**Package Manager**: Composer for PHP dependencies, npm for JavaScript/Node.js
**Web Server**: Apache or Nginx (with mod_rewrite enabled)
**Runtime**: PHP 8.1+, Node.js 16.x or higher recommended

## Dependencies

### Critical PHP Dependencies
- **laravel/framework**: ^10.23 - Core Laravel framework
- **stancl/tenancy**: ^3.8 - Multi-tenancy/multi-store support
- **spatie/laravel-permission**: ^5.8 - Role-based access control (RBAC)
- **spatie/laravel-medialibrary**: ^10.7 - Media and file management
- **laravel/sanctum**: ^3.2 - API token authentication
- **maatwebsite/excel**: ^3.1 - Excel import/export functionality

### Payment & Payment Gateway Integration
- **stripe/stripe-php**: ^16.4 - Stripe payment processing
- **razorpay/razorpay**: ^2.9 - Razorpay payment gateway
- **srmklive/paypal**: ^3.0 - PayPal integration
- **yabacon/paystack-php**: ^2.2 - Paystack payment gateway

### Reporting & Document Generation
- **barryvdh/laravel-dompdf**: ^2.0 - PDF report generation
- **picqer/php-barcode-generator**: ^2.2 - Barcode generation and printing

### Development & Code Generation
- **infyomlabs/laravel-generator**: ^6.0 - Code generation scaffolding
- **spatie/laravel-query-builder**: ^5.1 - Advanced query building
- **prettus/l5-repository**: ^2.9 - Repository pattern implementation

### Development Dependencies
- **phpunit/phpunit**: ^9.5.10 - Testing framework for unit and feature tests
- **barryvdh/laravel-debugbar**: ^3.16 - Development debug toolbar
- **barryvdh/laravel-ide-helper**: ^2.13 - IDE code completion assistance
- **mockery/mockery**: ^1.4.4 - Test mocking library

### Frontend JavaScript Dependencies
- **react**: ^17.0.2, **react-dom**: ^17.0.2 - React library and DOM rendering
- **react-router-dom**: ^6.3.0 - Client-side routing
- **redux**: ^4.1.2, **react-redux**: ^7.2.6 - State management
- **bootstrap**: ^5.1.3, **react-bootstrap**: ^2.1.2 - UI framework
- **chart.js**: ^3.0.0, **react-chartjs-2**: ^4.2.0 - Data visualization
- **echarts**: ^5.3.3 - Advanced charting library
- **axios**: ^1.12.1 - HTTP client for API calls
- **react-datepicker**: ^4.7.0 - Date picker component
- **react-select**: ^5.3.1 - Advanced select component
- **react-toastify**: ^8.2.0 - Toast notifications
- **react-intl**: ^5.25.1 - Internationalization (i18n) support

## Build & Installation

### System Requirements
- PHP 8.1 or higher with extensions: OpenSSL, PDO, Tokenizer, Mbstring, XML, Fileinfo
- MySQL 5.7+, PostgreSQL 10+, or SQLite
- Node.js 16.x or higher
- Composer (latest version)
- Web server with mod_rewrite enabled (Apache/Nginx)

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/AgungDwiSahputra/POS-SaaS
cd pos.ezakses

# Install PHP dependencies via Composer
composer install

# Install Node.js dependencies
npm install

# Create environment configuration file
cp .env.example .env

# Generate application encryption key
php artisan key:generate

# Configure database connection in .env file
# Then run migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed

# Build frontend assets for production
npm run production

# Serve application locally
php artisan serve
```

### Development Commands
```bash
# Watch assets for changes during development
npm run watch

# Enable hot module replacement for React
npm run hot

# Build assets for production
npm run production

# Compile RTL (Right-to-Left) assets
npm run rtl

# Development build with asset compilation
npm run dev
```

## Main Files & Entry Points
**PHP Entry Point**: public/index.php - Bootstraps and runs Laravel application
**Frontend Entry Point**: resources/pos/src/index.js - React application initialization
**Application Kernel**: app/Http/Kernel.php - Middleware and kernel configuration
**Console Kernel**: app/Console/Kernel.php - Artisan commands and scheduling
**Service Provider**: app/Providers/ - Application service providers
**Web Routes**: routes/web.php - Web-facing routes
**API Routes**: routes/api.php - RESTful API routes
**Configuration Bootstrap**: bootstrap/app.php - Application container setup

## Testing

### Testing Framework
**Framework**: PHPUnit 9.5.10 - PHP unit and feature testing framework

### Test Structure
- **Unit Tests**: tests/Unit/ - Isolated component testing
- **Feature Tests**: tests/Feature/ - Integration testing
- **Test Naming**: Files must end with Test.php suffix
- **Configuration**: phpunit.xml with test environment setup

### Test Environment Configuration
- Cache driver: array (in-memory)
- Mail driver: array (no actual sending)
- Queue connection: sync (synchronous processing)
- Session driver: array (in-memory)
- Database: Configured connection (SQLite in-memory optional)

### Running Tests
```bash
# Execute all tests
./vendor/bin/phpunit

# Run only unit tests
./vendor/bin/phpunit tests/Unit

# Run only feature tests
./vendor/bin/phpunit tests/Feature

# Run specific test file
./vendor/bin/phpunit tests/Feature/LanguageSwitchingTest.php

# Generate code coverage report
./vendor/bin/phpunit --coverage-html coverage
```

### Existing Tests
- Feature/LanguageSwitchingTest.php - Multi-language switching functionality
- Feature/ExampleTest.php - Example feature tests
- Unit/ExampleTest.php - Example unit tests

## Key Configuration Files
- **.env / .env.example**: Environment variables and database configuration
- **composer.json**: PHP dependencies, PSR-4 autoloading configuration
- **package.json**: npm scripts and JavaScript dependencies
- **webpack.mix.js**: Laravel Mix/Webpack asset compilation configuration
- **phpunit.xml**: PHPUnit testing framework configuration
- **config/database.php**: Database connections
- **.htaccess**: Apache URL rewriting rules
- **.editorconfig**: Editor code style configuration
