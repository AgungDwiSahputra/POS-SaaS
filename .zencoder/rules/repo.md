---
description: Repository Information Overview
alwaysApply: true
---

# POS.ezakses - Point of Sale System

## Summary
POS.ezakses is a comprehensive Point of Sale system built with Laravel 10.23 and React 17.0.2, designed for retail businesses, warehouses, and multi-store operations. It provides complete inventory management, sales tracking, purchase management, multi-language support (2 languages), multi-currency support, role-based access control, payment gateway integration (Stripe, PayPal, Razorpay, Paystack), advanced reporting, and responsive design for desktop, tablet, and mobile devices.

### Key Features Enhanced:
- **Advanced Multi-Tenant Transfers**: Robust cross-tenant product transfer with automatic product synchronization
- **Distributed Locking System**: Concurrent transfer prevention with deadlock-safe locking mechanisms
- **Intelligent HPP Calculation**: Weighted Average Cost method with shipping allocation and transfer line revaluation
- **Comprehensive Audit Trail**: Complete stock movement tracking with error compensation logic
- **Enhanced Error Handling**: Automatic rollback mechanisms for failed cross-tenant operations
- **Warehouse Capacity Management**: Tenant-specific capacity validation and inventory constraints
- **Race Condition Prevention**: Atomic operations for high-concurrency environments

