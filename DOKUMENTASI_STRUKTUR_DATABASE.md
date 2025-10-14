# Dokumentasi Struktur Database POS.ezakses

## Ringkasan Database

Sistem POS.ezakses menggunakan arsitektur database yang kompleks dengan **123 tabel utama** dan berbagai tabel pendukung. Database ini dirancang untuk mendukung sistem multi-tenant SaaS dengan isolasi data yang ketat antar tenant.

## Arsitektur Database

### Multi-Tenant Architecture
- **Central Database**: Menyimpan data super admin, konfigurasi sistem, dan informasi tenant
- **Tenant Databases**: Database terpisah untuk setiap bisnis/pelanggan
- **Tenant Isolation**: Setiap tenant memiliki `tenant_id` untuk memastikan isolasi data

### Database Engine
- **Primary**: MySQL 9.0.1 dengan InnoDB
- **Charset**: UTF-8 MB4 (mendukung Unicode penuh)
- **Collation**: utf8mb4_unicode_ci

## Tabel Utama dan Struktur

### 1. Tabel Sistem Multi-Tenant

#### `tenants`
Menyimpan informasi tenant/bisnis
```sql
CREATE TABLE `tenants` (
  `id` varchar(255) NOT NULL,
  `store_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `data` json DEFAULT NULL
)
```

#### `domains`
Mapping domain ke tenant
```sql
CREATE TABLE `domains` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 2. Tabel Manajemen Pengguna

#### `users`
Data pengguna sistem
```sql
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL,
  `password` varchar(255) NOT NULL,
  `tenant_id` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `language` varchar(255) NOT NULL DEFAULT 'en'
)
```

#### `roles`
Role pengguna dalam sistem
```sql
CREATE TABLE `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `tenant_id` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `guard_name` varchar(255) NOT NULL DEFAULT 'web',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `permissions`
Hak akses detail untuk setiap fitur
```sql
CREATE TABLE `permissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `guard_name` varchar(255) NOT NULL DEFAULT 'web',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 3. Tabel Master Data Bisnis

#### `stores`
Informasi toko/cabang
```sql
CREATE TABLE `stores` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `tenant_id` varchar(255) DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `warehouses`
Data gudang/warehouse
```sql
CREATE TABLE `warehouses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `zip_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `product_categories`
Kategori produk
```sql
CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `products`
Data produk utama
```sql
CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `main_product_id` bigint UNSIGNED DEFAULT NULL,
  `tenant_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `product_code` varchar(255) NOT NULL,
  `barcode_symbol` int NOT NULL DEFAULT '1',
  `expiry_date` date DEFAULT NULL,
  `product_category_id` bigint UNSIGNED NOT NULL,
  `brand_id` bigint UNSIGNED NOT NULL,
  `product_cost` double NOT NULL,
  `product_price` double NOT NULL,
  `product_unit` varchar(255) NOT NULL,
  `sale_unit` varchar(255) DEFAULT NULL,
  `purchase_unit` varchar(255) DEFAULT NULL,
  `stock_alert` varchar(255) DEFAULT NULL,
  `quantity_limit` varchar(255) DEFAULT NULL,
  `order_tax` double DEFAULT NULL,
  `tax_type` enum('1','2') DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `brands`
Merek produk
```sql
CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` longtext,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 4. Tabel Transaksi Penjualan

#### `sales`
Data penjualan
```sql
CREATE TABLE `sales` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `is_return` tinyint(1) NOT NULL DEFAULT '0',
  `customer_id` bigint UNSIGNED NOT NULL,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `tax_rate` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `discount_type` int NOT NULL DEFAULT '2',
  `discount_value` int NOT NULL DEFAULT '0',
  `shipping` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `received_amount` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  `payment_type` bigint UNSIGNED DEFAULT NULL,
  `note` text,
  `reference_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `status` int DEFAULT NULL,
  `payment_status` int DEFAULT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL
)
```

#### `sale_items`
Item-item dalam penjualan
```sql
CREATE TABLE `sale_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `product_price` double DEFAULT NULL,
  `net_unit_price` double DEFAULT NULL,
  `tax_type` int NOT NULL,
  `tax_value` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount_type` int NOT NULL,
  `discount_value` double DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `sale_unit` int NOT NULL,
  `quantity` double DEFAULT NULL,
  `sub_total` double DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `sales_return`
Retur penjualan
```sql
CREATE TABLE `sales_return` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `sale_id` bigint UNSIGNED DEFAULT NULL,
  `customer_id` bigint UNSIGNED NOT NULL,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `tax_rate` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `shipping` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  `payment_type` bigint UNSIGNED DEFAULT NULL,
  `payment_status` int DEFAULT NULL,
  `note` text,
  `reference_code` varchar(255) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 5. Tabel Transaksi Pembelian

