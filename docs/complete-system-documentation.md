# POS.ezakses - Comprehensive System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [User Guide](#user-guide)
8. [Installation Guide](#installation-guide)
9. [System Requirements](#system-requirements)
10. [Troubleshooting](#troubleshooting)
11. [Development Guide](#development-guide)
12. [Advanced Features](#advanced-features)

---

## System Overview

POS.ezakses is a comprehensive Point of Sale (POS) system built with Laravel 10.23 and React 17.0.2, designed for retail businesses, warehouses, and multi-store operations. The system provides complete inventory management, sales tracking, purchase management, financial reporting, and advanced business automation capabilities.

**Current Version**: 1.2.0

### Key Characteristics

- **🏪 Multi-tenancy Support**: Supports multiple stores/tenants with separate databases
- **🌍 Multi-language Support**: 9 languages including English, Arabic, Chinese, French, German, Indonesian, Spanish, Turkish, and Vietnamese
- **💰 Multi-currency Support**: Multiple currencies with automatic conversion rates
- **🔐 Advanced Role-based Access Control**: Comprehensive permission system with granular controls
- **💳 Enhanced Payment Gateway Integration**: Stripe, PayPal, Razorpay, and Paystack with webhook support
- **📋 Barcode Generation & Scanning**: Built-in barcode generation and scanning capabilities
- **📄 Advanced PDF Reports**: Generate PDF reports for all transactions and analytics
- **📊 Excel Import/Export**: Bulk import/export functionality with advanced mapping
- **💰 Cash Advance Management**: Employee cash advance tracking and payment management
- **🏷️ Coupon & Gift Card System**: Discount coupons, promotional codes, and gift cards
- **📱 SMS Integration**: SMS notifications and template management
- **📧 Email Templates**: Customizable email notifications and templates
- **🔄 Product Variations**: Multiple product variations (size, color, etc.)
- **📦 Digital Products**: Support for downloadable digital products
- **📝 Quotation System**: Create and manage price quotations
- **↩️ Sale & Purchase Returns**: Complete return management system
- **💸 Expense Tracking**: Business expense management with categories
- **📊 Dashboard Analytics**: Real-time analytics and reporting dashboard
- **🔧 Inventory Alerts**: Automated low-stock and expiry alerts
- **👥 Customer Loyalty**: Customer loyalty programs and tracking
- **🛡️ Backup & Restore**: Automated backup and restore capabilities

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Browser                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │   React SPA     │  │        Laravel Backend              │  │
│  │                 │  │                                     │  │
│  │  - Redux Store  │  │  - REST API Layer                   │  │
│  │  - Components   │  │  - Business Logic                   │  │
│  │  - Routes       │  │  - Authentication                   │  │
│  │  - i18n         │  │  - Authorization                    │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────────────────────────┐  │
│  │     Database    │  │     External Services               │  │
│  │                 │  │                                     │  │
│  │  - MySQL/Postgre │  │  - Payment Gateways                 │  │
│  │  - Migrations   │  │  - SMS Services                     │  │
│  │  - Seeders      │  │  - Email Services                   │  │
│  │  - Models       │  │  - File Storage (AWS S3)            │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Application Structure

#### Backend (Laravel)
```
app/
├── Console/           # Artisan commands
├── DTOs/             # Data Transfer Objects
├── Http/Controllers/ # API and Web controllers
├── Models/           # Eloquent models (50+ models)
├── Repositories/     # Repository pattern implementation
├── Services/         # Business logic services
├── Filters/          # Query filters
├── Exports/          # Excel export classes
├── Imports/          # Excel import classes
└── Traits/           # Reusable model traits
```

#### Frontend (React)
```
resources/pos/src/
├── components/       # React components
│   ├── auth/         # Authentication components
│   ├── dashboard/    # Dashboard widgets
│   ├── products/     # Product management
│   ├── sales/        # Sales management
│   ├── purchases/    # Purchase management
│   └── reports/      # Reporting components
├── store/           # Redux store
│   ├── actions/     # Redux actions
│   └── reducers/    # Redux reducers
├── locales/         # Translation files
├── constants/       # Application constants
└── routes.js        # Frontend routes
```

---

## Core Features

### 1. Sales Management
- **Point of Sale (POS) Screen**: Touch-friendly interface for quick sales
- **Sales Processing**: Complete sales workflow with payment processing
- **Hold Sales**: Ability to hold and resume sales
- **Sales Returns**: Process returns and refunds
- **Payment Management**: Multiple payment methods and tracking
- **Receipt Generation**: PDF receipts with customizable templates

### 2. Inventory Management
- **Product Management**: Create, edit, and manage products with variations
- **Stock Tracking**: Real-time stock level monitoring
- **Stock Adjustments**: Manual stock adjustments for discrepancies
- **Stock Transfers**: Transfer stock between warehouses
- **Low Stock Alerts**: Automated alerts for low inventory
- **Barcode Generation**: Generate and print barcodes

### 3. Purchase Management
- **Purchase Orders**: Create and manage purchase orders
- **Supplier Management**: Maintain supplier information and history
- **Purchase Returns**: Handle returns to suppliers
- **Cost Tracking**: Track purchase costs and profit margins

### 4. Customer Management
- **Customer Database**: Store customer information and history
- **Customer Groups**: Categorize customers for targeted marketing
- **Payment History**: Track customer payments and outstanding balances
- **Customer Reports**: Generate customer-specific reports

### 5. Financial Management
- **Cash Advance System**: Manage cash advances to employees
- **Expense Tracking**: Track business expenses by category
- **Profit & Loss Reports**: Comprehensive financial reporting
- **Tax Management**: Configure and track taxes

### 6. Advanced Features
- **Multi-warehouse Support**: Manage multiple warehouses/locations
- **Quotation System**: Create and manage price quotations
- **Coupon System**: Create discount coupons and promotions
- **SMS Integration**: Send SMS notifications
- **Email Templates**: Customizable email templates
- **Multi-language Support**: 9 language support

---

## Advanced Features

### 1. Cash Advance Management
The system provides comprehensive cash advance management for employees:

#### Features
- **Employee Identity Management**: Track employee information for cash advances
- **Advance Requests**: Create and approve cash advance requests
- **Payment Tracking**: Monitor advance payments and outstanding amounts
- **Reporting**: Generate cash advance reports and summaries

#### Usage
1. **Setup Employee Identities**: Add employee information in Cash Advance Identities
2. **Create Advances**: Issue cash advances with amounts and purposes
3. **Track Payments**: Record payments against advances
4. **Generate Reports**: View advance summaries and payment history

### 2. Coupon System & Gift Cards
Advanced discount and loyalty management system:

#### Coupon Features
- **Fixed Amount Discounts**: Set specific discount amounts
- **Percentage Discounts**: Configure percentage-based discounts
- **Usage Limits**: Set maximum uses per coupon
- **Expiry Dates**: Automatic coupon expiration
- **Customer Restrictions**: Limit coupons to specific customers

#### Gift Card Features
- **Digital Gift Cards**: Generate and send digital gift cards
- **Physical Gift Cards**: Support for physical gift card printing
- **Balance Tracking**: Real-time gift card balance monitoring
- **Redemption**: Easy redemption at POS terminals

### 3. SMS Integration
Comprehensive SMS notification system:

#### Features
- **SMS Templates**: Pre-configured SMS templates for different events
- **Bulk SMS**: Send notifications to multiple recipients
- **Event Triggers**: Automatic SMS on sales, payments, low stock
- **Delivery Reports**: Track SMS delivery status
- **Provider Integration**: Support for multiple SMS providers

#### Configuration
```php
// SMS Settings Configuration
SMS_DRIVER=twilio // or nexmo, textlocal, etc.
SMS_FROM=+1234567890
NEXMO_KEY=your_key
NEXMO_SECRET=your_secret
```

### 4. Email Templates
Customizable email notification system:

#### Features
- **Template Editor**: Visual email template editor
- **Dynamic Variables**: Insert customer, order, and product data
- **Multi-language Support**: Templates for all supported languages
- **HTML/Rich Text**: Support for rich HTML email content
- **Attachment Support**: Attach invoices, receipts, and reports

#### Available Templates
- Order Confirmations
- Payment Receipts
- Low Stock Alerts
- Purchase Orders
- Customer Statements
- Marketing Newsletters

### 5. Product Variations
Advanced product variation management:

#### Features
- **Multiple Variation Types**: Size, Color, Material, Style, etc.
- **Stock per Variation**: Individual stock tracking for each variation
- **Price Variations**: Different prices for different variations
- **Image per Variation**: Unique images for each variation
- **Barcode per Variation**: Individual barcodes for variations

#### Usage
1. **Create Variation Types**: Define available variation types
2. **Add Variations**: Create specific variations for products
3. **Set Prices**: Configure pricing for each variation
4. **Manage Stock**: Track inventory per variation

### 6. Digital Products
Support for downloadable digital products:

#### Features
- **File Upload**: Secure file upload and storage
- **Download Limits**: Set maximum downloads per purchase
- **Expiry Dates**: Automatic download link expiration
- **Access Control**: Secure download links with authentication
- **Version Control**: Track and manage file versions

#### Supported File Types
- Documents (PDF, DOC, DOCX)
- Images (JPG, PNG, GIF)
- Audio (MP3, WAV)
- Video (MP4, AVI)
- Software (ZIP, RAR)
- E-books and other digital content

### 7. Quotation System
Professional quotation management:

#### Features
- **Quotation Creation**: Create detailed price quotations
- **Customer Selection**: Link quotations to specific customers
- **Product Selection**: Add products with custom pricing
- **Expiry Management**: Set quotation validity periods
- **Status Tracking**: Track quotation acceptance/rejection
- **Conversion to Sales**: Convert approved quotations to sales orders

#### Workflow
1. **Create Quotation**: Select customer and add products
2. **Customize Pricing**: Set special prices for quotation
3. **Send to Customer**: Email quotation with PDF attachment
4. **Track Response**: Monitor quotation status
5. **Convert to Sale**: Convert accepted quotations to sales

### 8. Sale & Purchase Returns
Complete return management system:

#### Sale Returns
- **Return Reasons**: Categorize return reasons
- **Partial Returns**: Return specific items from sales
- **Refund Processing**: Automatic refund calculations
- **Stock Restoration**: Update inventory on returns
- **Return Reports**: Comprehensive return analytics

#### Purchase Returns
- **Supplier Returns**: Process returns to suppliers
- **Return Documentation**: Maintain return records
- **Cost Recovery**: Track return costs and refunds
- **Supplier Communication**: Generate return documentation

### 9. Multi-Currency Support
Advanced currency management:

#### Features
- **Multiple Currencies**: Support for unlimited currencies
- **Exchange Rates**: Manual and automatic rate updates
- **Currency Conversion**: Real-time conversion calculations
- **Reporting**: Multi-currency financial reports
- **Payment Processing**: Multi-currency payment acceptance

#### Configuration
```php
// Currency Settings
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=USD,EUR,GBP,JPY,CNY
EXCHANGE_RATE_API=fixer // or exchangerate, currencylayer
AUTO_UPDATE_RATES=true
```

### 10. Inventory Alerts
Automated inventory monitoring:

#### Alert Types
- **Low Stock Alerts**: When stock falls below minimum levels
- **Out of Stock**: When products are completely depleted
- **Expiry Alerts**: For products with expiration dates
- **Reorder Point**: When stock reaches reorder levels

#### Configuration
- **Alert Thresholds**: Set minimum stock levels per product
- **Notification Channels**: Email, SMS, in-app notifications
- **Alert Frequency**: Configure alert timing and frequency
- **Auto-reorder**: Automatic purchase order generation

### 11. Supplier Management
Comprehensive supplier relationship management:

#### Features
- **Supplier Database**: Maintain detailed supplier information
- **Contact Management**: Store multiple contacts per supplier
- **Purchase History**: Track all purchases from suppliers
- **Payment Terms**: Configure supplier payment terms
- **Performance Tracking**: Monitor supplier performance metrics
- **Document Storage**: Store supplier contracts and certificates

### 12. Customer Loyalty Program
Advanced customer loyalty management:

#### Features
- **Loyalty Points**: Points-based loyalty system
- **Tier Management**: Multiple loyalty tiers with benefits
- **Points Redemption**: Redeem points for discounts
- **Referral Program**: Customer referral rewards
- **Birthday/Anniversary**: Special occasion rewards
- **Loyalty Reports**: Comprehensive loyalty analytics

### 13. Expense Tracking
Business expense management:

#### Features
- **Expense Categories**: Organize expenses by category
- **Receipt Management**: Attach receipts to expenses
- **Approval Workflow**: Expense approval process
- **Budget Tracking**: Monitor expenses against budgets
- **Tax Deductible**: Mark tax-deductible expenses
- **Reporting**: Detailed expense reports and analytics

### 14. Tax Management
Comprehensive tax calculation and reporting:

#### Features
- **Tax Configuration**: Multiple tax rates and rules
- **Tax Groups**: Group products by tax categories
- **Compound Tax**: Support for compound tax calculations
- **Tax Exemptions**: Handle tax-exempt customers
- **Tax Reports**: Generate tax liability reports
- **Automatic Updates**: Tax rate updates and notifications

### 15. Barcode Scanning
Advanced barcode functionality:

#### Features
- **Barcode Generation**: Generate barcodes for all products
- **Multiple Formats**: Support for various barcode formats
- **Bulk Generation**: Generate barcodes for multiple products
- **Custom Labels**: Custom barcode label designs
- **Scanner Integration**: Hardware scanner compatibility
- **Mobile Scanning**: Mobile device barcode scanning

### 16. Receipt Printing
Professional receipt management:

#### Features
- **Thermal Printer Support**: Direct thermal printer integration
- **Receipt Templates**: Customizable receipt layouts
- **Logo Integration**: Company logo on receipts
- **Multi-language**: Receipts in customer language
- **Digital Receipts**: Email receipts to customers
- **Receipt History**: Maintain receipt archives

### 17. Dashboard Analytics
Real-time business intelligence:

#### Analytics Features
- **Sales Analytics**: Revenue, profit, and sales trends
- **Product Performance**: Best-selling and slow-moving products
- **Customer Insights**: Customer behavior and preferences
- **Inventory Analytics**: Stock levels and turnover rates
- **Financial Overview**: Cash flow and financial health
- **Custom Reports**: User-defined analytical reports

#### Dashboard Widgets
- **Real-time Sales Counter**: Live sales tracking
- **Top Products Chart**: Best-performing products
- **Revenue Trend Graph**: Revenue over time
- **Stock Alert Summary**: Low stock notifications
- **Recent Activity Feed**: Latest system activities

### 18. User Roles and Permissions
Advanced access control system:

#### System Roles
- **Super Admin**: Complete system access and configuration
- **Admin**: Store management and user administration
- **Manager**: Full store operations and reporting
- **Cashier**: POS operations and basic reporting
- **Accountant**: Financial reports and expense management
- **Warehouse Staff**: Inventory and stock management

#### Permission Categories
- **Sales Management**: POS access, sales processing
- **Inventory Control**: Product and stock management
- **Financial Access**: Reports, expenses, cash advances
- **Customer Data**: Customer information and history
- **System Settings**: Configuration and administration
- **Report Access**: Various report generation permissions

### 19. Backup and Restore
Data protection and recovery:

#### Backup Features
- **Automated Backups**: Scheduled database and file backups
- **Multiple Storage**: Local and cloud storage options
- **Incremental Backups**: Efficient storage usage
- **Backup Encryption**: Secure backup encryption
- **Retention Policies**: Configurable backup retention

#### Restore Procedures
- **Point-in-time Recovery**: Restore to specific time points
- **Selective Restore**: Restore specific data components
- **Test Restores**: Verify backup integrity
- **Disaster Recovery**: Complete system recovery procedures

### 20. API Integrations
Comprehensive API ecosystem:

#### Third-party Integrations
- **Accounting Software**: QuickBooks, Xero integration
- **E-commerce Platforms**: Shopify, WooCommerce sync
- **CRM Systems**: Customer data synchronization
- **ERP Systems**: Enterprise resource planning integration
- **Shipping Services**: Automated shipping calculations
- **Tax Services**: Real-time tax calculation services

#### Webhook Support
- **Real-time Updates**: Instant notifications of events
- **Custom Webhooks**: User-defined webhook endpoints
- **Event Filtering**: Configure specific event triggers
- **Security**: Secure webhook authentication

---

## Technology Stack

### Backend Technologies
- **Framework**: Laravel 10.23
- **PHP Version**: PHP 8.1+
- **Database**: MySQL 5.7+/PostgreSQL 10+/SQLite
- **Authentication**: Laravel Sanctum with API tokens
- **Authorization**: Spatie Laravel Permission with advanced roles
- **Multi-tenancy**: Stancl/Tenancy for multi-store support
- **File Storage**: AWS S3 integration with local fallback
- **Payment Processing**: Stripe, PayPal, Razorpay, Paystack with webhooks
- **Barcode Generation**: Picqer PHP Barcode Generator
- **PDF Generation**: DomPDF with custom templates
- **Excel Processing**: Laravel Excel for import/export
- **Email Services**: SMTP, Mailgun, SendGrid support
- **Queue Management**: Laravel Queue with Redis support

### Frontend Technologies
- **Framework**: React 17.0.2
- **State Management**: Redux with Redux Thunk and Redux Persist
- **Styling**: Bootstrap 5.1.3, Custom SCSS, RTL support
- **Charts**: Chart.js, ECharts for advanced analytics
- **Internationalization**: React Intl with 9 language support
- **Build Tool**: Laravel Mix, Webpack 5
- **UI Components**: React Bootstrap, Custom components, FontAwesome icons
- **Additional Libraries**: React Router, Axios, Moment.js, React Toastify

### Development Tools
- **Package Manager**: Composer (PHP), NPM (Node.js)
- **Code Quality**: ESLint, Prettier
- **Testing**: PHPUnit, Jest
- **Barcode Generation**: Picqer PHP Barcode Generator
- **PDF Generation**: DomPDF
- **Excel Processing**: Laravel Excel

### External Integrations
- **Payment Gateways**: Stripe, PayPal, Razorpay, Paystack
- **SMS Services**: Configurable SMS providers
- **Email Services**: SMTP, Mailgun, SendGrid support
- **Cloud Storage**: AWS S3, Local storage

---

## Database Schema

### Core Models Overview

#### User Management
- **User**: Main user model with authentication
- **Role**: User roles with permissions
- **Permission**: Granular permissions system
- **Store**: Multi-tenant store management

#### Product Management
- **Product**: Main product model
- **ProductCategory**: Product categorization
- **Brand**: Product brands
- **Unit**: Product units of measurement
- **BaseUnit**: Base units for conversions
- **Variation**: Product variations (size, color, etc.)
- **Warehouse**: Warehouse management

#### Sales Management
- **Sale**: Sales transactions
- **SaleItem**: Individual items in sales
- **SalesPayment**: Payment records for sales
- **Hold**: Held sales for later completion
- **Quotation**: Price quotations

#### Purchase Management
- **Purchase**: Purchase transactions
- **PurchaseItem**: Items in purchases
- **Supplier**: Supplier information

#### Customer Management
- **Customer**: Customer database

#### Financial Management
- **Expense**: Business expenses
- **ExpenseCategory**: Expense categorization
- **CashAdvance**: Cash advance system
- **CashAdvanceIdentity**: Employee information for cash advances
- **Taxe**: Tax configuration

#### Inventory Management
- **Adjustment**: Stock adjustments
- **Transfer**: Stock transfers between warehouses
- **ManageStock**: Stock level management

#### Reporting & Communication
- **MailTemplate**: Email templates
- **SmsTemplate**: SMS templates
- **SmsSetting**: SMS configuration

---

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "user": {...},
        "token": "api_token_here",
        "token_type": "Bearer"
    }
}
```

#### Register
```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

### Product Management

#### Get All Products
```http
GET /api/products
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Items per page (default: 15)
- `search`: Search term for product name/code
- `category_id`: Filter by category

**Response:**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Product Name",
                "code": "P001",
                "price": 100.00,
                "stock_quantity": 50,
                "category": {...},
                "brand": {...}
            }
        ],
        "total": 100,
        "per_page": 15
    }
}
```

#### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "New Product",
    "code": "P002",
    "price": 150.00,
    "stock_quantity": 100,
    "category_id": 1,
    "brand_id": 1,
    "unit_id": 1
}
```

#### Update Product
```http
POST /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Updated Product Name",
    "price": 175.00
}
```

#### Delete Product
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

### Sales Management

#### Create Sale
```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

{
    "customer_id": 1,
    "warehouse_id": 1,
    "items": [
        {
            "product_id": 1,
            "quantity": 2,
            "price": 100.00
        }
    ],
    "payment_method": "cash",
    "paid_amount": 200.00
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "reference_no": "S2024001",
        "customer_id": 1,
        "total_amount": 200.00,
        "paid_amount": 200.00,
        "status": "completed",
        "items": [...],
        "payments": [...]
    }
}
```

### Dashboard API

#### Get Dashboard Data
```http
GET /api/today-sales-purchases-count
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "today_sales": 15,
        "today_purchases": 8,
        "today_revenue": 2500.00,
        "today_profit": 750.00
    }
}
```

#### Top Selling Products
```http
GET /api/top-selling-products
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "product_name": "Product A",
            "sold_quantity": 50,
            "revenue": 2500.00
        }
    ]
}
```

### Payment Integration

#### Stripe Payment Session
```http
POST /api/stripe/generate-session
Authorization: Bearer {token}
Content-Type: application/json

