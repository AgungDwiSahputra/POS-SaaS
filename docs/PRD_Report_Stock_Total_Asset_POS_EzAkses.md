# PRD — Perbaikan Nilai “Total Asset” di Stock Report
**Produk:** POS EzAkses  
**Fitur:** `/user/report/report-stock`  
**Tanggal:** 2025-10-20 02:03  
**Dokumen versi:** 1.0

---

## 1) Latar Belakang
Laporan stok saat ini menampilkan daftar item stok beserta nilai aset (qty × cost). Namun terdapat dua bug terkait agregasi **Total Asset**:
1. **Grand Total (non-filter)** belum menampilkan total keseluruhan.
2. **Filtered Total** tidak menyesuaikan dengan hasil filter pengguna dan/atau ikut terpengaruh pagination.

## 2) Masalah yang Teridentifikasi
- Query perhitungan total aset dipengaruhi oleh kondisi pagination (`limit/offset`) atau order, sehingga tidak mencerminkan keseluruhan dataset.
- Query “grand total” dan “filtered total” belum dipisahkan secara tegas dari query daftar item.
- Sumber data `qty` dan `cost` tidak selalu distandarkan (kadang `NULL`), sehingga hasil agregasi bisa tidak akurat.
- Layer controller melakukan sebagian logika agregasi yang semestinya berada di service/repository.

## 3) Tujuan (Goals)
- **Grand Total (non-filter)** menampilkan Σ(qty × cost) untuk **seluruh produk aktif** (respect soft delete), **tanpa** filter UI apa pun.
- **Filtered Total** menampilkan Σ(qty × cost) sesuai filter UI (kategori, gudang, supplier, keyword, date range), **tidak terpengaruh pagination**.
- Konsistensi Sumber Data: qty & cost diambil dari sumber yang sama dan diseragamkan (`COALESCE` jika `NULL`).
- Performa: perhitungan dilakukan di DB (SQL `SUM`), dengan index yang memadai.

## 4) Non-Goals
- Tidak mengubah definisi bisnis perhitungan `cost basis` (avg/last) jika sudah ditetapkan sebelumnya—hanya merapikan sumber dan konsistensi.
- Tidak mengubah UI besar-besaran; hanya menambahkan/menegaskan dua label total yang konsisten.

## 5) Definisi Bisnis
- **Total Asset** = Σ( `qty_on_hand` × `cost_basis` ).
- Produk yang dihitung: semua produk yang ada (tidak menggunakan soft delete pada tabel products).
- Jika `cost_basis` atau `qty_on_hand` `NULL` ⇒ gunakan `0` (via `COALESCE`).
- Jika menggunakan ledger by date range (opsional): `qty_on_hand` dihitung sampai `end_date` (saldo akhir). Untuk **grand total**, digunakan saldo terkini (tanpa filter date).

## 6) Skema Data (Aktual)
- **products**(id, name, code, product_category_id, brand_id, product_cost, product_price, product_unit, stock_alert, order_tax, tax_type, notes, barcode_symbol, expiry_date, created_at, updated_at)
- **manage_stocks**(id, warehouse_id, product_id, quantity, alert, created_at, updated_at) — tabel agregat stok
- **warehouses**(id, name, phone, country_id, city, zip_code) — untuk filter warehouse
- **product_categories**(id, name, created_at, updated_at) — untuk filter kategori
- **brands**(id, name, created_at, updated_at) — untuk filter supplier/brand

## 7) Perubahan Teknis
### 7.1. Service Baru
Buat `App/Services/ReportStockService.php` dengan metode:
```php
class ReportStockService {
    public function getReport(array $filters): array {
        // 1) base query (respect products active & not deleted)
        // 2) clone untuk filtered total (tanpa pagination)
        // 3) grand total terpisah (tanpa filter)
        // 4) kembalikan items (paginated) + totals (grand & filtered)
    }
}
```
Tambahkan helper `applyFilters($qb, $filters)` (kategori, supplier, warehouse, keyword, date range).

### 7.2. Controller
`ReportStockController@index` memanggil `ReportStockService::getReport`, dan merespons JSON dengan struktur konsisten.

