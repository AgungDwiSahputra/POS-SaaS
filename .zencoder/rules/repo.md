# Dokumentasi Sistem POS.ezakses

## Deskripsi Proyek

**POS.ezakses** adalah sistem Point of Sale (POS) komprehensif yang dibangun dengan Laravel 10.23 dan React 17.0.2. Sistem ini dirancang untuk bisnis ritel, gudang, dan operasi multi-toko dengan kemampuan manajemen inventori lengkap, pelacakan penjualan, manajemen pembelian, pelaporan keuangan, dan otomasi bisnis canggih.

### Versi Sistem
- **Versi Saat Ini**: 1.2.1
- **Framework Backend**: Laravel 10.23
- **Framework Frontend**: React 17.0.2
- **PHP Version**: 8.1+
- **Database**: MySQL 5.7+/PostgreSQL 10+/SQLite

## Arsitektur Sistem

### Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Web                              │
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
│  │    Database     │  │     Layanan Eksternal               │  │
│  │                 │  │                                     │  │
│  │  - MySQL/Postgre│  │  - Payment Gateways                 │  │
│  │  - Migrations   │  │  - SMS Services                     │  │
│  │  - Seeders      │  │  - Email Services                   │  │
│  │  - Models       │  │  - File Storage (AWS S3)            │  │
│  └─────────────────┘  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Struktur Aplikasi

#### Backend (Laravel)
```
app/
├── Console/           # Perintah Artisan
├── Http/Controllers/  # Controller API dan Web
├── Models/           # Model Eloquent (50+ models)
├── Repositories/     # Implementasi Repository Pattern
├── Services/         # Business Logic Services
├── Filters/          # Query Filters
├── Exports/          # Class Export Excel
├── Imports/          # Class Import Excel
└── Traits/           # Reusable Model Traits (Multitenantable, etc.)
```

#### Frontend (React)
```
resources/pos/src/
├── components/       # Komponen React
│   ├── auth/         # Komponen Authentication
│   ├── dashboard/    # Widget Dashboard
│   ├── products/     # Manajemen Produk
│   ├── sales/        # Manajemen Penjualan
│   ├── purchases/    # Manajemen Pembelian
│   └── reports/      # Komponen Reporting
├── store/           # Redux Store
│   ├── actions/     # Redux Actions
│   └── reducers/    # Redux Reducers
├── locales/         # File Terjemahan
├── constants/       # Konstanta Aplikasi
└── routes.js        # Frontend Routes
```

## Fitur Utama Sistem

### 1. Manajemen Penjualan
- **POS Screen**: Interface sentuh untuk penjualan cepat
- **Proses Penjualan**: Alur penjualan lengkap dengan pemrosesan pembayaran
- **Hold Sales**: Kemampuan menahan dan melanjutkan penjualan
- **Sale Returns**: Proses retur dan refund
- **Payment Management**: Metode pembayaran multiple dan pelacakan
- **Receipt Generation**: Struk PDF dengan template yang dapat dikustomisasi

### 2. Manajemen Inventori
- **Product Management**: Buat, edit, dan kelola produk dengan variasi
- **Stock Tracking**: Pemantauan level stok real-time
- **Stock Adjustments**: Penyesuaian stok manual untuk diskrepansi
- **Stock Transfers**: Transfer stok antar gudang
- **Low Stock Alerts**: Peringatan otomatis untuk stok rendah
- **Barcode Generation**: Generate dan cetak barcode

### 3. Manajemen Pembelian
- **Purchase Orders**: Buat dan kelola purchase order
- **Supplier Management**: Maintain informasi dan riwayat supplier
- **Purchase Returns**: Handle retur ke supplier
- **Cost Tracking**: Track biaya pembelian dan margin keuntungan

### 4. Manajemen Pelanggan
- **Customer Database**: Simpan informasi dan riwayat pelanggan
- **Customer Groups**: Kategorikan pelanggan untuk pemasaran bertarget
- **Payment History**: Track pembayaran pelanggan dan saldo outstanding
- **Customer Reports**: Generate laporan spesifik pelanggan

### 5. Manajemen Keuangan
- **Cash Advance System**: Kelola cash advance ke karyawan
- **Expense Tracking**: Track pengeluaran bisnis berdasarkan kategori
- **Profit & Loss Reports**: Pelaporan keuangan komprehensif
- **Tax Management**: Konfigurasi dan track pajak