{
    "amount": 100.00,
    "currency": "USD",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "session_id": "cs_test_...",
        "payment_url": "https://checkout.stripe.com/pay/cs_test_..."
    }
}
```

#### PayPal Payment Session
```http
POST /api/paypal/generate-session
Authorization: Bearer {token}
Content-Type: application/json

{
    "amount": 100.00,
    "currency": "USD",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel"
}
```

#### Razorpay Payment Session
```http
POST /api/razorpay/generate-session
Authorization: Bearer {token}
Content-Type: application/json

{
    "amount": 100.00,
    "currency": "INR"
}
```

#### Paystack Payment Session
```http
POST /api/paystack/generate-session
Authorization: Bearer {token}
Content-Type: application/json

{
    "amount": 100.00,
    "currency": "NGN",
    "email": "customer@example.com"
}
```

### Cash Advance Management

#### Get Cash Advances
```http
GET /api/cash-advances
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number for pagination
- `limit`: Items per page (default: 15)
- `status`: Filter by status (pending/paid)
- `date_from`: Start date filter
- `date_to`: End date filter

**Response:**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "date": "2024-01-15",
                "identity_name": "John Doe",
                "amount": 1000.00,
                "paid_amount": 600.00,
                "outstanding_amount": 400.00,
                "status": "pending",
                "reference_code": "CA2024001"
            }
        ],
        "total": 50
    }
}
```

#### Create Cash Advance
```http
POST /api/cash-advances
Authorization: Bearer {token}
Content-Type: application/json