### 7.3. Query Pattern
```php
// Base query untuk semua produk (tanpa filter warehouse)
$baseQuery = Product::query()
  ->select([
      'products.id','products.name','products.code','products.product_cost',
      DB::raw('COALESCE(stock_summary.total_qty, 0) as qty'),
      DB::raw('COALESCE(products.product_cost, 0) as cost'),
      DB::raw('(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
  ])
  ->leftJoin(DB::raw('(
      SELECT product_id, SUM(quantity) as total_qty FROM manage_stocks GROUP BY product_id
  ) as stock_summary'), 'stock_summary.product_id', '=', 'products.id');

// Jika ada filter warehouse, gunakan query khusus
if (!empty($warehouseId)) {
    $base = Product::query()
      ->select([
          'products.id','products.name','products.code','products.product_cost',
          DB::raw('COALESCE(warehouse_stock.total_qty, 0) as qty'),
          DB::raw('COALESCE(products.product_cost, 0) as cost'),
          DB::raw('(COALESCE(warehouse_stock.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
      ])
      ->leftJoin(DB::raw("(
          SELECT product_id, SUM(quantity) as total_qty FROM manage_stocks
          WHERE warehouse_id = {$warehouseId} GROUP BY product_id
      ) as warehouse_stock"), 'warehouse_stock.product_id', '=', 'products.id');
} else {
    $base = $baseQuery;
}

$filtered = (clone $base);
$filtered = $this->applyFilters($filtered, $filters);

$items = (clone $filtered)->orderBy('products.name')->paginate($filters['per_page'] ?? 15);

$filteredTotal = (clone $filtered)
  ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
  ->value('total_asset');

// Grand total selalu dari semua produk (tidak terpengaruh filter apapun)
$grandTotal = $baseQuery
  ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
  ->value('total_asset');
```

### 7.4. Struktur Respons JSON
```json
{
  "data": [ /* items paginated */ ],
  "meta": {
    "pagination": { "total": 123, "per_page": 15, "current_page": 1 },
    "totals": {
      "grand_total_asset": 123456789.00,
      "filtered_total_asset": 23456789.00
    }
  }
}
```

### 7.5. Frontend
- Tampilkan dua baris angka:
  - **Total Asset (Semua)** = `meta.totals.grand_total_asset`
  - **Total Asset (Hasil Filter)** = `meta.totals.filtered_total_asset`
- Angka tidak berubah ketika berpindah halaman (pagination).

### 7.6. Performa & Index
- Index yang sudah ada/diperlukan:
  - `manage_stocks(product_id, warehouse_id)` - untuk query agregasi per produk per warehouse
  - `products(product_category_id)` - untuk filter kategori
  - `products(brand_id)` - untuk filter supplier/brand
  - Index komposit pada `products(code, name)` - untuk search keyword
- Lakukan agregasi di DB (`SUM`) bukan di PHP.
- Hindari N+1 akses.

## 8) Acceptance Criteria
- **Grand Total (non-filter)** menampilkan total keseluruhan yang benar, tidak dipengaruhi filter/pagination.
- **Filtered Total** sesuai filter yang aktif dan independen dari pagination.
- Nilai numerik memiliki dua desimal (format di frontend).
- Response menggunakan struktur `meta.totals` seperti di atas.
- Unit/feature tests lulus.

## 9) Test Plan
- **Grand Total** (tanpa filter): Σ(qty×cost) semua produk aktif.
- **Filtered**: terapkan filter kategori/warehouse/date/keyword—total berubah sesuai subset.
- **Pagination Independence**: ubah `per_page` dan `page`—`filtered_total_asset` tetap sama.
- **Null Handling**: `COALESCE` memastikan hasil benar ketika qty/cost `NULL`.
- **Performance**: ukur waktu query & pastikan tidak terjadi N+1.

## 10) Risiko & Mitigasi
- Perbedaan definisi `cost_basis` (avg vs last) → dokumentasikan, pilih satu sumber tegas.
- Ledger by date dapat berat → gunakan CTE/temporary table/materialized view bila perlu.
- Inkonsistensi antar endpoint → abstraksikan base-query & helper filter agar reusable.