### 6. Fitur Canggih
- **Multi-warehouse Support**: Kelola multiple gudang/lokasi
- **Quotation System**: Buat dan kelola price quotation
- **Coupon System**: Buat diskon coupon dan promosi
- **SMS Integration**: Kirim notifikasi SMS
- **Email Templates**: Template email yang dapat dikustomisasi
- **Multi-language Support**: Dukungan 9 bahasa
- **Product Variations**: Variasi produk multiple (ukuran, warna, dll.)
- **Digital Products**: Dukungan produk digital yang dapat didownload dengan cost tracking
- **Sale & Purchase Returns**: Sistem return lengkap
- **Multi-currency Support**: Dukungan multiple currency dengan konversi otomatis
- **Inventory Alerts**: Pemantauan inventori otomatis
- **Customer Loyalty**: Program loyalitas pelanggan
- **Backup & Restore**: Kemampuan backup dan restore otomatis
- **API Integrations**: Integrasi sistem pihak ketiga

## Teknologi Stack

### Backend Technologies
- **Framework**: Laravel 10.23
- **PHP Version**: PHP 8.1+
- **Database**: MySQL 5.7+/PostgreSQL 10+/SQLite
- **Authentication**: Laravel Sanctum dengan API tokens
- **Authorization**: Spatie Laravel Permission dengan kontrol granular
- **Multi-tenancy**: Stancl/Tenancy untuk dukungan multi-store
- **File Storage**: AWS S3 integration dengan local fallback
- **Payment Processing**: Stripe, PayPal, Razorpay, Paystack dengan webhook
- **Barcode Generation**: Picqer PHP Barcode Generator
- **PDF Generation**: DomPDF dengan custom templates
- **Excel Processing**: Laravel Excel untuk import/export
- **Email Services**: SMTP, Mailgun, SendGrid support
- **Queue Management**: Laravel Queue dengan dukungan Redis

### Frontend Technologies
- **Framework**: React 17.0.2
- **State Management**: Redux dengan Redux Thunk dan Redux Persist
- **Styling**: Bootstrap 5.1.3, Custom SCSS, dukungan RTL
- **Charts**: Chart.js, ECharts untuk analytics canggih
- **Internationalization**: React Intl dengan dukungan 9 bahasa
- **Build Tool**: Laravel Mix, Webpack 5
- **UI Components**: React Bootstrap, Custom components, FontAwesome icons
- **Additional Libraries**: React Router, Axios, Moment.js, React Toastify

### Development Tools
- **Package Manager**: Composer (PHP), NPM (Node.js)
- **Code Quality**: ESLint, Prettier
- **Testing**: PHPUnit, Jest
- **Version Control**: Git

### External Integrations
- **Payment Gateways**: Stripe, PayPal, Razorpay, Paystack
- **SMS Services**: Provider SMS yang dapat dikonfigurasi
- **Email Services**: SMTP, Mailgun, SendGrid support
- **Cloud Storage**: AWS S3, Local storage

## Model Database Utama

### User Management
- **User**: Model user utama dengan authentication
- **Role**: Role user dengan permissions
- **Permission**: Sistem permissions granular

### Product Management
- **Product**: Model produk utama
- **DigitalProduct**: Model produk digital dengan cost tracking
- **ProductCategory**: Kategorisasi produk
- **Brand**: Brand produk
- **Unit**: Unit pengukuran produk
- **Variation**: Variasi produk (ukuran, warna, dll.)
- **Warehouse**: Manajemen gudang

### Sales Management
- **Sale**: Transaksi penjualan
- **SaleItem**: Item individual dalam penjualan
- **SalesPayment**: Record pembayaran untuk penjualan
- **Hold**: Penjualan yang ditahan untuk penyelesaian nanti
- **Quotation**: Price quotation

### Purchase Management
- **Purchase**: Transaksi pembelian
- **PurchaseItem**: Item dalam pembelian
- **Supplier**: Informasi supplier

### Customer Management
- **Customer**: Database pelanggan

### Financial Management
- **Expense**: Pengeluaran bisnis
- **ExpenseCategory**: Kategorisasi pengeluaran
- **CashAdvance**: Sistem cash advance
- **Taxe**: Konfigurasi pajak

### Inventory Management
- **Adjustment**: Penyesuaian stok
- **Transfer**: Transfer stok antar gudang
- **ManageStock**: Manajemen level stok

### Reporting & Communication
- **MailTemplate**: Template email
- **SmsTemplate**: Template SMS
- **SmsSetting**: Konfigurasi SMS

## Services Utama

### ProductSyncService
Service untuk sinkronisasi produk antar tenant dalam sistem multi-tenancy.