{
    "date": "2024-01-15",
    "identity_id": 1,
    "amount": 1000.00,
    "notes": "Advance for travel expenses"
}
```

#### Add Cash Advance Payment
```http
POST /api/cash-advances/{id}/payments
Authorization: Bearer {token}
Content-Type: application/json

{
    "amount": 500.00,
    "payment_date": "2024-01-20",
    "notes": "Partial payment"
}
```

### Product Management

#### Get Product Variations
```http
GET /api/variations
Authorization: Bearer {token}
```

#### Generate Product Barcode
```http
POST /api/products/generate-barcode
Authorization: Bearer {token}
Content-Type: application/json

{
    "product_ids": [1, 2, 3],
    "barcode_type": "CODE128"
}
```

### Quotation Management

#### Get Quotations
```http
GET /api/quotations
Authorization: Bearer {token}
```

#### Create Quotation
```http
POST /api/quotations
Authorization: Bearer {token}
Content-Type: application/json

{
    "customer_id": 1,
    "warehouse_id": 1,
    "items": [
        {
            "product_id": 1,
            "quantity": 10,
            "price": 95.00
        }
    ],
    "valid_until": "2024-02-15",
    "notes": "Special pricing for bulk order"
}
```

### Sale Returns

#### Get Sale Returns
```http
GET /api/sales-return
Authorization: Bearer {token}
```

#### Create Sale Return
```http
POST /api/sales-return
Authorization: Bearer {token}
Content-Type: application/json