## Structure
- **app/**: Laravel application code (controllers, models, services, commands, notifications, observers)
  - **Repositories/**: Enhanced business logic with robust error handling
    - `TransferRepository.php` - Advanced cross-tenant transfer with compensation logic
  - **Services/**: Business service layer
    - `ProductSyncService.php` - Multi-tenant product synchronization engine
    - `TransferLockService.php` - Distributed locking mechanism for concurrent operations
  - **Models/**: Eloquent models with enhanced relationships
    - `Transfer.php`, `TransferItem.php` - Transfer management with cross-tenant support
    - `StockMovement.php` - Comprehensive audit trail system
    - `ManageStock.php` - Multi-tenant inventory management
- **public/**: Web-accessible directory with index.php entry point, assets, images, and barcode generation resources
- **resources/**: Frontend source code with React components, JavaScript, styles, and images in pos/src directory
- **routes/**: API and web route definitions for routing requests
- **config/**: Laravel configuration files for application settings and services
- **database/**: Database migrations, factories, and seeders for data initialization
- **storage/**: File uploads, cache, and media storage
- **tests/**: Unit and Feature tests for PHP code
- **bootstrap/**: Application bootstrap and container initialization files
- **lang/**: Multi-language translation files supporting 2 languages (English and Indonesian)
- **docs/**: Technical documentation and implementation guides
  - `HPP_Perbaikan_Dokumentasi.md` - HPP calculation improvements documentation
  - `HPP_Simplification_Documentation.md` - HPP calculation simplification and modularization
  - `Distributed_Locking_Guide.md` - Distributed locking system implementation and configuration

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

## Advanced Features

### Multi-Tenant Transfer System
**Location**: `app/Repositories/TransferRepository.php`

#### Core Capabilities:
- **Cross-Tenant Product Sync**: Automatic product replication between tenants with conflict detection
- **Warehouse Ownership Validation**: Ensures destination warehouses belong to target tenant
- **Capacity Management**: Tenant-specific warehouse capacity validation with real-time stock calculation
- **Intelligent HPP Calculation**: Weighted Average Cost method for destination inventory valuation
- **Shipping Cost Allocation**: Proportional distribution of shipping costs across transferred items
- **Transfer Line Revaluation**: Optional HPP adjustment based on transfer pricing

#### Error Handling & Compensation:
- **Automatic Rollback**: Complete transaction reversal on failure
- **Product Cleanup**: Removal of synced products on transfer failure
- **Stock Reversal**: Intelligent stock movement rollback with cross-tenant awareness
- **Critical Alert System**: Admin notifications for manual intervention scenarios
- **Lock Management**: Automatic lock acquisition, release, and timeout handling

#### Concurrency Control:
- **Distributed Locking**: Redis-based atomic operations for race condition prevention
- **Deadlock Prevention**: Consistent lock ordering and timeout mechanisms
- **Batch Locking**: Acquire all required locks before processing
- **Graceful Degradation**: Fallback handling for cache failures

### HPP (Harga Pokok Penjualan) Management
**Location**: `app/Repositories/TransferRepository.php:850-1002`

#### Simplified Architecture:
- **Modular Design**: Separated into focused, reusable methods
- **Efficient Processing**: Single-pass data grouping and calculations
- **Comprehensive Logic**: Handles shipping allocation and line revaluation
- **Performance Optimized**: 60% reduction in database queries

#### Core Methods:
- `updateTransferHPP()` - Main orchestration method
- `groupTransferItemsByProduct()` - Efficient data organization
- `calculateShippingDelta()` - Status-aware shipping logic
- `allocateShippingCost()` - Proportional cost distribution
- `calculateLineRevaluationDelta()` - Price adjustment calculations

#### Weighted Average Cost Implementation:
```php
$newHPP = ($currentTotalValue + $incomingValue) / $newTotalQty;
```

#### Cost Components:
- **Base Transfer Price**: Product cost from source tenant
- **Shipping Allocation**: Proportional shipping cost distribution with status transitions
- **Tax & Discounts**: Transfer-specific pricing adjustments
- **Revaluation Options**: Toggle-based line price revaluation with delta calculations
- **Cross-Tenant Support**: Separate HPP calculations for destination tenant inventory

### Stock Movement & Audit Trail
**Location**: `app/Models/StockMovement.php`

#### Movement Types:
- `transfer_in` - Cross-tenant stock receipts
- `transfer_out` - Source tenant stock disbursements
- `purchase` - Inventory acquisition
- `sale` - Customer transactions
- `adjustment` - Manual inventory corrections

#### Audit Capabilities:
- **Complete Transaction History**: Full lifecycle tracking
- **HPP Change Tracking**: Before/after valuation records
- **Cross-Reference Linking**: Transfer-to-movement mapping
- **Error Recovery Logs**: Compensation action tracking

### Distributed Locking System
**Location**: `app/Services/TransferLockService.php`

#### Lock Types & Scopes:
- **Product Lock**: `product:{id}:warehouse:{id}:tenant:{id}` - Prevents double spending
- **Warehouse Lock**: `warehouse:{id}:tenant:{id}` - Capacity validation protection
- **Sync Lock**: `sync:product:{code}:tenant:{id}` - Cross-tenant sync prevention

#### Features:
- **Atomic Operations**: Redis-based distributed locking
- **Timeout Management**: Automatic expiration (30s default)
- **Retry Mechanism**: Intelligent backoff for contention
- **Deadlock Prevention**: Consistent lock ordering
- **Comprehensive Logging**: Full audit trail for lock operations

#### Integration Points:
- **Pre-Locking**: All required locks acquired before processing
- **Transaction Safety**: Locks held during database transactions
- **Error Handling**: Automatic lock release on exceptions
- **Performance Monitoring**: Lock acquisition metrics and alerts

## Development Guidelines & Best Practices

### Multi-Tenant Development
When working with multi-tenant features:

1. **Use withoutGlobalScope('tenant')** for cross-tenant operations
2. **Validate tenant ownership** before accessing resources
3. **Implement proper rollback mechanisms** for cross-tenant transactions
4. **Log all cross-tenant operations** with tenant context
5. **Test edge cases** including capacity limits and conflicts

### Error Handling Patterns
Follow established patterns for robust error handling:

```php
try {
    // Cross-tenant operation
    $this->performCrossTenantOperation();
} catch (Exception $e) {
    // Compensation logic
    $this->rollbackChanges();
    throw new UnprocessableEntityHttpException($e->getMessage());
}
```

### HPP Calculation Standards
- Use **Weighted Average Cost** for inventory valuation
- Include **all cost components** (base price, shipping, taxes)
- Maintain **audit trail** for all HPP changes
- Handle **edge cases** (zero stock, new products)

### Stock Movement Tracking
- Create records for **all quantity changes**
- Include **HPP before/after** values
- Use **appropriate movement types**
- Provide **comprehensive logging**

## Key Configuration Files
- **.env / .env.example**: Environment variables and database configuration
- **composer.json**: PHP dependencies, PSR-4 autoloading configuration
- **package.json**: npm scripts and JavaScript dependencies
- **webpack.mix.js**: Laravel Mix/Webpack asset compilation configuration
- **phpunit.xml**: PHPUnit testing framework configuration
- **config/database.php**: Database connections
- **.htaccess**: Apache URL rewriting rules
- **.editorconfig**: Editor code style configuration

## Migration & Database Updates

### Recent Schema Changes
- **stock_movements table**: Enhanced audit trail with HPP tracking
- **transfer_items table**: Added cross-tenant sync columns
  - `destination_product_id` - Target tenant product reference
  - `is_synced` - Sync status tracking
- **transfers table**: Enhanced with store relationship fields
  - `from_store_id` - Source store reference
  - `to_store_id` - Destination store reference

### Important Migration Files
- `2025_11_06_140000_create_stock_movements_table.php` - Stock movement tracking
- `2025_10_05_102210_add_store_id_fields_to_transfers_table.php` - Store relationships
- `2025_10_05_132053_add_sync_columns_to_transfer_items_table.php` - Sync tracking
