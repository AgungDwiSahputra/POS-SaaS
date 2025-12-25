# Dokumentasi Handover - POS.ezakses

## Daftar Isi
1. [Overview Sistem](#overview-sistem)
2. [Arsitektur Aplikasi](#arsitektur-aplikasi)
3. [Fitur-Fitur Utama](#fitur-fitur-utama)
4. [API Documentation](#api-documentation)
5. [Deployment Guide](#deployment-guide)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview Sistem

POS.ezakses adalah sistem Point of Sale (POS) komprehensif yang dibangun dengan Laravel (backend) dan React (frontend), dirancang untuk bisnis ritel, gudang, dan operasi multi-toko.

### Teknologi Stack
- **Backend**: Laravel 10.23, PHP 8.1+
- **Frontend**: React 17.0.2, Bootstrap 5.1.3
- **Database**: MySQL 5.7+/PostgreSQL 10+/SQLite
- **Payment Gateway**: Stripe, PayPal, Razorpay, Paystack
- **File Storage**: AWS S3 (opsional)
- **Cache**: Redis (opsional)

### Fitur Utama
- 🏪 Multi-Store Management (Multi-tenancy)
- 🌍 Multi-Language Support (9 bahasa)
- 💰 Multi-Currency Support
- 🔐 Role-Based Access Control (RBAC)
- 💳 Payment Gateway Integration
- 📊 Advanced Reporting & Analytics
- 📱 Responsive Design
- 🔄 Real-time Updates
- 📋 Barcode Generation & Printing (10+ paper sizes including custom 105x120mm)
- 💰 Cash Advance Management
- 🏷️ Coupon System
- 📱 SMS Integration
- 📧 Email Templates
- 🔄 Product Variations
- 📦 Digital Products
- 🏢 Provider Management
- 📝 Quotation System
- ↩️ Sale & Purchase Returns
- 💸 Expense Management
- 💼 POS Registers

---

## Arsitektur Aplikasi

### Struktur Backend (Laravel)
```
app/
├── Console/Commands/          # Artisan commands
├── Http/Controllers/          # API Controllers
│   ├── API/                   # REST API controllers
│   └── Sadmin/               # Super admin controllers
├── Models/                    # Eloquent models
├── Services/                  # Business logic services
├── Repositories/              # Data access layer
├── Exports/                   # Excel/PDF export classes
├── Imports/                   # Data import classes
├── Mail/                      # Email templates
├── Notifications/             # Push notifications
└── Traits/                    # Reusable model traits
```

### Struktur Frontend (React)
```
resources/pos/src/
├── components/                # React components
│   ├── admin/                # Admin panels
│   ├── auth/                 # Authentication
│   ├── dashboard/            # Dashboard widgets
│   ├── product/              # Product management
│   ├── sales/                # Sales management
│   ├── purchase/             # Purchase management
│   ├── report/               # Reports & analytics
│   └── settings/             # System settings
├── routes.js                 # Route definitions
├── App.js                    # Main app component
├── index.js                  # App entry point
└── shared/                   # Shared utilities
```

### Multi-Tenancy Architecture
- **Database per Tenant**: Setiap store memiliki database terpisah
- **Middleware**: `MultiTenantMiddleware` menangani routing database
- **Tenant Identification**: Berdasarkan subdomain atau parameter URL
- **Shared Resources**: Beberapa tabel seperti `countries`, `languages` dibagikan

---

## Fitur-Fitur Utama

### 1. Dashboard & Analytics
**Lokasi**: `resources/pos/src/components/dashboard/`

**Komponen Utama**:
- `Dashboard.js` - Main dashboard layout dengan komponen:
  - `TodaySalePurchaseCount.js` - Metrik penjualan/pembelian harian
  - `ThisWeekSalePurchaseChart.js` - Chart penjualan minggu ini
  - `TopSellingProduct.js` - Produk terlaris
  - `RecentSale.js` - Penjualan terbaru (hanya untuk user dengan permission MANAGE_SALE)
  - `StockAlert.js` - Alert stok rendah

**Fungsi**:
- **Real-time Metrics**: Total penjualan, pembelian, profit harian
- **Chart Analytics**: Trend penjualan mingguan dengan Chart.js
- **Top Products**: 5 produk terlaris berdasarkan quantity terjual
- **Recent Transactions**: 5 transaksi penjualan terakhir
- **Stock Alerts**: Produk dengan stok di bawah minimum level
- **Permission-based Display**: Komponen RecentSale hanya tampil untuk user dengan permission

**API Endpoint**:
- `GET /api/dashboard` - Mengambil semua data dashboard
- Response includes: sales count, purchase count, total profit, top products, recent sales, stock alerts

**Data Flow**:
1. Component mount → dispatch `fetchDashboardData()`
2. Redux saga → call DashboardAPIController
3. Data stored in Redux state (dashboard reducer)
4. Components render data dari Redux state

**Key Features**:
- Responsive design dengan Bootstrap grid
- Real-time updates setiap kali dashboard diakses
- Currency formatting berdasarkan pengaturan sistem
- Loading states dengan TopProgressBar
- Error handling untuk API failures

### 2. Manajemen Produk
**Lokasi**: `resources/pos/src/components/product/`

**Komponen Utama**:
- `Product.js` - Halaman listing produk utama dengan fitur:
  - Filter berdasarkan warehouse
  - Import/Export Excel
  - Pencarian dan sorting
  - Lightbox untuk gambar produk
  - Action buttons (View, Edit, Delete) berdasarkan permission
- `CreateProduct.js` - Form pembuatan produk baru
- `EditProduct.js` - Form edit produk
- `ProductDetail.js` - Halaman detail produk
- `ProductForm.js` - Komponen form reusable
- `DeleteMainProduct.js` - Modal konfirmasi hapus
- `ImportProductModel.js` - Modal import produk
- `ProductImageLightBox.js` - Lightbox viewer gambar

**Fitur Lengkap**:

#### Product Listing (`Product.js`)
- **Warehouse Filter**: Dropdown untuk filter produk berdasarkan warehouse
- **Data Table**: Menggunakan ReactDataTable dengan kolom:
  - Product Image (dengan lightbox viewer)
  - Product Name (sortable)
  - Product Code (badge styling)
  - Brand Name
  - Price Range (min-max dengan currency formatting)
  - Product Unit (badge)
  - Stock Quantity (dengan warehouse filtering)
  - Created Date & Time
  - Action Buttons

- **Advanced Filtering**: Unit filter, category filter, brand filter
- **Import/Export**: Excel import dengan template, export berdasarkan warehouse
- **Permission-based UI**: Button visibility berdasarkan user permissions

#### Product CRUD Operations
- **Create Product**: Form dengan validasi untuk semua field
- **Edit Product**: Pre-populated form dengan data existing
- **Delete Product**: Soft delete dengan konfirmasi modal
- **Product Details**: Read-only view dengan semua informasi produk

#### Product Features
- **Multiple Images**: Upload multiple product images dengan drag-drop
- **Variations**: Support untuk product variations (size, color, etc.)
- **Barcode Generation**: Auto-generate barcode untuk produk
- **Stock Management**: Multi-warehouse stock tracking
- **Category & Brand**: Hierarchical categories dan brand assignment
- **Pricing**: Support untuk price ranges (min-max)

#### Technical Implementation
- **State Management**: Redux untuk products, warehouses, settings
- **API Integration**: RESTful API dengan pagination dan filtering
- **Image Handling**: File upload dengan preview dan lightbox
- **Currency Formatting**: Dynamic currency symbol dari system settings
- **Responsive Design**: Mobile-friendly dengan Bootstrap grid
- **Loading States**: Progress bars dan skeleton loaders

**API Endpoints**:
- `GET /api/products` - List products (dengan pagination, filters, sorting)
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `POST /api/products/import` - Import products dari Excel
- `GET /api/products/export` - Export products ke Excel

**Database Relations**:
- Products ↔ Categories (many-to-one)
- Products ↔ Brands (many-to-one)
- Products ↔ ProductVariations (one-to-many)
- Products ↔ ProductImages (one-to-many)
- Products ↔ Warehouses (many-to-many untuk stock)

**Key Business Logic**:
- Stock calculation berdasarkan warehouse selection
- Price range display untuk products dengan variations
- Permission checks untuk semua CRUD operations
- Image optimization dan thumbnail generation

### 2.1. Print Barcode
**Lokasi**: `resources/pos/src/components/printBarcode/`

**Komponen**:
- `PrintBarcode.js` - Halaman utama print barcode dengan form configuration
- `PrintButton.js` - Komponen untuk rendering barcode labels
- `BarcodeShow.js` - Preview tampilan barcode sebelum print
- `PrintTable.js` - Tabel list produk yang akan dicetak barcode-nya

**Fitur Lengkap**:

#### Paper Size Options
Sistem mendukung berbagai ukuran kertas untuk barcode:
1. **40 per sheet (A4)** - 1.799" × 1.003" (45.7mm × 25.5mm)
2. **30 per sheet** - 2.625" × 1" (66.7mm × 25.4mm)
3. **24 per sheet (A4)** - 2.48" × 1.334" (63mm × 33.9mm)
4. **20 per sheet** - 4" × 1" (101.6mm × 25.4mm)
5. **18 per sheet (A4)** - 2.5" × 1.835" (63.5mm × 46.6mm)
6. **14 per sheet** - 4" × 1.33" (101.6mm × 33.8mm)
7. **12 per sheet (A4)** - 2.5" × 2.834" (63.5mm × 72mm)
8. **10 per sheet** - 4" × 2" (101.6mm × 50.8mm)
9. **Custom 105x120mm** - 6 per sheet, 33mm × 33mm per label *(NEW)*
10. **Custom size** - Ukuran kustom yang dapat dikonfigurasi

#### Custom 105x120mm Paper Size
Paper size baru yang ditambahkan untuk kebutuhan khusus:
- **Ukuran kertas**: 105mm × 120mm
- **Layout**: 3 kolom × 2 baris = 6 labels per sheet
- **Ukuran label**: 33mm × 33mm per label
- **Gap**: 3mm antar labels (horizontal dan vertical)
- **Font size**: 7-8px untuk teks yang compact
- **Barcode image**: Max 22mm lebar, 16px tinggi

**CSS Implementation**:
- Class: `.barcode-paper-105x120`
- Print media query: `@page { size: 105mm 120mm portrait; }`
- RTL support: `.rtl.css` untuk Arabic/Hebrew layouts

#### Barcode Printing Options
- **Show Company Name**: Toggle nama perusahaan pada barcode
- **Show Product Name**: Toggle nama produk pada barcode
- **Show Price**: Toggle harga pada barcode
- **Quantity Control**: Atur jumlah barcode per produk

#### Custom Barcode Mode
Mode untuk membuat barcode tanpa produk yang ada:
- **Product Code/SKU**: Input custom code untuk barcode
- **Product Name**: Nama custom untuk label
- **Price**: Harga custom (opsional)
- **Quantity**: Jumlah barcode yang ingin dicetak

#### Custom Paper Size Configuration
Untuk paper size "Custom", user dapat mengatur:
- **Label Width** (mm) - Lebar setiap label
- **Label Height** (mm) - Tinggi setiap label
- **Page Width** (mm) - Lebar halaman kertas
- **Horizontal Gap** (mm) - Jarak antar kolom
- **Vertical Gap** (mm) - Jarak antar baris
- **Padding** (mm) - Padding dalam setiap label

**Technical Implementation**:
```javascript
// Layout configuration structure
const layout = {
    labelWidthIn: 1.799,      // Label width in inches
    labelHeightIn: 1.003,     // Label height in inches
    pageWidthIn: 8.27,        // Page width in inches
    columnGapIn: 0.1,         // Horizontal gap in inches
    rowGapIn: 0.1,            // Vertical gap in inches
    paddingIn: 0.04,          // Padding in inches
    pageHeightIn: 11.69,      // Page height (A4) - optional
    bottomMarginIn: 0.591     // Bottom margin - optional
};

// mm to inches conversion
const mmToInches = (value) => value / 25.4;
```

**CSS Print Styles**:
```css
/* Screen preview */
.barcode-main.barcode-paper-105x120 {
    width: calc((105mm - 6mm) / 3);
    height: calc((51mm - 18mm - 3mm) / 2);
    border: 1px dashed #666;
}

/* Print media */
@media print {
    @page {
        size: 105mm 120mm portrait;
        margin: 0;
    }

    .barcode-main.barcode-paper-105x120 .barcode-main__barcode-item {
        width: 33mm !important;
        height: 15mm !important;
    }
}
```

**Workflow**:
1. **Select Warehouse** - Pilih warehouse untuk filter produk (mode normal)
2. **Select Products** - Pilih produk yang akan dicetak barcode-nya
3. **Set Quantity** - Atur jumlah barcode per produk
4. **Choose Paper Size** - Pilih ukuran kertas atau gunakan custom
5. **Configure Options** - Atur tampilan (company name, product name, price)
6. **Preview** - Klik "Preview" untuk melihat hasil sebelum print
7. **Print** - Klik "Print" untuk mencetak barcode

**API Endpoints**:
- `GET /api/products?warehouse_id={id}` - List products by warehouse
- `POST /api/barcode/generate` - Generate barcode image dari code

**Configuration File**:
- `resources/pos/src/shared/option-lists/paperSize.json` - Daftar ukuran ketersediaan

### 3. Digital Products
**Lokasi**: `resources/pos/src/components/digital-product/`

**Komponen**:
- `DigitalProduct.js` - Digital product listing dengan filter dan search
- `DigitalProductForm.js` - Form creation/edit dengan validation
- `DigitalProductDetail.js` - Halaman detail digital product
- `DeleteDigitalProduct.js` - Modal konfirmasi hapus
- `ImportDigitalProduct.js` - Modal import digital products

**Fitur Lengkap**:
- **File Upload Management**: Upload digital product files (PDF, ZIP, dll)
- **Multiple Images**: Support multiple product images dengan drag-drop
- **Cost Tracking**: Track purchase cost untuk digital products
- **Download Management**: Kontrol limit download per customer
- **License Key Generation**: Generate dan manage license keys
- **Expiry Date Management**: Set expiry date untuk digital products
- **Product Variations**: Support variations untuk digital products
- **Barcode Support**: Generate barcode untuk digital products
- **Import/Export**: Bulk import/export dengan Excel

**Backend Implementation**:
- **Model**: `DigitalProduct` dengan tenant scoping
- **Controller**: `DigitalProductAPIController` dengan full CRUD
- **Repository**: `DigitalProductRepository` dengan data access layer
- **Request Validation**: `DigitalProductRequest` untuk validation rules
- **Tenant Scoping**: Proper multi-tenant data isolation

**Frontend Implementation**:
- **Redux Integration**: State management dengan actions dan reducers
- **Permission-based UI**: Button visibility berdasarkan user permissions
- **Real-time Validation**: Form validation client-side
- **Image Preview**: Preview gambar sebelum upload
- **Responsive Design**: Mobile-friendly layout

**API Endpoints**:
- `GET /api/digital-products` - List digital products (dengan pagination, filters)
- `POST /api/digital-products` - Create digital product
- `GET /api/digital-products/{id}` - Get digital product details
- `PUT /api/digital-products/{id}` - Update digital product
- `DELETE /api/digital-products/{id}` - Delete digital product
- `DELETE /api/digital-products-image-delete/{mediaId}` - Delete product image
- `POST /api/digital-products/import` - Import digital products dari Excel
- `GET /api/digital-products/export` - Export digital products ke Excel

**Database Relations**:
- DigitalProducts ↔ Categories (many-to-one)
- DigitalProducts ↔ Brands (many-to-one)
- DigitalProducts ↔ Media (one-to-many untuk images)
- DigitalProducts ↔ Warehouses (many-to-many untuk stock tracking)

### 4. Provider Management
**Lokasi**: `resources/pos/src/components/provider/`

**Komponen**:
- `Provider.js` - Provider listing dengan filter dan search
- `ProviderForm.js` - Form creation/edit provider
- `ProviderDetail.js` - Halaman detail provider
- `DeleteProvider.js` - Modal konfirmasi hapus

**Fitur Lengkap**:
- **Provider Database**: Manage service providers (ISP, payment gateway, dll)
- **Contact Management**: Track provider contact information
- **Service Types**: Kategorikan providers berdasarkan jenis layanan
- **Status Tracking**: Active/Inactive status management
- **Notes & Remarks**: Additional information per provider
- **Import/Export**: Bulk import/export provider data

**Backend Implementation**:
- **Model**: `Provider` dengan tenant scoping
- **Controller**: `ProviderAPIController` dengan full CRUD
- **Repository**: `ProviderRepository` dengan data access layer
- **Request Validation**: `ProviderRequest` untuk validation rules

**Frontend Implementation**:
- **Redux Integration**: State management dengan provider actions
- **Permission-based UI**: Button visibility berdasarkan permissions
- **Data Table**: ReactDataTable dengan sortable columns
- **Search & Filter**: Real-time search dan filtering

**API Endpoints**:
- `GET /api/providers` - List providers (dengan pagination, filters)
- `POST /api/providers` - Create provider
- `GET /api/providers/{id}` - Get provider details
- `PUT /api/providers/{id}` - Update provider
- `DELETE /api/providers/{id}` - Delete provider

**Database Schema**:
```sql
- id (primary key)
- name (provider name)
- email (contact email)
- phone (contact phone)
- address (provider address)
- service_type (jenis layanan)
- status (active/inactive)
- notes (additional information)
- tenant_id (untuk multi-tenancy)
- created_at, updated_at
```

**Business Logic**:
- Provider data di-scoped per tenant
- Soft delete untuk data integrity
- Validation rules untuk required fields
- Audit trail untuk create/update operations

### 5. Manajemen Penjualan (POS)
**Lokasi**: `resources/pos/src/frontend/components/PosMainPage.js` (Main POS Screen)

**Backend Controller**: `app/Http/Controllers/API/SaleAPIController.php`

**Komponen Utama**:
- `PosMainPage.js` - Main POS interface dengan layout 2 kolom
- `ProductCartList.js` - Cart items display
- `CartItemMainCalculation.js` - Discount, tax, shipping calculations
- `CashPaymentModel.js` - Payment modal dengan multiple payment methods
- `HoldListModal.js` - Hold orders management
- `RecentSaleModal.js` - Recent sales viewer
- `RegisterDetailsModel.js` - POS register details

#### Sales Search & Filtering Enhancement
**Update**: December 2025 - Improved search functionality with join-based subquery approach

**Backend Implementation** (`SaleAPIController.php:41-105`):

**Search Strategy**:
- Menggunakan subquery terpisah dengan `DB::table()` untuk menghindari konflik global scope
- Hasil subquery digunakan dengan `whereIn()` pada main query Eloquent
- Pendekatan ini menghindari masalah *ambiguous column* yang terjadi pada join langsung

**Search Coverage**:
| Field | Table | Search Type |
|-------|-------|-------------|
| reference_code | sales | LIKE %search% |
| name | customers | LIKE %search% |
| name | warehouses | LIKE %search% |
| name | products | LIKE %search% |
| name | main_products | LIKE %search% |

**Code Implementation**:
```php
// Subquery untuk mendapatkan sale_ids yang match dengan search term
$matchingSaleIds = DB::table('sales')
    ->select('sales.id')
    ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
    ->leftJoin('warehouses', 'sales.warehouse_id', '=', 'warehouses.id')
    ->leftJoin('sale_items', 'sales.id', '=', 'sale_items.sale_id')
    ->leftJoin('products', 'sale_items.product_id', '=', 'products.id')
    ->leftJoin('main_products', 'products.main_product_id', '=', 'main_products.id')
    ->where('sales.tenant_id', '=', currentTenantId())
    ->where(function ($q) use ($search) {
        $q->where('sales.reference_code', 'LIKE', "%$search%")
            ->orWhere('customers.name', 'LIKE', "%$search%")
            ->orWhere('warehouses.name', 'LIKE', "%$search%")
            ->orWhere('products.name', 'LIKE', "%$search%")
            ->orWhere('main_products.name', 'LIKE', "%$search%");
    })
    ->pluck('sales.id')
    ->unique()
    ->values();

// Main query menggunakan whereIn dengan hasil subquery
$salesQuery->whereIn('id', $matchingSaleIds);
```

**Key Benefits**:
1. **Performance**: Single subquery lebih efisien daripada multiple `whereHas`
2. **No Ambiguity**: Menggunakan `DB::table()` menghindari global scope conflicts
3. **Tenant Isolation**: Explicit tenant filter dengan `currentTenantId()`
4. **Duplicate Prevention**: `unique()->values()` menghapus duplikat dari join
5. **Pagination**: Pagination berfungsi normal tanpa affected oleh join

**API Endpoint**:
```
GET /api/sales?filter[search]={keyword}
```

**Example Requests**:
- Search by product name: `/api/sales?filter[search]=flash`
- Search by customer: `/api/sales?filter[search]=john`
- Search by reference: `/api/sales?filter[search]=INV-001`
- Search by warehouse: `/api/sales?filter[search]=main`

**Response Format**:
```json
{
    "data": [
        {
            "id": 1,
            "reference_code": "INV-001",
            "customer": { "id": 1, "name": "John Doe" },
            "warehouse": { "id": 1, "name": "Main Warehouse" },
            "sale_items": [
                {
                    "id": 1,
                    "product": {
                        "id": 10,
                        "name": "Flashdisk Sandisk 64Gb",
                        "main_product": {
                            "id": 5,
                            "name": "Flashdisk Sandisk"
                        }
                    }
                }
            ]
        }
    ],
    "meta": { "total": 1, "page": 1 }
}
```

**Troubleshooting**:
| Error | Cause | Solution |
|-------|-------|----------|
| Column 'created_at' ambiguous | Prettus Repository fieldSearchable conflict | Gunakan `Sale::query()` langsung, bukan repository |
| Column 'tenant_id' ambiguous | Global scope setelah join | Subquery dengan explicit tenant filter |
| No results found | `currentTenantId()` returns null | Ensure user authenticated via middleware |

**Related Files**:
- `app/Http/Controllers/API/SaleAPIController.php` - Main controller
- `app/helpers.php:309` - `currentTenantId()` function
- `app/Models/Sale.php` - Sale model dengan global scopes

**Arsitektur POS Screen**:
```
┌─────────────────────────────────────────────────┐
│ Header: Customer + Warehouse Selection         │
├─────────────────┬───────────────────────────────┤
│ Cart Items      │ Product Grid                  │
│ - Product list  │ - Category filter             │
│ - Qty controls  │ - Brand filter                │
│ - Price calc    │ - Search bar                  │
│ - Delete items  │ - Product cards               │
├─────────────────┴───────────────────────────────┤
│ Calculations: Subtotal, Tax, Discount, Total   │
│ Payment Buttons: Cash, Card, Hold, etc.        │
└─────────────────────────────────────────────────┘
```

**Fitur Lengkap POS**:

#### Real-time Cart Management
- **Add to Cart**: Click product → auto-add to cart dengan qty 1
- **Quantity Control**: Increment/decrement dengan validation
- **Price Calculation**: Real-time subtotal per item
- **Cart Persistence**: Auto-save ke localStorage setiap perubahan
- **Cart Sync**: Sync across browser tabs/windows

#### Customer & Warehouse Selection
- **Customer Dropdown**: Pre-loaded default customer
- **Warehouse Selection**: Required untuk stock validation
- **Customer Creation**: Modal form untuk add new customer on-the-fly

#### Product Display & Filtering
- **Category Filter**: Hierarchical category selection
- **Brand Filter**: Filter by product brands
- **Search Functionality**: Real-time search by name/code
- **Infinite Scroll**: Load more products on scroll
- **Product Cards**: Image, name, price, stock status

#### Payment Processing
- **Multiple Payment Methods**: Cash, Card, Split payments
- **Payment Validation**: Amount validation, payment type required
- **Change Calculation**: Automatic change return for cash payments
- **Payment Status**: Paid, Pending, Partial payment support
- **Receipt Generation**: Auto-generate receipt dengan barcode

#### Advanced Features
- **Hold Orders**: Save cart untuk later retrieval
- **Recent Sales**: View recent transactions
- **Register Management**: Open/close register dengan cash reconciliation
- **Tax Calculation**: Configurable tax rates per item/total
- **Discount System**: Fixed amount atau percentage discounts
- **Shipping Charges**: Additional shipping cost support

#### Cart Calculations
```javascript
// Subtotal = Sum of (price × quantity) for all items
const subTotal = cartItems.reduce((sum, item) =>
    sum + (calculateProductCost(item) * item.quantity), 0);

// Discount calculation
const discountTotal = subTotal - discountAmount;

// Tax calculation
const taxTotal = (discountTotal * taxRate) / 100;

// Grand Total
const grandTotal = discountTotal + taxTotal + shipping;
```

#### State Management
- **Redux Store**: Cart state, customer, warehouse, payment details
- **Local Storage**: Cart persistence dengan 'cart-sync' key
- **Real-time Updates**: Auto-sync antara components

#### Payment Flow
1. **Validation**: Check cart not empty, warehouse selected
2. **Payment Modal**: Select payment method(s), enter amounts
3. **API Call**: Submit sale data ke backend
4. **Receipt Generation**: Auto-print atau display receipt
5. **Cart Reset**: Clear cart setelah successful payment
6. **Stock Update**: Real-time inventory adjustment

**API Endpoints**:
- `POST /api/sales` - Create new sale transaction
- `GET /api/holds` - List held orders
- `POST /api/holds` - Save cart as hold order
- `GET /api/sales/recent` - Get recent sales for modal
- `POST /api/pos/register/open` - Open POS register
- `POST /api/pos/register/close` - Close register dengan reconciliation

**Key Business Logic**:
- Stock validation sebelum sale approval
- Payment amount validation (tidak boleh exceed total)
- Tax calculation berdasarkan system settings
- Multi-currency support dengan conversion
- Permission-based feature access
- Audit trail untuk semua transactions

**Error Handling**:
- Cart empty validation
- Insufficient stock alerts
- Payment validation errors
- Network failure recovery
- Auto-save cart on errors

**Performance Optimizations**:
- Lazy loading untuk product images
- Debounced search untuk real-time filtering
- Virtual scrolling untuk large product lists
- Memoized calculations untuk cart totals

---

### 6. Manajemen Pembelian
**Lokasi**: `resources/pos/src/components/purchase/`

**Komponen Utama**:
- `Purchases.js` - Purchase listing dengan filter dan search
- `CreatePurchase.js` - Form pembuatan purchase order
- `PurchaseDetails.js` - Detail view purchase dengan payment tracking
- `PurchaseReturn.js` - Purchase return management

**Fitur**:
- Supplier selection dan purchase order creation
- Line item management dengan quantity dan pricing
- Payment tracking dan status management
- Purchase returns dengan reason tracking
- Due date management dan reminder system
- PDF generation untuk purchase orders

**API Endpoints**:
- `GET /api/purchases` - List purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases/{id}` - Get purchase details
- `GET /api/purchases-return` - List purchase returns

---

### 7. Manajemen Inventori
**Lokasi**: `resources/pos/src/components/adjustments/`

**Komponen Utama**:
- `Adjustments.js` - Stock adjustment listing
- `CreateAdjustment.js` - Stock adjustment form (+/- stock)
- `Transfers.js` - Warehouse transfer management

**Fitur**:
- Stock adjustments dengan reason codes
- Warehouse-to-warehouse transfers
- Stock audit trail dan reporting
- Low stock alerts dan notifications
- Barcode scanning untuk adjustments
- Bulk stock updates

**API Endpoints**:
- `GET /api/adjustments` - List adjustments
- `POST /api/adjustments` - Create adjustment
- `GET /api/transfers` - List transfers
- `POST /api/transfers` - Create transfer

---

### 8. Manajemen Pelanggan & Supplier
**Lokasi**: `resources/pos/src/components/customer/`, `resources/pos/src/components/supplier/`

**Fitur Customer**:
- Customer database dengan contact details
- Purchase history tracking
- Outstanding balance monitoring
- Customer groups dan segmentation
- Import/export customer data
- Customer statements dan aging reports

**Fitur Supplier**:
- Supplier information management
- Purchase history per supplier
- Payment terms dan due dates
- Supplier performance tracking
- Bulk supplier import

**API Endpoints**:
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier

---

### 9. Manajemen Keuangan
**Lokasi**: `resources/pos/src/components/cash-advance/`, `resources/pos/src/components/expense/`

**Cash Advances**:
- Employee cash advance requests
- Approval workflow dengan multi-level approval
- Payment tracking dan repayment schedules
- Cash advance reporting dan analytics

**Expense Management**:
- Expense categories dan sub-categories
- Expense approval workflow
- Receipt attachment dan digital archiving
- Expense reporting berdasarkan category/date

**Payment Integration**:
- Stripe, PayPal, Razorpay, Paystack integration
- Multi-currency payment processing
- Payment status tracking dan webhooks
- Refund processing dan chargebacks

**API Endpoints**:
- `GET /api/cash-advances` - List cash advances
- `POST /api/cash-advances` - Create cash advance
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense

---

### 10. Laporan & Analytics
**Lokasi**: `resources/pos/src/components/report/`

**Tipe Laporan**:
- **Sales Reports**: Daily/weekly/monthly sales dengan filters
- **Purchase Reports**: Supplier purchase analysis
- **Profit & Loss**: Comprehensive P&L statements
- **Best Customers**: Top customers by revenue
- **Stock Reports**: Stock levels, movements, alerts
- **Cash Advance Reports**: Employee advance tracking
- **Warehouse Reports**: Warehouse-wise inventory

**Fitur Export**:
- PDF generation dengan custom layouts
- Excel export untuk data analysis
- Scheduled report delivery
- Report sharing dengan team members

**API Endpoints**:
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/purchases` - Purchase reports
- `GET /api/reports/profit-loss` - P&L report
- `GET /api/reports/best-customers` - Customer analytics

---

### 11. Pengaturan Sistem & Multi-tenancy
**Lokasi**: `resources/pos/src/components/admin/`, `resources/pos/src/components/settings/`

**System Settings**:
- Company information dan branding
- Multi-currency configuration
- Tax rates dan rules setup
- Email templates customization
- SMS gateway configuration
- User roles dan permissions

**Multi-tenancy Features**:
- Separate database per tenant
- Tenant-specific configurations
- Shared resources management
- Tenant isolation middleware
- Subscription management
- Tenant onboarding workflow

**User Management**:
- Role-based access control (RBAC)
- User permissions matrix
- Password policies dan security
- User activity logging
- Bulk user operations

**API Endpoints**:
- `GET /api/settings` - Get system settings
- `POST /api/settings` - Update settings
- `GET /api/users` - List users
- `POST /api/users` - Create user

---

### 12. Integrasi Payment Gateway

**Supported Gateways**:
- **Stripe**: Credit cards, digital wallets
- **PayPal**: Express checkout, subscriptions
- **Razorpay**: Indian market focus
- **Paystack**: African market focus

**Implementation**:
- Unified payment interface
- Webhook handling untuk status updates
- Refund processing
- Multi-currency support
- PCI compliance
- Error handling dan fallback

**API Endpoints**:
- `POST /api/stripe/generate-session` - Stripe payment
- `POST /api/paypal/generate-session` - PayPal payment
- `POST /api/razorpay/generate-session` - Razorpay payment
- `POST /api/paystack/generate-session` - Paystack payment

---

### 13. Multi-language & Multi-currency

**Multi-language Support**:
- 9 languages: English, Arabic, Chinese, French, German, Indonesian, Spanish, Turkish, Vietnamese
- Dynamic language switching
- RTL support untuk Arabic
- Translation management system
- Language fallback handling

**Multi-currency Support**:
- Automatic currency conversion
- Exchange rate management
- Currency-specific formatting
- Historical rate tracking
- Currency rounding rules

**Implementation**:
- Laravel localization untuk backend
- React i18n untuk frontend
- Database-driven translations
- Currency conversion APIs integration

---

### 14. Testing & Development Commands

**Lokasi**: `app/Console/Commands/`

POS.ezakses menyediakan beberapa Artisan commands untuk testing dan development:

#### TestCrossTenantTransfer
**Command**: `php artisan test:cross-tenant-transfer`

**Deskripsi**: Menguji fungsi transfer stok antar tenant (cross-tenant). Command ini berguna untuk memvalidasi bahwa transfer stok antara warehouse di tenant berbeda berfungsi dengan baik.

**Penggunaan**:
```bash
php artisan test:cross-tenant-transfer
```

**Fitur**:
- Simulasi transfer stok antar tenant
- Validasi stock consistency sebelum dan sesudah transfer
- Error reporting untuk failed transfers
- Audit trail generation

#### TestStockReport
**Command**: `php artisan test:stock-report`

**Deskripsi**: Menguji fungsi laporan stok untuk memastikan data reporting akurat.

**Penggunaan**:
```bash
php artisan test:stock-report
```

**Fitur**:
- Generate test stock report
- Validasi data accuracy
- Performance testing untuk large datasets
- Export testing untuk Excel/PDF

#### TestDatabaseQueryLogging
**Command**: `php artisan test:database-query-logging`

**Deskripsi**: Menguji dan mengoptimasi query database untuk identifikasi slow queries.

**Penggunaan**:
```bash
php artisan test:database-query-logging
```

**Fitur**:
- Log semua queries yang dieksekusi
- Identify N+1 query problems
- Performance analysis
- Query optimization suggestions

#### Testing Best Practices
1. **Isolation**: Selalu test di environment development/staging
2. **Data Backup**: Backup database sebelum menjalankan test commands
3. **Review Logs**: Periksa log files setelah testing
4. **Clean Up**: Clean up test data setelah selesai

---

## API Documentation Lengkap

### Authentication Endpoints
```http
POST /api/login
POST /api/register
POST /api/logout
POST /api/forgot-password
POST /api/reset-password
GET /api/user (authenticated)
```

### Product Management
```http
GET /api/products
POST /api/products
GET /api/products/{id}
PUT /api/products/{id}
DELETE /api/products/{id}
POST /api/products/import
GET /api/products/export
GET /api/categories
GET /api/brands
```

### Digital Products
```http
GET /api/digital-products
POST /api/digital-products
GET /api/digital-products/{id}
PUT /api/digital-products/{id}
DELETE /api/digital-products/{id}
DELETE /api/digital-products-image-delete/{mediaId}
POST /api/digital-products/import
GET /api/digital-products/export
```

### Provider Management
```http
GET /api/providers
POST /api/providers
GET /api/providers/{id}
PUT /api/providers/{id}
DELETE /api/providers/{id}
```

### Sales & POS
```http
GET /api/sales
POST /api/sales
GET /api/sales/{id}
PUT /api/sales/{id}
DELETE /api/sales/{id}
GET /api/holds
POST /api/holds
GET /api/sales/recent
POST /api/pos/register/open
POST /api/pos/register/close
```

### Purchase Management
```http
GET /api/purchases
POST /api/purchases
GET /api/purchases/{id}
PUT /api/purchases/{id}
GET /api/purchases-return
POST /api/purchases-return
```

### Inventory Management
```http
GET /api/adjustments
POST /api/adjustments
GET /api/transfers
POST /api/transfers
GET /api/warehouses
```

### Customer & Supplier
```http
GET /api/customers
POST /api/customers
GET /api/customers/{id}
PUT /api/customers/{id}
GET /api/suppliers
POST /api/suppliers
```

### Financial Management
```http
GET /api/cash-advances
POST /api/cash-advances
GET /api/expenses
POST /api/expenses
GET /api/expense-categories
```

### Reports & Analytics
```http
GET /api/reports/sales
GET /api/reports/purchases
GET /api/reports/profit-loss
GET /api/reports/best-customers
GET /api/reports/stock-alerts
GET /api/reports/supplier-report
GET /api/dashboard
```

### Settings & Configuration
```http
GET /api/settings
POST /api/settings
GET /api/users
POST /api/users
GET /api/roles
GET /api/permissions
GET /api/currencies
GET /api/taxes
```

### Payment Integration
```http
POST /api/stripe/generate-session
POST /api/paypal/generate-session
POST /api/razorpay/generate-session
POST /api/paystack/generate-session
POST /api/payments/webhook
```

---

## Deployment Guide Lengkap

### Production Server Requirements
- **OS**: Ubuntu 20.04 LTS / CentOS 7+
- **Web Server**: Nginx 1.18+ atau Apache 2.4+
- **Database**: MySQL 8.0+ / PostgreSQL 13+
- **PHP**: 8.1+ dengan extensions:
  - pdo_mysql/pdo_pgsql
  - mbstring, xml, curl, zip, gd
  - redis (optional), memcached (optional)
- **SSL**: Let's Encrypt atau SSL certificate

### Production Deployment Steps

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install nginx mysql-server redis-server curl wget git unzip -y

# Install PHP 8.1+
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt install php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl php8.1-zip php8.1-gd php8.1-mbstring php8.1-redis -y

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js 16+
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Database Setup
```bash
# Create database and user
sudo mysql -u root -p
CREATE DATABASE pos_ezakses CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON pos_ezakses.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# For multi-tenant setup, create separate databases
CREATE DATABASE pos_tenant1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE pos_tenant2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3. Application Deployment
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/your-repo/pos-ezakses.git
sudo chown -R www-data:www-data pos-ezakses
cd pos-ezakses

# Install dependencies
sudo -u www-data composer install --no-dev --optimize-autoloader
sudo -u www-data npm install
sudo -u www-data npm run production

# Environment configuration
sudo cp .env.example .env
sudo -u www-data php artisan key:generate

# Edit .env with production settings
sudo nano .env
# Configure database, mail, payment gateways, etc.
```

#### 4. Database Migration & Seeding
```bash
sudo -u www-data php artisan migrate
sudo -u www-data php artisan db:seed
sudo -u www-data php artisan storage:link
```

#### 5. Web Server Configuration

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pos-ezakses/public;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 6. SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (add to crontab)
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### 7. Queue & Scheduler Setup
```bash
# Queue worker (using Supervisor)
sudo apt install supervisor -y

# Create supervisor config
sudo nano /etc/supervisor/conf.d/pos-queue.conf
```
```ini
[program:pos-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/pos-ezakses/artisan queue:work --sleep=3 --tries=3 --max-jobs=1000
directory=/var/www/pos-ezakses
autostart=true
autorestart=true
numprocs=2
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/pos-ezakses/storage/logs/queue.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pos-queue:*

# Scheduler (add to crontab)
sudo crontab -e
# Add: * * * * * cd /var/www/pos-ezakses && php artisan schedule:run >> /dev/null 2>&1
```

#### 8. File Permissions & Security
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/pos-ezakses
sudo find /var/www/pos-ezakses -type f -exec chmod 644 {} \;
sudo find /var/www/pos-ezakses -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/pos-ezakses/storage
sudo chmod -R 775 /var/www/pos-ezakses/bootstrap/cache

# Security hardening
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 9. Backup Strategy
```bash
# Create backup script
sudo nano /usr/local/bin/pos-backup.sh
```
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/pos-ezakses"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u pos_user -p'secure_password' pos_ezakses > $BACKUP_DIR/db_backup_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz -C /var/www pos-ezakses

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
sudo chmod +x /usr/local/bin/pos-backup.sh

# Add to crontab for daily backup at 2 AM
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/pos-backup.sh
```

#### 10. Monitoring Setup
```bash
# Install monitoring tools
sudo apt install htop iotop ncdu -y

# Laravel Telescope (optional, for debugging)
sudo -u www-data composer require laravel/telescope
sudo -u www-data php artisan telescope:install
sudo -u www-data php artisan migrate

# Log rotation
sudo nano /etc/logrotate.d/pos-ezakses
```
/var/www/pos-ezakses/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
}

---

## Troubleshooting Guide

### Performance Issues

#### Slow Page Loads
**Symptoms**: Pages take >3 seconds to load
**Solutions**:
```bash
# Check PHP-FPM status
sudo systemctl status php8.1-fpm

# Check database connections
php artisan tinker
# DB::select('SHOW PROCESSLIST');

# Enable OPcache
php -r "var_dump(opcache_get_status());"

# Check Redis/Memcached
redis-cli ping
```

#### High Memory Usage
**Symptoms**: Server memory >80% utilization
**Solutions**:
- Optimize images dengan compression
- Implement database query optimization
- Enable PHP OPcache
- Configure proper memory limits in php.ini

#### Database Performance
**Symptoms**: Slow queries, high CPU on database
**Solutions**:
```sql
-- Check slow queries
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS;

-- Add indexes for common queries
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_products_name ON products(name);

-- Optimize tables
OPTIMIZE TABLE sales, products, customers;
```

### Common Errors

#### 500 Internal Server Error
**Check**:
- Laravel logs: `tail -f storage/logs/laravel.log`
- Web server logs: `tail -f /var/log/nginx/error.log`
- PHP-FPM logs: `tail -f /var/log/php8.1-fpm.log`

**Common Causes**:
- File permissions issues
- Missing PHP extensions
- Database connection problems
- Environment configuration errors

#### 404 Not Found
**Check**:
- URL routing configuration
- File existence in public directory
- Nginx configuration syntax

#### Database Connection Failed
**Check**:
```bash
# Test database connection
php artisan tinker
DB::connection()->getPdo();

# Check database credentials in .env
# Verify database server is running
sudo systemctl status mysql
```

#### Payment Gateway Issues
**Check**:
- API keys configuration
- Webhook endpoints
- SSL certificate validity
- Gateway-specific logs

### Maintenance Commands

#### Daily Maintenance
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize application
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Weekly Maintenance
```bash
# Database optimization
php artisan tinker
Schema::getConnection()->getDoctrineSchemaManager()->listTableNames()

# Log cleanup
find storage/logs -name "*.log" -mtime +7 -delete

# Backup verification
ls -la /var/backups/pos-ezakses/
```

#### Monthly Maintenance
```bash
# Security updates
sudo apt update && sudo apt upgrade -y

# Dependency updates
composer update --no-dev
npm audit fix

# Database maintenance
php artisan migrate:status
php artisan queue:failed
```

### Emergency Procedures

#### System Down
1. Check server resources: `htop`, `df -h`, `free -h`
2. Restart services: `sudo systemctl restart nginx php8.1-fpm mysql redis`
3. Check application logs for errors
4. Verify database connectivity
5. Check payment gateway status

#### Data Loss Recovery
1. Stop application to prevent further data corruption
2. Restore from latest backup
3. Verify data integrity
4. Restart application
5. Test all critical functions

#### Security Breach
1. Isolate affected systems
2. Change all passwords and API keys
3. Review access logs for suspicious activity
4. Update security patches
5. Notify affected parties if customer data compromised

---

## Best Practices & Recommendations

### Development Best Practices
1. **Code Standards**: Follow PSR-12 untuk PHP, Airbnb untuk React
2. **Version Control**: Use Git dengan feature branches dan pull requests
3. **Testing**: Implement unit dan integration tests
4. **Documentation**: Maintain up-to-date API dan code documentation
5. **Code Reviews**: Mandatory peer reviews untuk all changes

### Security Best Practices
1. **Input Validation**: Validate all user inputs pada client dan server side
2. **SQL Injection Prevention**: Use Eloquent ORM atau prepared statements
3. **XSS Prevention**: Escape output, implement CSP headers
4. **Authentication**: Use Laravel Sanctum dengan proper token management
5. **Authorization**: Implement role-based access control (RBAC)
6. **Data Encryption**: Encrypt sensitive data at rest dan in transit
7. **Regular Updates**: Keep dependencies updated dengan security patches

### Performance Best Practices
1. **Database Optimization**: Use indexes, avoid N+1 queries, implement caching
2. **Frontend Optimization**: Code splitting, lazy loading, image optimization
3. **CDN Usage**: Serve static assets dari CDN
4. **Caching Strategy**: Implement Redis untuk session, cache, dan queues
5. **Monitoring**: Set up application performance monitoring (APM)

### Operational Best Practices
1. **Backup Strategy**: Daily backups dengan offsite storage
2. **Monitoring**: Implement comprehensive monitoring dan alerting
3. **Incident Response**: Documented procedures untuk incident handling
4. **Change Management**: Controlled deployment process
5. **Capacity Planning**: Monitor resource usage dan plan scaling

### Multi-tenant Considerations
1. **Data Isolation**: Ensure proper tenant data separation
2. **Resource Management**: Fair resource allocation across tenants
3. **Scalability**: Design untuk horizontal scaling
4. **Backup Strategy**: Tenant-specific backup procedures
5. **Performance Monitoring**: Per-tenant performance metrics

---

## File Structure Reference

### Complete Backend Structure
```
app/
├── Console/Commands/          # Artisan commands
├── Http/Controllers/          # API Controllers
│   ├── API/                   # REST API controllers
│   └── Sadmin/               # Super admin controllers
├── Models/                    # Eloquent models
├── Services/                  # Business logic services
├── Repositories/              # Data access layer
├── Exports/                   # Excel/PDF export classes
├── Imports/                   # Data import classes
├── Mail/                      # Email templates
├── Notifications/             # Push notifications
└── Traits/                   # Reusable model traits

config/                        # Configuration files
database/                      # Migrations & seeders
resources/views/              # Blade templates
routes/                       # Route definitions
tests/                        # Test files
```

### Complete Frontend Structure
```
resources/pos/src/
├── components/                # React components
│   ├── admin/                # Admin panels
│   ├── dashboard/            # Dashboard widgets
│   ├── product/              # Product management
│   ├── printBarcode/         # Barcode printing (105x120mm support)
│   ├── digital-product/      # Digital products (NEW)
│   ├── provider/             # Provider management (NEW)
│   ├── sales/                # Sales components
│   ├── purchase/             # Purchase management
│   ├── report/               # Reports & analytics
│   └── settings/             # System settings
├── frontend/                  # Frontend components
│   └── components/           # POS frontend components
├── shared/                    # Shared utilities
│   ├── sharedMethod.js       # Common functions
│   ├── table/               # Data table components
│   ├── option-lists/        # paperSize.json (barcode paper sizes)
│   └── validation/          # Validation rules
├── assets/css/               # Custom styles
│   ├── custom.css           # Includes .barcode-paper-105x120
│   └── custom.rtl.css       # RTL support for barcode
├── routes.js                 # Route configuration
├── App.js                    # Main app component
├── index.js                  # App entry point
└── constants.js              # Application constants
```

### Key Configuration Files
- `.env` - Environment variables
- `config/app.php` - App configuration
- `config/database.php` - Database configuration
- `config/queue.php` - Queue configuration
- `config/mail.php` - Email configuration
- `webpack.mix.js` - Asset compilation
- `composer.json` - PHP dependencies
- `package.json` - Node.js dependencies

---

## Support & Contact Information

### Development Team
- **Lead Developer**: [Name] - [Email]
- **Backend Developer**: [Name] - [Email]
- **Frontend Developer**: [Name] - [Email]
- **DevOps Engineer**: [Name] - [Email]

### Support Contacts
- **Technical Support**: tech@pos-ezakses.com
- **Business Support**: support@pos-ezakses.com
- **Emergency Hotline**: +1-XXX-XXX-XXXX
- **Documentation Updates**: docs@pos-ezakses.com

### External Resources
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://reactjs.org/docs
- **Bootstrap Documentation**: https://getbootstrap.com/docs
- **Payment Gateway Docs**: Respective gateway documentation

---

## Changelog & Version History

### Version 1.3.0 (Current) - December 2025
- ✅ Provider management system dengan full CRUD operations
- ✅ Enhanced digital products dengan cost tracking, license key generation
- ✅ Digital Services menu section grouping digital products dan providers
- ✅ **Custom 105x120mm barcode paper size support** (NEW)
  - 6 labels per sheet (33mm × 33mm per label)
  - CSS print media query untuk precise layout
  - RTL support untuk Arabic/Hebrew layouts
  - Updated PrintBarcode, PrintButton, dan BarcodeShow components
- ✅ **Enhanced Sales Search & Filter** (NEW - December 26, 2025)
  - Improved search menggunakan subquery dengan `DB::table()` untuk avoid ambiguous columns
  - Search coverage: reference_code, customer name, warehouse name, product name, main_product name
  - Performance: Single subquery lebih efisien daripada multiple `whereHas`
  - Fixed issues dengan Prettus Repository fieldSearchable conflicts
  - Tenant isolation menggunakan `currentTenantId()` helper function
- ✅ Testing infrastructure dengan artisan commands
  - `TestCrossTenantTransfer` untuk cross-tenant transfer testing
  - `TestStockReport` untuk stock report validation
  - `TestDatabaseQueryLogging` untuk query optimization
- ✅ Enhanced service layer (ProductSyncService, ReportStockService, TransferLockService)
- ✅ Improved tenant scoping untuk digital products
- ✅ Multi-image support untuk digital products
- ✅ Download limit tracking untuk digital products

### Version 1.2.0
- ✅ Multi-tenancy support dengan separate databases
- ✅ Enhanced payment gateway integrations
- ✅ Advanced reporting dengan Excel/PDF exports
- ✅ Multi-language support (9 languages)
- ✅ Improved UI/UX dengan Bootstrap 5.1.3
- ✅ Cash advance management system
- ✅ Coupon dan discount code system
- ✅ SMS integration dan templates
- ✅ Email template customization
- ✅ Product variations dan options
- ✅ Digital product support (basic)
- ✅ Quotation management system
- ✅ Sale dan purchase return management
- ✅ Expense tracking dan categorization
- ✅ POS register management
- ✅ Barcode generation dan printing
- ✅ Stock adjustment capabilities
- ✅ Customer dan supplier management
- ✅ Multi-warehouse support

### Version 1.1.0
- ✅ Basic POS functionality
- ✅ Inventory management
- ✅ User management
- ✅ Basic reporting

### Version 1.0.0
- ✅ Initial release
- ✅ Core POS features
- ✅ Basic inventory tracking

---

*Dokumen handover ini dibuat untuk memastikan transisi yang smooth dan pemahaman menyeluruh tentang sistem POS.ezakses. Pastikan untuk mengupdate dokumentasi ini setiap kali ada perubahan signifikan pada sistem atau arsitektur aplikasi.*

**Tanggal Terakhir Update**: December 25, 2025
**Versi Dokumentasi**: 1.2
**Penulis**: AI Assistant - Documentation Specialist