{
    "sale_id": 1,
    "return_items": [
        {
            "sale_item_id": 1,
            "quantity": 2,
            "reason": "Defective product"
        }
    ],
    "notes": "Customer reported defects"
}
```

### Purchase Returns

#### Get Purchase Returns
```http
GET /api/purchases-return
Authorization: Bearer {token}
```

#### Create Purchase Return
```http
POST /api/purchases-return
Authorization: Bearer {token}
Content-Type: application/json

{
    "purchase_id": 1,
    "return_items": [
        {
            "purchase_item_id": 1,
            "quantity": 5,
            "reason": "Wrong item delivered"
        }
    ],
    "notes": "Return to supplier"
}
```

### Expense Management

#### Get Expenses
```http
GET /api/expenses
Authorization: Bearer {token}
```

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer {token}
Content-Type: application/json

{
    "date": "2024-01-15",
    "expense_category_id": 1,
    "amount": 250.00,
    "description": "Office supplies",
    "receipt": "receipt_image.jpg"
}
```

### Coupon Management

#### Get Coupons
```http
GET /api/coupon-codes
Authorization: Bearer {token}
```

#### Create Coupon
```http
POST /api/coupon-codes
Authorization: Bearer {token}
Content-Type: application/json

{
    "code": "SAVE10",
    "type": "percentage",
    "value": 10.00,
    "minimum_amount": 100.00,
    "usage_limit": 100,
    "expiry_date": "2024-12-31"
}
```

### Reports and Analytics

#### Stock Alerts
```http
GET /api/product-stock-alerts
Authorization: Bearer {token}
```

#### Profit Loss Report
```http
GET /api/profit-loss-report
Authorization: Bearer {token}
Query Parameters:
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `warehouse_id`: Filter by warehouse
```

#### Best Customers Report
```http
GET /api/best-customers-report
Authorization: Bearer {token}
Query Parameters:
- `limit`: Number of customers to show (default: 10)
- `date_from`: Start date
- `date_to`: End date
```

#### Supplier Report
```http
GET /api/supplier-report
Authorization: Bearer {token}
Query Parameters:
- `supplier_id`: Specific supplier ID
- `date_from`: Start date
- `date_to`: End date
```

### Settings and Configuration

#### Get System Settings
```http
GET /api/settings
Authorization: Bearer {token}
```

#### Update POS Settings
```http
POST /api/pos-settings/update
Authorization: Bearer {token}
Content-Type: application/json

{
    "default_customer": 1,
    "default_warehouse": 1,
    "show_product_code": true,
    "enable_sound": true,
    "receipt_printer": "thermal"
}
```

#### Get Currencies
```http
GET /api/currencies
Authorization: Bearer {token}
```

#### Change Language
```http
POST /api/change-language
Authorization: Bearer {token}
Content-Type: application/json

{
    "language": "es"
}
```

### Dashboard Endpoints

#### Today Sales Overview
```http
GET /api/today-sales-purchases-count
Authorization: Bearer {token}
```

#### Recent Sales
```http
GET /api/recent-sales
Authorization: Bearer {token}
Query Parameters:
- `limit`: Number of records (default: 10)
```

#### Top Selling Products
```http
GET /api/top-selling-products
Authorization: Bearer {token}
Query Parameters:
- `period`: Time period (today/week/month/year)
- `limit`: Number of products (default: 10)
```

#### Stock Alerts Summary
```http
GET /api/stock-alerts
Authorization: Bearer {token}
```

### Warehouse Management

#### Get Warehouses
```http
GET /api/warehouses
Authorization: Bearer {token}
```

#### Warehouse Details
```http
GET /api/warehouse-details/{id}
Authorization: Bearer {token}
```

#### Warehouse Report
```http
GET /api/warehouse-report
Authorization: Bearer {token}
Query Parameters:
- `warehouse_id`: Specific warehouse ID
- `date_from`: Start date
- `date_to`: End date
```

### Transfer Management

#### Get Transfers
```http
GET /api/transfers
Authorization: Bearer {token}
```

#### Create Transfer
```http
POST /api/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
    "from_warehouse_id": 1,
    "to_warehouse_id": 2,
    "items": [
        {
            "product_id": 1,
            "quantity": 50
        }
    ],
    "notes": "Stock rebalancing"
}
```

### SMS Management

#### Get SMS Settings
```http
GET /api/sms-settings
Authorization: Bearer {token}
```

#### Update SMS Settings
```http
POST /api/sms-settings
Authorization: Bearer {token}
Content-Type: application/json

{
    "driver": "twilio",
    "from": "+1234567890",
    "twilio_sid": "your_sid",
    "twilio_token": "your_token"
}
```

#### Get SMS Templates
```http
GET /api/sms-templates
Authorization: Bearer {token}
```

### Email Template Management

#### Get Email Templates
```http
GET /api/mail-templates
Authorization: Bearer {token}
```

#### Update Template Status
```http
POST /api/mail-template-status/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "status": true
}
```

### POS Register Management

#### Get Register Details
```http
GET /api/get-register-details/{user_id?}
Authorization: Bearer {token}
```

#### Register Entry
```http
POST /api/register-entry
Authorization: Bearer {token}
Content-Type: application/json

{
    "opening_cash": 500.00,
    "notes": "Starting morning shift"
}
```

#### Close Register
```http
POST /api/register-close
Authorization: Bearer {token}
Content-Type: application/json

{
    "closing_cash": 1450.00,
    "notes": "End of day reconciliation"
}
```

#### Register Report
```http
GET /api/register-report
Authorization: Bearer {token}
Query Parameters:
- `user_id`: Specific user ID
- `date_from`: Start date
- `date_to`: End date
```

### Import/Export Endpoints

#### Import Products
```http
POST /api/import-products
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "file": "products.csv"
}
```

#### Import Customers
```http
POST /api/import-customers
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "file": "customers.csv"
}
```

#### Import Suppliers
```http
POST /api/import-suppliers
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
    "file": "suppliers.csv"
}
```

#### Export Products Excel
```http
GET /api/products-export-excel/{warehouse_id?}
Authorization: Bearer {token}
```

### Digital Products

#### Get Digital Products
```http
GET /api/digital-products
Authorization: Bearer {token}
```

#### Create Digital Product
```http
POST /api/digital-products
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "E-book Template",
    "price": 29.99,
    "file_path": "path/to/ebook.pdf",
    "download_limit": 5,
    "expiry_days": 365
}
```

### Brand and Category Management

