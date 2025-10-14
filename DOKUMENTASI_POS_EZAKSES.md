# Dokumentasi Sistem POS.ezakses

## Ringkasan Sistem

POS.ezakses adalah aplikasi Point of Sale (POS) berbasis web yang dibangun dengan teknologi modern untuk membantu bisnis dalam mengelola penjualan, inventori, dan operasional sehari-hari. Sistem ini dirancang sebagai Software as a Service (SaaS) dengan arsitektur multi-tenant yang memungkinkan banyak bisnis menggunakan satu instalasi aplikasi.

## Teknologi Stack

### Backend
- **Framework**: Laravel 10
- **Bahasa**: PHP 8.1+
- **Database**: MySQL/PostgreSQL
- **Multi-tenant**: Stancl/Tenancy
- **API**: Laravel Sanctum
- **ORM**: Eloquent

### Frontend
- **Framework**: React 17
- **State Management**: Redux
- **UI Library**: Bootstrap 5, Reactstrap
- **Charts**: Chart.js, ECharts
- **Routing**: React Router v6
- **Build Tool**: Laravel Mix, Webpack

### Fitur Tambahan
- **Template Admin**: AdminLTE
- **Generator**: InfyomLabs Laravel Generator
- **Media Library**: Spatie Laravel MediaLibrary
- **Excel Import/Export**: Maatwebsite Excel
- **Barcode Generator**: Picqer PHP Barcode Generator
- **PDF Generator**: Barryvdh Laravel DOMPDF

## Arsitektur Sistem

### Multi-Tenant
Sistem menggunakan arsitektur multi-tenant dimana setiap tenant (bisnis/pelanggan) memiliki database terpisah untuk keamanan dan isolasi data.

### Struktur Database
- **Tenant utama**: Database untuk super admin dan konfigurasi sistem
- **Tenant databases**: Database terpisah untuk setiap bisnis/pelanggan

## Fitur Utama

### 1. Manajemen Produk
- Katalog produk dengan kategori
- Variasi produk (ukuran, warna, dll)
- Manajemen stok real-time
- Barcode generation
- Import/Export produk via Excel

### 2. Penjualan (Sales)
- Point of Sale interface
- Multiple payment methods
- Diskon dan promo
- Return penjualan
- Laporan penjualan
- Print receipt

### 3. Pembelian (Purchase)
- Purchase Order management
- Supplier management
- Purchase return
- Stock adjustment

### 4. Manajemen Inventory
- Multi-warehouse support
- Stock transfer antar gudang
- Stock counting
- Low stock alerts
- Inventory reports

### 5. Customer Management
- Customer database
- Customer groups
- Loyalty program
- Customer statements

### 6. Supplier Management
- Supplier database
- Purchase history
- Supplier payments

### 7. Financial Management
- Expense tracking
- Cash advance management
- Salary management
- Financial reports

### 8. User Management
- Role-based access control (RBAC)
- Multi-store user management
- Permission management
- User activity logs

### 9. Reports & Analytics
- Sales reports
- Inventory reports
- Financial reports
- Customer reports
- Dashboard analytics
- Export to PDF/Excel

### 10. Payment Integration
- **PayPal**
- **Stripe**
- **Razorpay**
- **Paystack**
- Cash payments
- Bank transfers

## Komponen Frontend

### Layout & Navigation
- `MasterLayout.js` - Layout utama aplikasi
- `sidebar/` - Komponen sidebar navigasi
- `header/` - Header dengan informasi user
- `footer/` - Footer aplikasi

### Core Modules

#### Authentication
- `auth/` - Komponen login, register, forgot password

#### Dashboard
- `dashboard/` - Dashboard utama dengan analytics

#### Master Data
- `product/` - Manajemen produk dan kategori
- `customer/` - Manajemen pelanggan
- `supplier/` - Manajemen supplier
- `warehouse/` - Manajemen gudang
- `brands/` - Manajemen merek
- `units/` - Manajemen satuan produk
- `base-unit/` - Manajemen satuan dasar

#### Transactions
- `sales/` - Penjualan dan POS
- `purchase/` - Pembelian
- `saleReturn/` - Retur penjualan
- `purchaseReturn/` - Retur pembelian
- `expense/` - Pengeluaran
- `transfers/` - Transfer stok antar gudang

#### Reports
- `report/` - Berbagai laporan sistem

#### Settings
- `settings/` - Konfigurasi sistem
- `roles/` - Manajemen role dan permission
- `users/` - Manajemen pengguna
- `store/` - Manajemen toko
- `paymentMethod/` - Metode pembayaran

#### Advanced Features
- `quotations/` - Manajemen quotation
- `cash-advance/` - Uang muka
- `adjustments/` - Penyesuaian stok
- `dualScreenSetting/` - Setting dual screen POS

## Model Database Utama

### Core Models
- **User**: Manajemen pengguna sistem
- **Store**: Manajemen toko/cabang
- **Warehouse**: Manajemen gudang
- **Product**: Manajemen produk
- **ProductCategory**: Kategori produk
- **Customer**: Data pelanggan
- **Supplier**: Data supplier