#### `purchases`
Data pembelian
```sql
CREATE TABLE `purchases` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `tax_rate` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `shipping` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `received_amount` double DEFAULT NULL,
  `paid_amount` double DEFAULT NULL,
  `partial_amount` double DEFAULT NULL,
  `payment_type` bigint UNSIGNED DEFAULT NULL,
  `payment_status` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `notes` text,
  `reference_code` varchar(255) DEFAULT NULL,
  `is_return` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `purchase_items`
Item-item dalam pembelian
```sql
CREATE TABLE `purchase_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `product_cost` double DEFAULT NULL,
  `net_unit_cost` double DEFAULT NULL,
  `tax_type` int NOT NULL,
  `tax_value` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount_type` int NOT NULL,
  `discount_value` double DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `purchase_unit` int NOT NULL,
  `quantity` double DEFAULT NULL,
  `sub_total` double DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 6. Tabel Manajemen Inventory

#### `manage_stocks`
Stok per gudang per produk
```sql
CREATE TABLE `manage_stocks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` double NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `alert` tinyint(1) NOT NULL DEFAULT '0'
)
```

#### `adjustments`
Penyesuaian stok
```sql
CREATE TABLE `adjustments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `reference_code` varchar(255) DEFAULT NULL,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `total_products` int DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `transfers`
Transfer stok antar gudang
```sql
CREATE TABLE `transfers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `from_warehouse_id` bigint UNSIGNED NOT NULL,
  `to_warehouse_id` bigint UNSIGNED NOT NULL,
  `tax_rate` double DEFAULT NULL,
  `tax_amount` double DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `shipping` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `status` int DEFAULT NULL,
  `note` text,
  `reference_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 7. Tabel Keuangan

#### `expenses`
Pengeluaran/pengeluaran
```sql
CREATE TABLE `expenses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `warehouse_id` bigint UNSIGNED NOT NULL,
  `expense_category_id` bigint UNSIGNED NOT NULL,
  `amount` double NOT NULL,
  `reference_code` varchar(255) DEFAULT NULL,
  `details` text,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL,
  `title` varchar(255) DEFAULT NULL
)
```

#### `expense_categories`
Kategori pengeluaran
```sql
CREATE TABLE `expense_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `sales_payments`
Pembayaran penjualan
```sql
CREATE TABLE `sales_payments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` bigint UNSIGNED NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `payment_date` date NOT NULL,
  `payment_type` bigint UNSIGNED DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `received_amount` double DEFAULT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

### 8. Tabel Sistem

#### `settings`
Konfigurasi sistem per tenant
```sql
CREATE TABLE `settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `value` text,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `currencies`
Mata uang yang didukung
```sql
CREATE TABLE `currencies` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `symbol` varchar(255) NOT NULL,
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