#### Get Brands
```http
GET /api/brands
Authorization: Bearer {token}
```

#### Create Brand
```http
POST /api/brands
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Apple",
    "logo": "brand_logo.png",
    "description": "Premium electronics brand"
}
```

#### Get Product Categories
```http
GET /api/product-categories
Authorization: Bearer {token}
```

### Tax Management

#### Get Taxes
```http
GET /api/taxes
Authorization: Bearer {token}
```

#### Create Tax
```http
POST /api/taxes
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "GST 18%",
    "rate": 18.00,
    "is_active": true
}
```

#### Update Tax Status
```http
GET /api/taxes/status-change/{tax}
Authorization: Bearer {token}
```

### Unit Management

#### Get Units
```http
GET /api/units
Authorization: Bearer {token}
```

#### Create Unit
```http
POST /api/units
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "Kilogram",
    "short_name": "kg",
    "base_unit_id": 1,
    "operator": "*",
    "operation_value": 1000
}
```

### Adjustment Management

#### Get Adjustments
```http
GET /api/adjustments
Authorization: Bearer {token}
```

#### Create Adjustment
```http
POST /api/adjustments
Authorization: Bearer {token}
Content-Type: application/json

{
    "warehouse_id": 1,
    "reason": "Damaged goods",
    "items": [
        {
            "product_id": 1,
            "quantity": -5,
            "type": "subtract"
        }
    ]
}
```

### Subscription Management (SaaS)

#### Get Subscriptions
```http
GET /api/subscriptions
Authorization: Bearer {token}
```

#### Get Current Plan
```http
GET /api/current-plan
Authorization: Bearer {token}
```

#### Create Subscription
```http
POST /api/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
    "plan_id": 1,
    "payment_method_id": "pm_1234567890"
}
```

### Multi-tenancy Endpoints

#### Get Stores
```http
GET /api/stores
Authorization: Bearer {token}
```

#### Change Store
```http
POST /api/change-store/{store}
Authorization: Bearer {token}
```

#### Create Store
```http
POST /api/stores
Authorization: Bearer {token}
Content-Type: application/json

{
    "name": "New Store",
    "domain": "newstore",
    "email": "store@example.com"
}
```

---

## User Guide

### Getting Started

#### 1. Login Process
1. Navigate to the application URL
2. Click on "Login" button
3. Enter your email and password
4. Click "Sign In"
5. You will be redirected to the dashboard based on your role

#### 2. Dashboard Overview
The dashboard provides a comprehensive view of:
- Today's sales and purchases
- Recent transactions
- Top-selling products
- Stock alerts
- Revenue and profit metrics

#### 3. Managing Products

##### Adding a New Product
1. Navigate to **Products** → **Add Product**
2. Fill in the product details:
   - Product name and code
   - Category and brand
   - Purchase and sale prices
   - Stock quantity
   - Product images
3. Click **Save** to create the product

##### Product Variations
1. In the product form, go to **Variations** tab
2. Add variation types (Size, Color, etc.)
3. Set prices for each variation
4. Save the variations

#### 4. Processing Sales

##### Using POS Screen
1. Navigate to **POS** → **POS Screen**
2. Search and add products to cart
3. Apply discounts if needed
4. Select payment method
5. Process payment
6. Print receipt (optional)

##### Creating Sales Manually
1. Navigate to **Sales** → **Add Sale**
2. Select customer and warehouse
3. Add products with quantities
4. Set payment terms
5. Save the sale

#### 5. Purchase Management

##### Creating Purchase Orders
1. Navigate to **Purchases** → **Add Purchase**
2. Select supplier
3. Add products with quantities and costs
4. Set payment status
5. Save the purchase

#### 6. Inventory Management

##### Stock Adjustments
1. Navigate to **Adjustments** → **Add Adjustment**
2. Select warehouse and products
3. Set adjustment quantities
4. Add reason for adjustment
5. Save adjustment

##### Stock Transfers
1. Navigate to **Transfers** → **Add Transfer**
2. Select source and destination warehouses
3. Add products and quantities
4. Save transfer

#### 7. Reports and Analytics

##### Sales Reports
1. Navigate to **Reports** → **Sales Report**
2. Select date range and filters
3. Generate report
4. Export to PDF or Excel

##### Inventory Reports
1. Navigate to **Reports** → **Stock Report**
2. View current stock levels
3. Identify low-stock items
4. Export inventory data

### User Roles and Permissions

#### Super Admin
- Full system access
- Manage subscriptions
- Configure system settings
- Access all reports

#### Admin
- Manage store operations
- Access store-specific reports
- Manage users and roles
- Configure store settings

#### Cashier
- Process sales via POS
- View basic reports
- Limited inventory access

#### Manager
- Full store management
- Access all reports
- Manage inventory
- Approve purchases

---

## Installation Guide

### System Requirements

#### Server Requirements
- **PHP**: 8.1 or higher
- **Database**: MySQL 5.7+ or PostgreSQL 10+
- **Web Server**: Apache/Nginx
- **Node.js**: 16.x or higher
- **Composer**: Latest version
- **Git**: For version control

#### Hardware Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB minimum
- **Processor**: 2 cores minimum

### Installation Steps

#### 1. Download and Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/pos-ezakses.git
cd pos-ezakses

# Install PHP dependencies (Laravel 10.23)
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies (React 17.0.2, Bootstrap 5.1.3)
npm install

# Copy environment file
cp .env.example .env
```

#### 2. Environment Configuration

Edit the `.env` file with your configuration:

```bash
# Application
APP_NAME="POS EzAkses"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=http://localhost:8000

# Database (Choose one)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_ezakses
DB_USERNAME=your_username
DB_PASSWORD=your_password

# For PostgreSQL
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=pos_ezakses

# For SQLite
# DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/database.sqlite
```

#### 3. Database Setup

```bash
# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed the database with initial data
php artisan db:seed

# For multi-tenant setup, run tenant migrations
php artisan tenants:migrate
```

#### 4. Build Assets

```bash
# Build frontend assets for production
npm run production

# Or for development with hot reloading
npm run hot

# Or for development with watching
npm run dev
```

#### 5. Storage Configuration

```bash
# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod -R 755 public

# Create storage link for file uploads
php artisan storage:link

# Create necessary directories
mkdir -p storage/app/public/products
mkdir -p storage/app/public/customers
mkdir -p storage/app/public/expenses
```

#### 6. Payment Gateway Configuration

Configure payment gateways in your `.env` file:

```bash
# Stripe
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Razorpay
RAZOR_KEY=rzp_test_your_key
RAZOR_SECRET=your_razorpay_secret

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_SECRET_KEY=sk_test_your_secret
```

#### 7. Email Configuration (Optional)

```bash
# SMTP Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourapp.com
MAIL_FROM_NAME="${APP_NAME}"

# Alternative: Mailgun
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-mailgun-domain
MAILGUN_SECRET=your-mailgun-secret
```

#### 8. SMS Configuration (Optional)

```bash
# Twilio SMS
SMS_DRIVER=twilio
SMS_FROM=+1234567890
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token

# Alternative SMS providers supported:
# - Nexmo
# - Textlocal
# - Custom HTTP API
```

#### 9. Final Setup and Optimization

```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate API documentation (if using Laravel API Resource)
php artisan l5-swagger:generate

# Start the application
php artisan serve --host=0.0.0.0 --port=8000
```

#### 10. Multi-Tenancy Setup (Optional)

For multi-store setup:

```bash
# Create the first tenant/store
php artisan tenants:create --name="Main Store" --email=admin@yourstore.com --domain=main

# Create additional tenants
php artisan tenants:create --name="Branch Store" --email=branch@yourstore.com --domain=branch