### Transaction Models
- **Sale**: Data penjualan
- **Purchase**: Data pembelian
- **Expense**: Pengeluaran
- **Transfer**: Transfer stok
- **Adjustment**: Penyesuaian stok

### Financial Models
- **Payment**: Data pembayaran
- **CashAdvance**: Uang muka
- **Salary**: Manajemen gaji

## API Endpoints

### Authentication
- `POST /api/login` - Login pengguna
- `POST /api/logout` - Logout
- `POST /api/register` - Registrasi pengguna baru

### Products
- `GET /api/products` - Daftar produk
- `POST /api/products` - Tambah produk baru
- `PUT /api/products/{id}` - Update produk
- `DELETE /api/products/{id}` - Hapus produk

### Sales
- `GET /api/sales` - Daftar penjualan
- `POST /api/sales` - Buat penjualan baru
- `GET /api/sales/{id}` - Detail penjualan

### Reports
- `GET /api/reports/sales` - Laporan penjualan
- `GET /api/reports/inventory` - Laporan inventory
- `GET /api/reports/financial` - Laporan keuangan

## Sistem Multi-Bahasa

Sistem mendukung multiple language dengan struktur:
- **Backend**: File PHP di `lang/` directory
- **Frontend**: File JSON di `resources/pos/src/locales/`

### Bahasa yang Didukung
- English (en)
- Arabic (ar)
- Chinese (cn)
- French (fr)
- German (gr)
- Spanish (sp)
- Turkish (tr)
- Vietnamese (vi)
- Indonesian (id)

## Instalasi dan Setup

### Prerequisites
- PHP 8.1 atau higher
- Composer
- Node.js 16+
- MySQL/PostgreSQL

### Instalasi
```bash
# Clone repository
git clone [repository-url]
cd pos.ezakses

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=pos_ezakses
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Build assets
npm run production

# Start development server
php artisan serve
```

### Konfigurasi Multi-Tenant
```bash
# Publish tenant migrations
php artisan vendor:publish --provider="Stancl\Tenancy\TenancyServiceProvider"

# Run tenant migrations
php artisan tenants:migrate
```

## Konfigurasi Pembayaran

### PayPal
```php
// config/paypal.php
'client_id' => env('PAYPAL_CLIENT_ID'),
'client_secret' => env('PAYPAL_CLIENT_SECRET'),
'mode' => env('PAYPAL_MODE', 'sandbox'),
```

### Stripe
```php
// config/payment.php
'stripe' => [
    'public_key' => env('STRIPE_KEY'),
    'secret_key' => env('STRIPE_SECRET'),
]
```

## Deployment

### Production Deployment
```bash
# Build production assets
npm run production

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### Environment Variables
```env
APP_NAME="POS.ezakses"
APP_ENV=production
APP_KEY=base64:your-key-here
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pos_ezakses
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Multi-tenant
TENANCY_FILESYSTEM_DISK=local
CENTRAL_DOMAINS=yourdomain.com

# Payment Gateways
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
STRIPE_KEY=your_stripe_key
STRIPE_SECRET=your_stripe_secret
```

## Penggunaan Sistem

### Setup Awal
1. **Registrasi Super Admin**
   - Akses aplikasi pertama kali
   - Buat akun super admin
   - Konfigurasi sistem dasar

2. **Setup Tenant**
   - Buat tenant baru untuk setiap bisnis
   - Konfigurasi database tenant
   - Setup domain/custom domain

3. **Konfigurasi Toko**
   - Tambah informasi toko
   - Setup gudang
   - Konfigurasi metode pembayaran

### Operasional Harian
1. **Manajemen Produk**
   - Tambah produk baru
   - Update stok
   - Kelola kategori

2. **Transaksi Penjualan**
   - Gunakan POS interface
   - Proses pembayaran
   - Print receipt

3. **Manajemen Inventory**
   - Monitor stok
   - Transfer antar gudang
   - Handle stock adjustments

## Keamanan

### Authentication
- Laravel Sanctum untuk API authentication
- Session-based authentication untuk web
- Password hashing dengan bcrypt

### Authorization
- Role-based access control (RBAC)
- Permission-based authorization
- Multi-tenant data isolation

### Security Features
- CSRF protection
- XSS protection
- SQL injection prevention
- File upload security

## Backup dan Maintenance

### Database Backup
```bash
# Backup central database
mysqldump -u username -p pos_ezakses > backup_central.sql

# Backup tenant databases
php artisan tenants:artisan "db:backup"
```

### Log Management
- Laravel logs di `storage/logs/`
- Tenant-specific logs
- Error tracking dan monitoring

## Troubleshooting

### Common Issues

1. **Multi-tenant Connection Issues**
   - Check database configuration
   - Verify tenant domain setup
   - Check filesystem permissions

2. **Payment Gateway Errors**
   - Verify API credentials
   - Check webhook configurations
   - Monitor payment logs

3. **Performance Issues**
   - Enable caching
   - Optimize database queries
   - Check server resources

## Support

Untuk support teknis atau pertanyaan lebih lanjut, silakan hubungi tim development atau buat issue di repository sistem ini.

---

*Dokumen ini dibuat untuk membantu pengguna memahami dan mengoperasikan sistem POS.ezakses dengan efektif.*