#### `payment_methods`
Metode pembayaran
```sql
CREATE TABLE `payment_methods` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenant_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

## Relasi Antar Tabel (Foreign Keys)

### User Management
- `users.tenant_id` → `tenants.id`
- `users.id` → `model_has_roles.model_id`
- `roles.id` → `model_has_roles.role_id`
- `permissions.id` → `model_has_permissions.permission_id`

### Business Structure
- `stores.tenant_id` → `tenants.id`
- `stores.user_id` → `users.id`
- `warehouses.tenant_id` → `tenants.id`

### Product Management
- `products.tenant_id` → `tenants.id`
- `products.product_category_id` → `product_categories.id`
- `products.brand_id` → `brands.id`
- `products.main_product_id` → `main_products.id`

### Transaction Relations
- `sales.customer_id` → `customers.id`
- `sales.warehouse_id` → `warehouses.id`
- `sales.payment_type` → `payment_methods.id`
- `sales.user_id` → `users.id`
- `sale_items.sale_id` → `sales.id`
- `sale_items.product_id` → `products.id`

### Inventory Management
- `manage_stocks.warehouse_id` → `warehouses.id`
- `manage_stocks.product_id` → `products.id`
- `adjustments.warehouse_id` → `warehouses.id`
- `adjustment_items.adjustment_id` → `adjustments.id`
- `adjustment_items.product_id` → `products.id`

### Financial Relations
- `expenses.warehouse_id` → `warehouses.id`
- `expenses.expense_category_id` → `expense_categories.id`
- `expenses.user_id` → `users.id`
- `sales_payments.sale_id` → `sales.id`
- `sales_payments.payment_type` → `payment_methods.id`

## Tabel Referensi Sistem

### Countries & States
- **246 negara** dengan informasi lengkap
- **4,122 state/province** yang mapped ke negara
- Data meliputi nama, kode negara, kode telepon

### Base Units
- **3 satuan dasar**: piece, meter, kilogram
- Dapat dikembangkan untuk satuan lainnya

### Languages
- **9 bahasa** yang didukung:
  - English (en)
  - Chinese (cn)
  - French (fr)
  - German (gr)
  - Spanish (sp)
  - Turkish (tr)
  - Arabic (ar)
  - Vietnamese (vi)
  - Indonesian (id)

## Sistem Multi-Bahasa

### Struktur Multi-Bahasa
1. **Backend**: File PHP di direktori `lang/`
2. **Frontend**: File JSON di `resources/pos/src/locales/`
3. **Database**: Field `language` di tabel `users`

### Tabel Bahasa
```sql
CREATE TABLE `languages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `iso_code` varchar(191) NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL,
  `updated_at` timestamp NULL
)
```

## Sistem Permissions

### Role-Based Access Control (RBAC)
Sistem memiliki **111 permission** yang berbeda untuk mengatur akses pengguna:

#### Kategori Permission:
- **Management**: manage_* (permissions untuk admin)
- **CRUD Operations**: create_*, edit_*, view_*, delete_*
- **Special Functions**: view_pos_screen, edit_setting, dll

#### Contoh Permissions:
- `manage_products` - Kelola produk
- `create_sale` - Buat penjualan
- `view_reports` - Lihat laporan
- `manage_users` - Kelola pengguna
- `edit_settings` - Edit pengaturan

## Optimasi Database

### Indexes yang Digunakan
1. **Primary Keys**: Auto-increment ID pada setiap tabel
2. **Foreign Keys**: Index pada semua field yang mereferensi tabel lain
3. **Unique Constraints**: Email, kode produk, nama tenant, dll
4. **Performance Indexes**: Pada field yang sering di-query

### Constraints
- **Foreign Key Constraints**: CASCADE, SET NULL, RESTRICT
- **Data Integrity**: UNIQUE constraints pada field penting
- **Referential Integrity**: Memastikan konsistensi data antar tabel

## Sistem Backup & Recovery

### Strategi Backup
1. **Central Database**: Backup terpisah untuk konfigurasi sistem
2. **Tenant Databases**: Backup individual per tenant
3. **Media Files**: Backup gambar dan file upload
4. **Log Files**: Backup log sistem untuk audit trail

### Maintenance Tasks
- **Auto-cleanup**: Pembersihan data temporary
- **Log rotation**: Rotasi log files
- **Index optimization**: Optimasi index berkala
- **Statistics update**: Update statistics MySQL

## Keamanan Database

### Security Features
1. **Tenant Isolation**: Data terpisah per tenant
2. **Password Hashing**: bcrypt untuk password pengguna
3. **SQL Injection Prevention**: Prepared statements
4. **XSS Protection**: Input sanitization
5. **CSRF Protection**: Token-based CSRF protection

### Audit Trail
- **User Activities**: Dilacak melalui relationship dengan user_id
- **Transaction Logs**: Riwayat perubahan data
- **Access Logs**: Log akses sistem

## Kesimpulan

Struktur database POS.ezakses dirancang dengan sangat baik untuk:
- ✅ **Scalability**: Mendukung pertumbuhan bisnis
- ✅ **Security**: Isolasi data multi-tenant
- ✅ **Performance**: Index dan query optimization
- ✅ **Flexibility**: Mendukung berbagai jenis bisnis
- ✅ **Maintainability**: Struktur yang terorganisir dan terdokumentasi

Database ini mampu menangani kompleksitas operasional POS modern dengan fitur-fitur enterprise seperti multi-warehouse, multi-currency, multi-language, dan comprehensive reporting.