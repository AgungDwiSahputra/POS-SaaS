# POS.ezakses - Point of Sale System

<p align="center">
  <img src="https://via.placeholder.com/400x200/007bff/ffffff?text=POS.ezakses" alt="POS.ezakses Logo" width="400">
</p>

<p align="center">
  <a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/badge/Laravel-10.x-red.svg" alt="Laravel Version"></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-8.1+-blue.svg" alt="PHP Version"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-17.x-blue.svg" alt="React Version"></a>
  <a href="https://getbootstrap.com/docs/5.0/"><img src="https://img.shields.io/badge/Bootstrap-5.x-purple.svg" alt="Bootstrap Version"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

## Overview

POS.ezakses is a comprehensive Point of Sale (POS) system built with Laravel and React, designed for retail businesses, warehouses, and multi-store operations. The system provides complete inventory management, sales tracking, purchase management, and financial reporting capabilities.

### Key Features

- **🏪 Multi-Store Management**: Support for multiple stores/tenants
- **🌍 Multi-Language Support**: 10+ languages including English, Arabic, Chinese, French, German, Indonesian, Spanish, Turkish, and Vietnamese
- **💰 Multi-Currency Support**: Automatic currency conversion
- **🔐 Role-Based Access Control**: Comprehensive permission system
- **💳 Payment Gateway Integration**: Stripe, PayPal, Razorpay, and Paystack
- **📊 Advanced Reporting**: Sales, purchases, inventory, and financial reports
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔄 Real-time Updates**: Live inventory and sales tracking
- **📋 Barcode Generation**: Built-in barcode generation and printing
- **📄 PDF Reports**: Generate PDF reports for all transactions

## Quick Start

### System Requirements

- **PHP**: 8.1 or higher
- **Node.js**: 16.x or higher
- **MySQL**: 5.7+ or PostgreSQL 10+
- **Composer**: Latest version
- **Web Server**: Apache/Nginx

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/pos-ezakses.git
   cd pos-ezakses
   ```

2. **Install PHP dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your database and other settings
   ```

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Database Setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

7. **Build Assets**
   ```bash
   npm run production
   ```

8. **Start the application**
   ```bash
   php artisan serve
   ```

For detailed installation instructions, see [📖 Complete Documentation](docs/complete-system-documentation.md)

## Usage

### Basic Operations

1. **Access the application** at `http://localhost:8000`
2. **Login** with your credentials
3. **Navigate** using the sidebar menu:
   - **Dashboard**: Overview of sales, purchases, and inventory
   - **POS Screen**: Quick sales processing
   - **Products**: Manage inventory
   - **Sales**: View and create sales
   - **Purchases**: Manage suppliers and purchases
   - **Reports**: Generate various reports

### User Roles

- **Super Admin**: Full system access, manage subscriptions
- **Admin**: Store management, user management
- **Manager**: Full store operations, reporting
- **Cashier**: POS operations, basic reporting

## API Documentation

The system provides a comprehensive REST API for integration with external systems.

### Authentication

```http
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

### Key API Endpoints

- `GET /api/products` - List products
- `POST /api/sales` - Create sale
- `GET /api/reports/sales` - Sales reports
- `POST /api/purchases` - Create purchase

For complete API documentation, see [📖 Complete Documentation](docs/complete-system-documentation.md#api-documentation)

## Support

### Documentation

- **[Complete System Documentation](docs/complete-system-documentation.md)** - Comprehensive guide covering all aspects
- **[Laravel Documentation](https://laravel.com/docs)** - Backend framework documentation
- **[React Documentation](https://reactjs.org/docs)** - Frontend framework documentation

### Getting Help

1. **Check the documentation** first
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information

### Common Issues

- **Installation problems**: Check system requirements and PHP extensions
- **Permission errors**: Ensure proper file permissions for `storage/` and `bootstrap/cache/`
- **Database connection**: Verify database credentials in `.env` file
- **Asset compilation**: Clear npm cache if build fails

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

If you discover any security-related issues, please email security@pos-ezakses.com instead of using the issue tracker.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.2.0 (Current)
- ✅ Multi-tenancy support
- ✅ Enhanced payment gateway integrations
- ✅ Advanced reporting features
- ✅ Multi-language support (10+ languages)
- ✅ Improved UI/UX with Bootstrap 5

### Version 1.1.0
- ✅ Basic POS functionality
- ✅ Inventory management
- ✅ User management
- ✅ Basic reporting

### Version 1.0.0
- ✅ Initial release
- ✅ Core POS features
- ✅ Basic inventory tracking

## Acknowledgments

- **[Laravel](https://laravel.com)** - The PHP framework
- **[React](https://reactjs.org)** - The JavaScript library
- **[Bootstrap](https://getbootstrap.com)** - CSS framework
- **[InfyOm](https://infyom.com)** - Laravel generator and templates
- **All contributors** who help improve this project

---

<p align="center">
  <strong>Built with ❤️ for modern retail businesses</strong>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#support">Support</a> •
  <a href="#contributing">Contributing</a>
</p>