# List all tenants
php artisan tenants:list
```

#### 11. SSL/HTTPS Setup (Production)

For production deployment with SSL:

```bash
# Install SSL certificate (Let's Encrypt example)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or configure web server for SSL
# Apache: Enable mod_ssl and configure virtual hosts
# Nginx: Configure SSL in server block
```

#### 12. Queue Configuration (Optional)

For background processing:

```bash
# Configure queue driver in .env
QUEUE_CONNECTION=redis

# Start queue worker
php artisan queue:work --tries=3 --timeout=90

# For production with supervisor
php artisan queue:work --tries=3 --timeout=90 --sleep=3 --max-jobs=1000
```

#### 13. Backup Configuration (Optional)

Set up automated backups:

```bash
# Install Laravel Backup package (if not included)
composer require spatie/laravel-backup

# Configure backup settings
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"

# Schedule daily backups
php artisan backup:run --only-db
php artisan backup:run
```

### Post-Installation Verification

1. **Access the application**: Navigate to `http://localhost:8000`
2. **Login with default credentials**:
   - Email: admin@admin.com
   - Password: password
3. **Verify features**:
   - Dashboard loads correctly
   - Products can be added
   - Sales can be processed
   - Reports are accessible
4. **Test payment gateways** (if configured)
5. **Verify email/SMS** (if configured)

---

## System Requirements

### Minimum Requirements
- **Operating System**: Linux/Windows/macOS
- **PHP Version**: 8.1 or higher
- **Database**: MySQL 5.7+ / PostgreSQL 10+ / SQLite
- **Web Server**: Apache 2.4+ / Nginx 1.18+ with mod_rewrite
- **Node.js**: 16.x or higher (for asset compilation)
- **Composer**: Latest version
- **RAM**: 4GB
- **Storage**: 10GB SSD
- **Network**: Stable internet connection for payment gateways

### Recommended Requirements
- **Operating System**: Linux (Ubuntu 20.04+)
- **PHP Version**: 8.2 or higher
- **Database**: MySQL 8.0+ / PostgreSQL 13+ / SQLite
- **Web Server**: Nginx 1.20+ with mod_rewrite enabled
- **Node.js**: 18.x or higher (for asset compilation)
- **Composer**: Latest version
- **Redis**: Latest version (optional, for caching and sessions)
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **Network**: High-speed internet for optimal performance

### Supported Languages
The system supports 9 languages with complete translations:

1. **English** (en) - Primary language
2. **Arabic** (ar) - Right-to-left support
3. **Chinese** (cn) - Simplified Chinese
4. **French** (fr) - Complete French translation
5. **German** (gr) - German language support
6. **Indonesian** (id) - Bahasa Indonesia
7. **Spanish** (sp) - Spanish translation
8. **Turkish** (tr) - Turkish language support
9. **Vietnamese** (vi) - Vietnamese translation

### Browser Compatibility
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Opera**: 76+

### Mobile Compatibility
- **iOS Safari**: 14+
- **Android Chrome**: 90+
- **Responsive Design**: Optimized for tablets and mobile devices

---

## Troubleshooting

### Common Issues

#### 1. Installation Issues

**Problem**: Composer install fails
**Solution**:
```bash
# Clear composer cache
composer clear-cache

# Update composer
composer self-update

# Try again
composer install
```

**Problem**: NPM install fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and try again
rm -rf node_modules package-lock.json
npm install
```

#### 2. Database Connection Issues

**Problem**: Database connection error
**Solution**:
1. Check database credentials in `.env` file
2. Ensure database server is running
3. Verify database user permissions
4. Test connection: `php artisan migrate:status`

#### 3. Permission Issues

**Problem**: File permission errors
**Solution**:
```bash
# Fix storage permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Fix public directory permissions
chmod -R 755 public

# Create storage link if missing
php artisan storage:link
```

#### 4. Migration Issues

**Problem**: Migration fails
**Solution**:
```bash
# Reset migrations (CAUTION: This will delete data)
php artisan migrate:reset

# Run migrations again
php artisan migrate

# If specific migration fails, skip it temporarily
php artisan migrate --force
```

#### 5. Asset Compilation Issues

**Problem**: NPM build fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall dependencies
npm install

# Try building again
npm run production
```

#### 6. Payment Gateway Issues

**Problem**: Payment gateway not working
**Solution**:
1. Check gateway credentials in admin settings
2. Verify webhook URLs are correct
3. Check gateway dashboard for errors
4. Test with small amount first

#### 7. Email Issues

**Problem**: Emails not sending
**Solution**:
1. Check mail configuration in `.env`
2. Verify SMTP credentials
3. Check spam folder
4. Test with different email provider

#### 8. Performance Issues

**Problem**: Slow loading times
**Solution**:
1. Enable caching: `php artisan config:cache`
2. Optimize database queries
3. Check server resources
4. Enable Redis for caching (recommended)

### Debug Mode

#### Enable Debug Mode
```bash
# In .env file
APP_DEBUG=true
APP_ENV=local
```

#### Check Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Web server error logs
tail -f /var/log/apache2/error.log
# or
tail -f /var/log/nginx/error.log
```

#### Common Error Codes

- **500 Internal Server Error**: Check PHP error logs
- **419 Page Expired**: Check CSRF token configuration
- **404 Not Found**: Check routes and file permissions
- **403 Forbidden**: Check file/directory permissions

---

## Development Guide

### Code Structure Best Practices

#### Backend Development

##### Model Structure
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\BaseModel;

class Product extends BaseModel
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'code', 'price', 'stock_quantity',
        'category_id', 'brand_id'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Accessors & Mutators
    public function getFormattedPriceAttribute()
    {
        return number_format($this->price, 2);
    }
}
```

##### API Controller Structure
```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Http\Request;

class ProductAPIController extends Controller
{
    protected $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function index(Request $request)
    {
        $products = $this->productRepository->getAll($request);
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0'
        ]);

        $product = $this->productRepository->create($validated);

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product created successfully'
        ], 201);
    }
}
```

##### Repository Pattern
```php
<?php

namespace App\Repositories;

use App\Models\Product;
use Prettus\Repository\Eloquent\BaseRepository;

class ProductRepository extends BaseRepository
{
    public function model()
    {
        return Product::class;
    }

    public function getAll($request)
    {
        $query = $this->model->with(['category', 'brand']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return $query->paginate($request->get('limit', 15));
    }
}
```

#### Frontend Development

##### React Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/actions/productActions';

const ProductList = () => {
    const dispatch = useDispatch();
    const { products, loading } = useSelector(state => state.products);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchProducts({ search: searchTerm }));
    }, [dispatch, searchTerm]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="product-list">
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="products-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
```

##### Redux Action Structure
```jsx
// Action Types
export const PRODUCT_ACTIONS = {
    FETCH_PRODUCTS_REQUEST: 'FETCH_PRODUCTS_REQUEST',
    FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
    FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE',
};

// Action Creators
export const fetchProductsRequest = () => ({
    type: PRODUCT_ACTIONS.FETCH_PRODUCTS_REQUEST
});

export const fetchProductsSuccess = (products) => ({
    type: PRODUCT_ACTIONS.FETCH_PRODUCTS_SUCCESS,
    payload: products
});

export const fetchProductsFailure = (error) => ({
    type: PRODUCT_ACTIONS.FETCH_PRODUCTS_FAILURE,
    payload: error
});

// Async Action
export const fetchProducts = (params = {}) => {
    return async (dispatch) => {
        dispatch(fetchProductsRequest());

        try {
            const response = await api.get('/products', { params });
            dispatch(fetchProductsSuccess(response.data));
        } catch (error) {
            dispatch(fetchProductsFailure(error.message));
        }
    };
};
```

### API Integration Examples

#### JavaScript (Frontend)
```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const token = localStorage.getItem('authToken');

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Get products
export const getProducts = async (params = {}) => {
    try {
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
};

// Create product
export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create product');
    }
};
```

#### PHP (External Integration)
```php
<?php