### ReportStockService
Service untuk menghasilkan laporan stok dengan filtering canggih.

### TransferLockService
Service untuk mengelola locking mechanism saat transfer produk antar gudang untuk mencegah konflik konkurensi.

## Komponen Frontend Utama

### Dashboard Components
- **AdminDashboard**: Dashboard untuk admin
- **DashboardChart**: Chart analitik dashboard
- **RecentSale**: Penjualan terbaru
- **StockAlert**: Peringatan stok
- **TopSellingProduct**: Produk terlaris

### Sales Components
- **POS Screen**: Interface POS utama
- **Sales Management**: Kelola penjualan
- **SaleReturn**: Kelola retur penjualan

### Inventory Components
- **Product Management**: Kelola produk
- **Digital Product Management**: Kelola produk digital dengan cost tracking
- **Stock Adjustments**: Penyesuaian stok
- **Stock Transfers**: Transfer stok

### Purchase Components
- **Purchase Orders**: Kelola purchase order
- **Supplier Management**: Kelola supplier
- **Purchase Returns**: Kelola retur pembelian

### Reporting Components
- **Sale Reports**: Laporan penjualan
- **Purchase Reports**: Laporan pembelian
- **Stock Reports**: Laporan stok
- **Financial Reports**: Laporan keuangan

## API Endpoints Utama

### Authentication
- `POST /api/login` - Login user
- `POST /api/register` - Registrasi user
- `POST /api/logout` - Logout user

### Product Management
- `GET /api/products` - List produk
- `POST /api/products` - Buat produk baru
- `PUT /api/products/{id}` - Update produk
- `DELETE /api/products/{id}` - Hapus produk
- `GET /api/digital-products` - List produk digital
- `POST /api/digital-products` - Buat produk digital baru
- `PUT /api/digital-products/{id}` - Update produk digital
- `DELETE /api/digital-products/{id}` - Hapus produk digital

### Sales Management
- `GET /api/sales` - List penjualan
- `POST /api/sales` - Buat penjualan baru
- `PUT /api/sales/{id}` - Update penjualan
- `DELETE /api/sales/{id}` - Hapus penjualan

### Purchase Management
- `GET /api/purchases` - List pembelian
- `POST /api/purchases` - Buat pembelian baru
- `PUT /api/purchases/{id}` - Update pembelian
- `DELETE /api/purchases/{id}` - Hapus pembelian

### Dashboard & Analytics
- `GET /api/today-sales-purchases-count` - Statistik hari ini
- `GET /api/top-selling-products` - Produk terlaris
- `GET /api/recent-sales` - Penjualan terbaru

## Multi-tenancy & Multi-store

Sistem ini menggunakan **Stancl/Tenancy** untuk mendukung multi-tenancy dengan database terpisah per tenant/store.

### Fitur Multi-tenancy
- Database terpisah per tenant
- Domain management per tenant
- User isolation per tenant
- Shared application code

### Traits Utama
- **Multitenantable**: Auto-assign tenant_id dan global scope untuk multi-tenancy
- **HasJsonResourcefulData**: JSON API resource formatting
- **BelongsToTenant**: Stancl tenancy integration

### Manajemen Tenant
- `php artisan tenants:create` - Buat tenant baru
- `php artisan tenants:migrate` - Jalankan migration untuk semua tenant
- `php artisan tenants:list` - List semua tenant

## Payment Gateway Integration

### Supported Gateways
1. **Stripe** - Payment processing global
2. **PayPal** - Payment processing internasional
3. **Razorpay** - Payment processing India
4. **Paystack** - Payment processing Afrika

### Webhook Support
Semua gateway mendukung webhook untuk notifikasi real-time pembayaran.

## Internationalization (i18n)

### Bahasa yang Didukung
1. **English** (en) - Bahasa utama
2. **Arabic** (ar) - Dukungan RTL
3. **Chinese** (cn) - Chinese Simplified
4. **French** (fr) - Bahasa Prancis lengkap
5. **German** (gr) - Dukungan bahasa Jerman
6. **Indonesian** (id) - Bahasa Indonesia
7. **Spanish** (sp) - Bahasa Spanyol
8. **Turkish** (tr) - Dukungan bahasa Turki
9. **Vietnamese** (vi) - Bahasa Vietnam

## Security Features

### Authentication & Authorization
- Laravel Sanctum untuk API authentication
- Spatie Laravel Permission untuk role-based access control
- JWT tokens untuk API access
- Password hashing dengan bcrypt