## 11) Rollout & Rollback
- **Rollout**: deploy service & controller update, tidak ada migrasi wajib kecuali index tambahan.
- **Monitoring**: log waktu eksekusi, pantau error rate.
- **Rollback**: revert service/controller ke versi sebelumnya bila terjadi regresi.

## 12) Contoh Endpoint
`GET /user/report/report-stock?category_id=...&warehouse_id=...&q=...&start=YYYY-MM-DD&end=YYYY-MM-DD&per_page=15&page=1`

## 13) Deliverables
1. `App/Services/ReportStockService.php`
2. `App/Http/Controllers/ReportStockController.php` (update)
3. Helper `applyFilters(...)`
4. `tests/Feature/ReportStockTest.php`
5. (Opsional) Migration index tambahan

---

## Lampiran A — Skeleton Kode Service
```php
<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ReportStockService
{
    public function getReport(array $filters): array
    {
        // Build base query based on warehouse filter
        if (!empty($filters['warehouse_id'])) {
            $base = $this->buildWarehouseFilteredQuery($filters['warehouse_id']);
        } else {
            $base = $this->buildBaseQuery();
        }

        $filtered = clone $base;
        $this->applyFilters($filtered, $filters);

        $items = (clone $filtered)->orderBy('products.name')
            ->paginate($filters['per_page'] ?? 15);

        $filteredTotal = (clone $filtered)
            ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
            ->value('total_asset');

        $grandTotal = $this->buildBaseQuery()
            ->selectRaw('SUM(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as total_asset')
            ->value('total_asset');

        return [
            'data' => $items,
            'meta' => [
                'pagination' => [
                    'total' => $items->total(),
                    'per_page' => $items->perPage(),
                    'current_page' => $items->currentPage(),
                ],
                'totals' => [
                    'grand_total_asset' => (float) ($grandTotal ?? 0),
                    'filtered_total_asset' => (float) ($filteredTotal ?? 0),
                ],
            ],
        ];
    }

    private function buildBaseQuery()
    {
        return Product::query()
            ->select([
                'products.id','products.name','products.code','products.product_cost',
                DB::raw('COALESCE(stock_summary.total_qty, 0) as qty'),
                DB::raw('COALESCE(products.product_cost, 0) as cost'),
                DB::raw('(COALESCE(stock_summary.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
            ])
            ->leftJoin(DB::raw('(
                SELECT product_id, SUM(quantity) as total_qty FROM manage_stocks GROUP BY product_id
            ) as stock_summary'), 'stock_summary.product_id', '=', 'products.id');
    }

    private function buildWarehouseFilteredQuery($warehouseId)
    {
        return Product::query()
            ->select([
                'products.id','products.name','products.code','products.product_cost',
                DB::raw('COALESCE(warehouse_stock.total_qty, 0) as qty'),
                DB::raw('COALESCE(products.product_cost, 0) as cost'),
                DB::raw('(COALESCE(warehouse_stock.total_qty, 0) * COALESCE(products.product_cost, 0)) as asset_value'),
            ])
            ->leftJoin(DB::raw("(
                SELECT product_id, SUM(quantity) as total_qty FROM manage_stocks
                WHERE warehouse_id = {$warehouseId} GROUP BY product_id
            ) as warehouse_stock"), 'warehouse_stock.product_id', '=', 'products.id');
    }

    private function applyFilters($qb, array $filters): void
    {
        if (!empty($filters['category_id'])) {
            $qb->where('products.product_category_id', $filters['category_id']);
        }
        if (!empty($filters['supplier_id'])) {
            $qb->where('products.brand_id', $filters['supplier_id']);
        }
        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $qb->where(function($query) use ($q) {
                $query->where('products.code', 'like', "%{$q}%")
                      ->orWhere('products.name', 'like', "%{$q}%");
            });
        }
        if (!empty($filters['start']) && !empty($filters['end'])) {
            // Jika qty/cost mengikuti date range (ledger), implementasikan di sini.
            // Misal: join ke view saldo_akhir_stok per end date.
        }
    }
}
```