class POSEzaksesAPI {
    private $baseUrl;
    private $apiToken;

    public function __construct($baseUrl, $apiToken) {
        $this->baseUrl = $baseUrl;
        $this->apiToken = $apiToken;
    }

    private function makeRequest($endpoint, $method = 'GET', $data = []) {
        $url = $this->baseUrl . $endpoint;

        $headers = [
            'Authorization: Bearer ' . $this->apiToken,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        } else {
            throw new Exception('API request failed with status ' . $httpCode);
        }
    }

    public function getProducts($params = []) {
        return $this->makeRequest('/products?' . http_build_query($params));
    }

    public function createSale($saleData) {
        return $this->makeRequest('/sales', 'POST', $saleData);
    }
}
```

### Database Optimization

#### Indexing Strategy
```sql
-- Product search optimization
ALTER TABLE products ADD INDEX idx_products_search (name, code);

-- Sales query optimization
ALTER TABLE sales ADD INDEX idx_sales_date (date, created_at);
ALTER TABLE sales ADD INDEX idx_sales_customer (customer_id);

-- Inventory optimization
ALTER TABLE products ADD INDEX idx_products_stock (stock_quantity, warehouse_id);
```

#### Query Optimization
```php
// Instead of N+1 queries
$products = Product::with(['category', 'brand'])->get();

// Use pagination for large datasets
$products = Product::with(['category', 'brand'])
    ->paginate(50);

// Optimize complex queries
$sales = Sale::selectRaw('
        sales.*,
        SUM(sale_items.subtotal) as total_amount,
        COUNT(sale_items.id) as item_count
    ')
    ->join('sale_items', 'sales.id', '=', 'sale_items.sale_id')
    ->groupBy('sales.id')
    ->paginate(20);
```

### Security Best Practices

#### API Security
```php
// Rate limiting
Route::middleware(['throttle:60,1'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Input validation
$request->validate([
    'email' => 'required|email|max:255',
    'password' => 'required|string|min:8'
]);

// SQL injection prevention (Eloquent ORM handles this)
```

#### Frontend Security
```javascript
// XSS prevention
const cleanHTML = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

// CSRF protection
const config = {
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    }
};
```

### Performance Optimization

#### Caching Strategy
```php
// Cache configuration
CACHE_DRIVER=redis
SESSION_DRIVER=redis

// Cache implementation
use Illuminate\Support\Facades\Cache;

$products = Cache::remember('products.list', 3600, function () {
    return Product::with(['category'])->get();
});
```

#### Asset Optimization
```javascript
// Code splitting
const ProductList = lazy(() => import('./components/ProductList'));

// Image optimization
const OptimizedImage = ({ src, alt }) => (
    <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
    />
);
```

### Testing Guidelines

#### Backend Testing
```php
<?php

use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_product()
    {
        $productData = [
            'name' => 'Test Product',
            'price' => 100.00,
            'stock_quantity' => 50
        ];

        $response = $this->postJson('/api/products', $productData);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'data' => ['id', 'name', 'price']
                 ]);
    }
}
```

#### Frontend Testing
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ProductList from './ProductList';

test('renders product list', () => {
    render(<ProductList />);

    expect(screen.getByText('Products')).toBeInTheDocument();
});

test('filters products by search term', () => {
    render(<ProductList />);

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'laptop' } });

    expect(searchInput.value).toBe('laptop');
});
```

---

## Additional Resources

