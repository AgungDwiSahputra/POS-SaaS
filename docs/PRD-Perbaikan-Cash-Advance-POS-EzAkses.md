# PRD – Perbaikan Modul Cash Advance (Identities & Advances) – POS EzAkses

## 1) Latar Belakang & Tujuan
Modul **Cash Advance Identities** dan **Cash Advances** memiliki isu berikut:
- **Identities** hanya mendukung **CRU** (Create, Read, Update) — kebijakan tanpa Delete — namun belum memiliki **status aktif/nonaktif** dan **filter** berdasarkan status.
- Halaman **Edit Cash Advance** pada route `GET /user/cash-advances/edit/{id}` menampilkan layar kosong (blank).

**Tujuan:**
1) Menambahkan **status aktif/nonaktif** pada **Cash Advance Identities** dan menyediakan **filter status** di daftar.
2) Memperbaiki halaman **Edit Cash Advance** agar selalu memuat konten (server route, SPA route, data fetching, permission, dan error handling).

## 2) Ruang Lingkup
**In-Scope**
- Backend (Laravel): migration + model scopes + repository/service + controller untuk CRU identities; filter status; perbaikan route edit.
- Frontend (React): UI status (badge/toggle), filter status pada tabel; halaman Edit Cash Advance (route, fetch, loading/error states).
- QA: test fungsional API & UI; logging minimal.

**Out-of-Scope**
- Delete data identities (tetap CRU-only).
- Perubahan besar pada domain Cash Advance di luar kebutuhan edit page.

## 3) Definisi Masalah
1) **CRU-only** untuk identities tetap dipertahankan (tanpa Delete).
2) **Belum ada** kolom/status aktif/nonaktif pada identities.
3) **Belum ada** filter status aktif/nonaktif pada listing identities.
4) `/user/cash-advances/edit/{id}` blank:
   - Kemungkinan: server route tidak mengembalikan container SPA; React route belum terdaftar; data-fetch gagal (404/403/500) tanpa penanganan; policy menolak; asset/runtime error.

## 4) Solusi yang Diusulkan

### 4.1 Database & Model
- Migration baru: `add_is_active_to_cash_advance_identities_table`
```php
Schema::table('cash_advance_identities', function (Blueprint $t) {
    $t->boolean('is_active')->default(true)->index();
    $t->timestamp('deactivated_at')->nullable()->index();
});
```
- Model `CashAdvanceIdentity`
```php
protected $fillable = ['name', /* ... */, 'is_active', 'deactivated_at'];

public function scopeActive($q){ return $q->where('is_active', true); }
public function scopeInactive($q){ return $q->where('is_active', false); }
```
(Opsional) Saat nonaktif, set `deactivated_at = now()`.

### 4.2 API/Backend (Laravel)
- Routes:
  - `GET  /user/cash-advance-identities?status=active|inactive|all` (default: `active`)
  - `POST /user/cash-advance-identities`
  - `PUT  /user/cash-advance-identities/{id}` (update termasuk `is_active`)
- Validasi (FormRequest):
  - `name: required|string|max:255`
  - `is_active: boolean` (opsional saat update)
- Repository/Service:
  - `list($filters)` menyesuaikan scope berdasarkan `status`.
  - `create($dto)`, `update($id, $dto)`.
- Permissions (mis. Spatie):
  - `cash-advance-identity.read|create|update`.
- **Perbaikan Edit Cash Advance** (`/user/cash-advances/edit/{id}`):
  - Server route **selalu mengembalikan container SPA** (Blade/Inertia) yang memuat bundle React yang sama.
  - Controller `edit($id)`:
    - `findOrFail($id)` dengan relasi yang dibutuhkan.
    - Opsi A: inject data minimal ke view; Opsi B: SPA fetch ke `/api/cash-advances/{id}`.
    - Policy: 403 bila tidak berizin; 404 bila tidak ada.
  - Error handling: tampilkan 404/403/500 page yang ramah (bukan blank).

### 4.3 Frontend (React)
- **Daftar Identities**
  - Kolom **Status** (badge “Aktif”/“Nonaktif”). 
  - **Filter Status** (dropdown: `Aktif | Nonaktif | Semua`) → query param ke API.
  - Toggle status di form edit (PUT `is_active`).
  - Loading skeleton + empty state.
- **Halaman Edit Cash Advance**
  - Route: `/user/cash-advances/edit/:id` → `<CashAdvanceEdit/>` terdaftar di router.
  - `useEffect` fetch detail by `id`; tampilkan skeleton/loading, toast/alert untuk error (403/404/500).
  - Form: field inti (identity picker, nominal, tanggal, catatan).
  - Permission guard: read-only/redirect bila tidak berizin.

### 4.4 UX/Copy
- Badge: **Hijau** untuk Aktif, **Abu** untuk Nonaktif.
- Filter jelas & persist di URL query.
- Pesan aksi: “Berhasil disimpan.”, “Status diperbarui.”, “Data tidak ditemukan (404).”, “Anda tidak memiliki akses (403).”.