### Data Protection
- Input validation dan sanitization
- SQL injection prevention melalui Eloquent ORM
- XSS protection di frontend
- CSRF protection

### File Security
- Secure file upload dengan validasi
- File type restrictions
- Storage permissions yang ketat

## Performance Optimization

### Caching Strategy
- Redis untuk session dan cache
- Database query caching
- View caching
- Configuration caching

### Database Optimization
- Indexing pada kolom yang sering di-query
- Eager loading untuk mengurangi N+1 queries
- Query optimization dengan raw SQL untuk laporan kompleks
- Database connection pooling

### Frontend Optimization
- Code splitting dengan React.lazy()
- Image optimization dan lazy loading
- Bundle optimization dengan Webpack
- CDN untuk static assets

## Testing & Quality Assurance

### Backend Testing
- **PHPUnit** untuk unit testing
- Feature testing untuk API endpoints
- Database testing dengan refresh database

### Frontend Testing
- **Jest** untuk unit testing React components
- React Testing Library untuk component testing
- E2E testing dengan Cypress (jika diperlukan)

## Deployment & DevOps

### Environment Setup
- Environment-based configuration (.env files)
- Docker support dengan Laravel Sail
- Production optimization scripts

### Monitoring & Logging
- Laravel logging system
- Error tracking dengan Sentry (optional)
- Performance monitoring
- Database query logging

### Backup Strategy
- Automated database backups
- File system backups
- Cloud storage integration (AWS S3)
- Point-in-time recovery

## Development Guidelines

### Code Standards
- PSR-12 untuk PHP code style
- ESLint untuk JavaScript/React
- Prettier untuk code formatting
- Git hooks untuk pre-commit checks

### Git Workflow
- Feature branch development
- Pull request reviews
- Semantic versioning
- Automated testing pada CI/CD

### Documentation
- API documentation dengan Laravel API Resource
- Code documentation dengan PHPDoc
- User guides dan installation manuals
- Changelog untuk setiap release

## Recent Bug Fixes & Patches

### Digital Products Tenant Scoping Fix (v1.2.1)
**Issue**: Digital products tidak muncul di list karena tenant_id mismatch saat create.

**Root Cause**: Frontend mengirim tenant_id secara manual melalui `getCurrentUser()`, tapi function tersebut tidak mengembalikan tenant_id yang benar dari localStorage.

**Solution Implemented**:
- ❌ **Removed**: Manual tenant_id sending from `DigitalProductForm.js`
- ✅ **Added**: Backend auto-assigns tenant_id via `Multitenantable` trait
- ✅ **Fixed**: Tenant scoping now works correctly for all CRUD operations

**Files Modified**:
- `resources/pos/src/components/digital-product/DigitalProductForm.js` - Removed manual tenant_id logic
- `app/Traits/Multitenantable.php` - Confirmed auto-assignment works
- Database cleanup: Removed orphaned products from wrong tenant

**Impact**: Digital products now properly scoped to correct tenant, cost field displays correctly.

## Troubleshooting Umum

### Installation Issues
- **Composer install fails**: Clear composer cache dan update composer
- **NPM install fails**: Clear npm cache dan reinstall node_modules
- **Database connection error**: Check credentials dan pastikan database server running

### Multi-tenancy Issues
- **Products not showing**: Check tenant scoping, ensure user is in correct tenant
- **Digital products missing**: Verify `Multitenantable` trait is applied to model
- **Tenant data mismatch**: Check `tenant_id` assignment in create operations

### Performance Issues
- **Slow loading**: Enable caching, optimize queries, check server resources
- **Memory issues**: Increase PHP memory limit, optimize large datasets
- **Database slow queries**: Add indexes, optimize query structure

### Payment Issues
- **Gateway not working**: Check credentials, verify webhook URLs
- **Payment failures**: Check gateway dashboard untuk error details

## Support & Maintenance

### Regular Maintenance Tasks
- Update dependencies secara berkala
- Monitor error logs
- Backup verification
- Security updates
- Performance monitoring

### Support Channels
- GitHub Issues untuk bug reports
- Documentation updates
- Community forums
- Professional support (premium)

## Roadmap & Future Features

### Planned Features
- Mobile app development
- Advanced analytics dengan AI/ML
- IoT device integration
- Advanced loyalty program
- Multi-channel selling
- Advanced reporting dengan custom dashboards

---

*Dokumentasi ini dibuat untuk memberikan pemahaman komprehensif tentang sistem POS.ezakses kepada developer. Untuk informasi lebih detail, silakan lihat file dokumentasi spesifik di folder `docs/`.*