### Useful Links
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Redux Documentation](https://redux.js.org/)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [PayPal API Documentation](https://developer.paypal.com/docs/api/overview/)

### Community Support
- [Laravel Community](https://laravel.com/community)
- [React Community](https://reactjs.org/community.html)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/laravel+react)

### Contributing Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### API Integration Examples

#### PHP Integration Example

```php
<?php

class EzAksesPOSAPI {
    private $baseUrl;
    private $apiToken;

    public function __construct($baseUrl, $apiToken) {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->apiToken = $apiToken;
    }

    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . '/api' . $endpoint;

        $headers = [
            'Authorization: Bearer ' . $this->apiToken,
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'PUT' && $data) {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        } else {
            throw new Exception('API request failed with status ' . $httpCode . ': ' . $response);
        }
    }

    // Product Management
    public function getProducts($params = []) {
        $query = http_build_query($params);
        return $this->makeRequest('/products?' . $query);
    }

    public function createProduct($productData) {
        return $this->makeRequest('/products', 'POST', $productData);
    }

    public function updateProduct($productId, $productData) {
        return $this->makeRequest('/products/' . $productId, 'POST', $productData);
    }

    public function deleteProduct($productId) {
        return $this->makeRequest('/products/' . $productId, 'DELETE');
    }

    // Sales Management
    public function createSale($saleData) {
        return $this->makeRequest('/sales', 'POST', $saleData);
    }

    public function getSales($params = []) {
        $query = http_build_query($params);
        return $this->makeRequest('/sales?' . $query);
    }

    // Cash Advance Management
    public function getCashAdvances($params = []) {
        $query = http_build_query($params);
        return $this->makeRequest('/cash-advances?' . $query);
    }

    public function createCashAdvance($advanceData) {
        return $this->makeRequest('/cash-advances', 'POST', $advanceData);
    }

    public function addCashAdvancePayment($advanceId, $paymentData) {
        return $this->makeRequest('/cash-advances/' . $advanceId . '/payments', 'POST', $paymentData);
    }

    // Reports
    public function getSalesReport($params = []) {
        $query = http_build_query($params);
        return $this->makeRequest('/reports/sales?' . $query);
    }

    public function getStockAlerts() {
        return $this->makeRequest('/product-stock-alerts');
    }

    // Dashboard Data
    public function getDashboardData() {
        return $this->makeRequest('/today-sales-purchases-count');
    }

    public function getTopSellingProducts($limit = 10) {
        return $this->makeRequest('/top-selling-products?limit=' . $limit);
    }
}

// Usage Example
try {
    $api = new EzAksesPOSAPI('https://your-pos.com', 'your-api-token');

    // Get dashboard data
    $dashboard = $api->getDashboardData();
    echo "Today's Sales: " . $dashboard['data']['today_sales'] . "\n";

    // Create a product
    $product = $api->createProduct([
        'name' => 'Sample Product',
        'code' => 'SP001',
        'price' => 99.99,
        'stock_quantity' => 100,
        'category_id' => 1
    ]);

    // Get stock alerts
    $alerts = $api->getStockAlerts();
    foreach ($alerts['data'] as $alert) {
        echo "Low stock: " . $alert['name'] . " - Quantity: " . $alert['stock_quantity'] . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

#### JavaScript/Node.js Integration Example

```javascript
const axios = require('axios');

class EzAksesPOSAPI {
    constructor(baseUrl, apiToken) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiToken = apiToken;
        this.client = axios.create({
            baseURL: this.baseUrl + '/api',
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    async makeRequest(method, endpoint, data = null) {
        try {
            const response = await this.client.request({
                method,
                url: endpoint,
                data
            });
            return response.data;
        } catch (error) {
            throw new Error(`API request failed: ${error.response?.data?.message || error.message}`);
        }
    }

    // Product Management
    async getProducts(params = {}) {
        return this.makeRequest('GET', '/products', params);
    }

    async createProduct(productData) {
        return this.makeRequest('POST', '/products', productData);
    }

    async updateProduct(productId, productData) {
        return this.makeRequest('POST', `/products/${productId}`, productData);
    }

    async deleteProduct(productId) {
        return this.makeRequest('DELETE', `/products/${productId}`);
    }

    // Sales Management
    async createSale(saleData) {
        return this.makeRequest('POST', '/sales', saleData);
    }

    async getSales(params = {}) {
        return this.makeRequest('GET', '/sales', params);
    }

    // Cash Advance Management
    async getCashAdvances(params = {}) {
        return this.makeRequest('GET', '/cash-advances', params);
    }

    async createCashAdvance(advanceData) {
        return this.makeRequest('POST', '/cash-advances', advanceData);
    }

    async addCashAdvancePayment(advanceId, paymentData) {
        return this.makeRequest('POST', `/cash-advances/${advanceId}/payments`, paymentData);
    }

    // Reports
    async getSalesReport(params = {}) {
        return this.makeRequest('GET', '/reports/sales', params);
    }

    async getStockAlerts() {
        return this.makeRequest('GET', '/product-stock-alerts');
    }

    // Dashboard Data
    async getDashboardData() {
        return this.makeRequest('GET', '/today-sales-purchases-count');
    }

    async getTopSellingProducts(limit = 10) {
        return this.makeRequest('GET', `/top-selling-products?limit=${limit}`);
    }
}

// Usage Example
async function example() {
    try {
        const api = new EzAksesPOSAPI('https://your-pos.com', 'your-api-token');

        // Get dashboard data
        const dashboard = await api.getDashboardData();
        console.log('Today\'s Sales:', dashboard.data.today_sales);

        // Create a product
        const product = await api.createProduct({
            name: 'Sample Product',
            code: 'SP001',
            price: 99.99,
            stock_quantity: 100,
            category_id: 1
        });
        console.log('Created product:', product.data.name);

        // Get stock alerts
        const alerts = await api.getStockAlerts();
        alerts.data.forEach(alert => {
            console.log(`Low stock: ${alert.name} - Quantity: ${alert.stock_quantity}`);
        });

        // Create a cash advance
        const cashAdvance = await api.createCashAdvance({
            date: '2024-01-15',
            identity_id: 1,
            amount: 1000.00,
            notes: 'Advance for travel'
        });
        console.log('Created cash advance:', cashAdvance.data.reference_code);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the example
example();
```

#### Python Integration Example

```python
import requests
import json
from datetime import datetime

class EzAksesPOSAPI:
    def __init__(self, base_url, api_token):
        self.base_url = base_url.rstrip('/')
        self.api_token = api_token
        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

    def make_request(self, method, endpoint, data=None):
        url = f"{self.base_url}/api{endpoint}"

        response = requests.request(
            method=method,
            url=url,
            headers=self.headers,
            json=data,
            verify=False  # Set to True in production with proper certificates
        )

        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"API request failed with status {response.status_code}: {response.text}")

    # Product Management
    def get_products(self, params=None):
        if params is None:
            params = {}
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        endpoint = f"/products?{query_string}" if query_string else "/products"
        return self.make_request('GET', endpoint)

    def create_product(self, product_data):
        return self.make_request('POST', '/products', product_data)

    def update_product(self, product_id, product_data):
        return self.make_request('POST', f'/products/{product_id}', product_data)

    def delete_product(self, product_id):
        return self.make_request('DELETE', f'/products/{product_id}')

    # Sales Management
    def create_sale(self, sale_data):
        return self.make_request('POST', '/sales', sale_data)

    def get_sales(self, params=None):
        if params is None:
            params = {}
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        endpoint = f"/sales?{query_string}" if query_string else "/sales"
        return self.make_request('GET', endpoint)

    # Cash Advance Management
    def get_cash_advances(self, params=None):
        if params is None:
            params = {}
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        endpoint = f"/cash-advances?{query_string}" if query_string else "/cash-advances"
        return self.make_request('GET', endpoint)

    def create_cash_advance(self, advance_data):
        return self.make_request('POST', '/cash-advances', advance_data)

    def add_cash_advance_payment(self, advance_id, payment_data):
        return self.make_request('POST', f'/cash-advances/{advance_id}/payments', payment_data)

    # Reports
    def get_sales_report(self, params=None):
        if params is None:
            params = {}
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        endpoint = f"/reports/sales?{query_string}" if query_string else "/reports/sales"
        return self.make_request('GET', endpoint)

    def get_stock_alerts(self):
        return self.make_request('GET', '/product-stock-alerts')

    # Dashboard Data
    def get_dashboard_data(self):
        return self.make_request('GET', '/today-sales-purchases-count')

    def get_top_selling_products(self, limit=10):
        return self.make_request('GET', f'/top-selling-products?limit={limit}')

# Usage Example
def main():
    try:
        api = EzAksesPOSAPI('https://your-pos.com', 'your-api-token')

        # Get dashboard data
        dashboard = api.get_dashboard_data()
        print(f"Today's Sales: {dashboard['data']['today_sales']}")

        # Create a product
        product = api.create_product({
            'name': 'Sample Product',
            'code': 'SP001',
            'price': 99.99,
            'stock_quantity': 100,
            'category_id': 1
        })
        print(f"Created product: {product['data']['name']}")

        # Get stock alerts
        alerts = api.get_stock_alerts()
        for alert in alerts['data']:
            print(f"Low stock: {alert['name']} - Quantity: {alert['stock_quantity']}")

        # Create a cash advance
        cash_advance = api.create_cash_advance({
            'date': '2024-01-15',
            'identity_id': 1,
            'amount': 1000.00,
            'notes': 'Advance for travel expenses'
        })
        print(f"Created cash advance: {cash_advance['data']['reference_code']}")

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
```

### Version History

#### **v1.2.0** (Current - 2024)
**Multi-Tenancy & Advanced Features Release**

- ✅ **Multi-tenancy Support**: Separate databases per store with tenant management
- ✅ **Enhanced Payment Gateways**: Complete integration with Stripe, PayPal, Razorpay, Paystack including webhooks
- ✅ **Advanced Reporting**: Excel/PDF exports, comprehensive analytics dashboard
- ✅ **Cash Advance Management**: Employee cash advance tracking and payment system
- ✅ **Coupon System**: Discount coupons, promotional codes, and gift cards
- ✅ **SMS Integration**: SMS notifications with template management
- ✅ **Email Templates**: Customizable email notifications and templates
- ✅ **Product Variations**: Multiple product variations (size, color, etc.)
- ✅ **Digital Products**: Support for downloadable digital products
- ✅ **Quotation System**: Create and manage price quotations
- ✅ **Sale & Purchase Returns**: Complete return management system
- ✅ **Expense Tracking**: Business expense management with categories
- ✅ **POS Registers**: Cash register management and reporting
- ✅ **Barcode Generation**: Built-in barcode generation and printing
- ✅ **Stock Adjustments**: Manual stock adjustment capabilities
- ✅ **Multi-warehouse Support**: Manage multiple warehouses/locations
- ✅ **Customer Loyalty**: Customer loyalty programs and tracking
- ✅ **Tax Management**: Comprehensive tax calculation and reporting
- ✅ **Inventory Alerts**: Automated low-stock and expiry alerts
- ✅ **Supplier Management**: Comprehensive supplier relationship management
- ✅ **Dashboard Analytics**: Real-time analytics and reporting dashboard
- ✅ **Backup & Restore**: Automated backup and restore capabilities
- ✅ **API Integrations**: Third-party system integrations
- ✅ **Multi-language Support**: 9 languages with complete translations
- ✅ **Improved UI/UX**: Bootstrap 5.1.3 with responsive design
- ✅ **Updated Framework Versions**: Laravel 10.23, React 17.0.2

#### **v1.1.0** (2023)
**Enhanced Features Release**

- ✅ Basic POS functionality
- ✅ Inventory management
- ✅ User management
- ✅ Basic reporting
- ✅ Multi-language support (initial)
- ✅ Payment gateway integration (basic)

#### **v1.0.0** (2023)
**Initial Release**

- ✅ Core POS features
- ✅ Basic inventory tracking
- ✅ User authentication
- ✅ Basic sales processing

### License
This project is licensed under the MIT License - see the LICENSE file for details.

---

*This documentation was last updated on: 2025-10-21*
*Documentation version: 1.2.0*
*System version: 1.2.0*