## 5) Non-Fungsional
- Performa: pagination daftar (15/25 default), index `is_active`, `deactivated_at`.
- Keamanan: permission checks; hindari bocor data pada 403/404.
- Audit (opsional): log perubahan status (user, waktu).

## 6) Dampak Skema & Kompatibilitas
- Forward migration aman (default `true`).
- Rollback menghapus kolom baru — pastikan UI tidak mengandalkan filter sebelum rollback.

## 7) Rencana Rilis
1. Dev: implement DB + backend + frontend + tests.
2. Staging: jalankan migrate; smoke test routing edit & filter status.
3. Prod: window singkat; migrate; cache clear; verifikasi.

## 8) Acceptance Criteria (AC)
- **AC-1**: Identities mendukung **Create, Read, Update**; **Delete tidak tersedia**.
- **AC-2**: Kolom/status **is_active** tersedia; default **true** saat create.
- **AC-3**: Listing identities memiliki **filter status** `Aktif/Nonaktif/Semua` yang berfungsi server-side.
- **AC-4**: `GET /user/cash-advances/edit/{id}`:
  - Memuat **form edit** saat id valid & berizin.
  - Menampilkan **404** saat id tidak ada.
  - Menampilkan **403** saat user tidak berizin.
  - Tidak ada **blank screen**; error API ditampilkan via UI.
- **AC-5**: Lolos unit/feature tests backend & UI smoke tests.

## 9) Test Plan Ringkas
**Backend**
- `POST /user/cash-advance-identities` (201; 422 untuk invalid).
- `PUT /user/cash-advance-identities/{id}` update `is_active` → persist + `deactivated_at` saat nonaktif.
- `GET /user/cash-advance-identities?status=active|inactive|all` → hasil sesuai filter.
- Permission tests → 403 saat tidak berizin.
- `GET /user/cash-advances/edit/{id}` → 200 container; 404/403 sesuai kondisi.

**Frontend**
- Filter status mengubah query & isi tabel; badge status benar; toggle status update data.
- Edit page: route terdaftar; loading→data; 404/403/500 punya UI state yang tepat.

## 10) Risiko & Mitigasi
- Route container salah → standarisasi 1 Blade container untuk SPA.
- Permission mismatch front/back → guard di backend + read-only UI.
- Query tanpa index → tambah index & pagination.

## 11) Contoh Implementasi

### 11.1 Migration
```php
// database/migrations/2025_10_21_XXXXXX_add_is_active_to_cash_advance_identities_table.php
return new class extends Migration {
    public function up(): void {
        Schema::table('cash_advance_identities', function (Blueprint $t) {
            $t->boolean('is_active')->default(true)->index();
            $t->timestamp('deactivated_at')->nullable()->index();
        });
    }
    public function down(): void {
        Schema::table('cash_advance_identities', function (Blueprint $t) {
            $t->dropColumn(['is_active','deactivated_at']);
        });
    }
};
```

### 11.2 Controller (cuplikan)
```php
public function index(Request $r) {
    $status = $r->get('status','active');
    $q = CashAdvanceIdentity::query();
    if ($status==='active')     $q->active();
    elseif ($status==='inactive') $q->inactive();
    return Inertia::render('CashAdvanceIdentities/Index', [
        'items'  => $q->paginate($r->integer('limit',15)),
        'status' => $status,
    ]);
}

public function update(UpdateIdentityRequest $req, int $id) {
    $identity = CashAdvanceIdentity::findOrFail($id);
    $identity->fill($req->validated());
    if ($req->has('is_active')) {
        $identity->is_active = $req->boolean('is_active');
        $identity->deactivated_at = $identity->is_active ? null : now();
    }
    $identity->save();
    return back()->with('success','Identitas berhasil diperbarui.');
}
```

### 11.3 Web Route – Edit Cash Advance (fix blank)
```php
// routes/web.php
Route::middleware(['auth','permission:cash-advance.update'])
    ->get('/user/cash-advances/edit/{id}', function() {
        return view('pos.app'); // container SPA yang memuat bundle React
    })->name('cash-advances.edit');
```

### 11.4 React Route (cuplikan)
```jsx
// resources/pos/src/routes.js
<Route path="/user/cash-advances/edit/:id" element={<CashAdvanceEdit />} />
```

```jsx
// resources/pos/src/components/cash-advances/CashAdvanceEdit.jsx
const CashAdvanceEdit = () => {
  const { id } = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);

  useEffect(()=>{
    api.get(`/api/cash-advances/${id}`)
      .then(res=>setData(res.data))
      .catch(e=>setError(e.response?.status || 'ERR'))
      .finally(()=>setLoading(false));
  },[id]);

  if (loading) return <Skeleton lines={6} />;
  if (error===404) return <Alert type="warning" message="Data tidak ditemukan." />;
  if (error===403) return <Alert type="error" message="Anda tidak memiliki akses." />;
  if (error) return <Alert type="error" message="Terjadi kesalahan. Coba lagi." />;

  return <CashAdvanceForm initialValues={data} />;
};
```

---

**Catatan**: PRD ini menyesuaikan pola arsitektur Laravel + React, Repository/Service, dan permission yang umum di POS EzAkses.
