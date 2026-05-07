# 🔒 Security Audit Report — Teras JTI (Dine-In Flow)

**Project:** Teras JTI (Frontend Vue.js + Backend Laravel API)  
**Scope:** Route `/dine-in`, Dev Tokens (`MASTER-DEV-DN`, `MASTER-DEV-RST`)  
**Date:** 2026-05-08  
**Severity Scale:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW | ℹ️ INFO

---

## Executive Summary

Ditemukan **6 temuan CRITICAL**, **5 temuan HIGH**, **6 temuan MEDIUM**, dan **4 temuan LOW** dari analisis statis kode frontend (Vue.js) dan backend (Laravel API). Sebagian besar isu berkaitan dengan **dev token bypass yang tidak di-strip untuk production**, **kurangnya validasi input**, **cookie tanpa security flag**, dan **eksposur informasi sensitif**.

---

## 🔴 CRITICAL Findings

### SEC-01: Master Dev Token Hardcoded di Frontend — Bypass Seluruh Autentikasi

> [!CAUTION]
> Token development `MASTER-DEV-DN` dan `MASTER-DEV-RST` di-hardcode di source code frontend dan **memberi akses tanpa validasi apapun** ke seluruh fitur protected.

**File:** [guards.js](file:///d:/laragon/www/teras-jti/src/router/guards.js#L4)
```javascript
const MASTER_TOKENS = ["MASTER-DEV-DN", "MASTER-DEV-RST"];
// Line 37:
if (MASTER_TOKENS.includes(urlToken)) return next();
```

**File:** [DevNav.vue](file:///d:/laragon/www/teras-jti/src/devTools/DevNav.vue#L46-L51)
```javascript
if (fullPath.includes("dine-in")) {
  fullPath = fullPath.replace(":token", "MASTER-DEV-DN");
} else if (fullPath.includes("reservation")) {
  fullPath = fullPath.replace(":token", "MASTER-DEV-RST");
}
```

**Dampak:**
- Siapa pun bisa akses `/dine-in/MASTER-DEV-DN/menu`, `/dine-in/MASTER-DEV-DN/menu/checkout`, dll tanpa session valid
- Token terekspos dalam JavaScript bundle yang di-build (dapat dilihat via View Source / DevTools)
- Tidak ada pengecekan environment — token aktif di production maupun development

**Rekomendasi:**
```javascript
// Gunakan environment variable
const isDev = import.meta.env.DEV; // Vite built-in
const MASTER_TOKENS = isDev ? ["MASTER-DEV-DN", "MASTER-DEV-RST"] : [];
```
Atau lebih baik:
```javascript
// Hapus sepenuhnya dari production build menggunakan dead code elimination
if (import.meta.env.DEV) {
  if (MASTER_TOKENS.includes(urlToken)) return next();
}
```

---

### SEC-02: Dev Token Error Silencing — Menyembunyikan API Error di Mode Dev

**File:** [MenuView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/MenuView.vue#L124-L125)
```javascript
} catch (err) {
    if (token === "MASTER-DEV-DN") return; // ← Error diabaikan sepenuhnya!
```

**Dampak:**
- Saat menggunakan `MASTER-DEV-DN`, semua error API (401, 500, network error) diabaikan tanpa feedback
- Ini memungkinkan flow checkout berlanjut meskipun session tidak valid di backend
- Bisa menyebabkan data inconsistency antara frontend dan backend

**Rekomendasi:**
```javascript
} catch (err) {
    if (import.meta.env.DEV) {
        console.warn("[DEV] API error suppressed:", err);
        return; // Tetap return, tapi log errornya
    }
    // production error handling
}
```

---

### SEC-03: Backend Middleware Tidak Mengenali Dev Token — Semua API Call dari Dev Token GAGAL

> [!IMPORTANT]
> Backend middleware `CheckSessionToken` melakukan lookup ke database (`SessionToken::where('token', $token)`) tapi **tidak ada record `MASTER-DEV-DN` di database**. Artinya semua API call dengan token dev akan **ditolak oleh backend**.

**File:** [CheckSessionToken.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Middleware/CheckSessionToken.php#L31)
```php
$session = SessionToken::where('token', $token)->where('status', 'active')->first();
// Untuk "MASTER-DEV-DN", $session = null → 401 response
```

**Dampak:**
- Frontend bypass guard berhasil, tapi **backend tetap menolak** request → user melihat halaman kosong / error
- `getMenus()`, `addToCart()`, `getCartSummary()`, `checkout()` semuanya GAGAL
- Developer mendapat false sense of security bahwa dev token "bekerja"

**Rekomendasi:**
Tambahkan dev token bypass di middleware backend (hanya environment local):
```php
if (app()->environment('local') && in_array($token, ['MASTER-DEV-DN', 'MASTER-DEV-RST'])) {
    return $next($request);
}
```

---

### SEC-04: Cookie Tanpa Security Flags — Rentan Session Hijacking

**File:** [cookie.js](file:///d:/laragon/www/teras-jti/src/utils/cookie.js#L12-L17)
```javascript
export function setCookie(name, value, minute) {
  const date = new Date();
  date.setTime(date.getTime() + minute * 60 * 1000);
  document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
}
```

**Missing security flags:**
| Flag | Status | Risiko |
|------|--------|--------|
| `Secure` | ❌ Missing | Cookie dikirim melalui HTTP plain-text |
| `HttpOnly` | ❌ Missing | Cookie bisa diakses via JavaScript (XSS attack) |
| `SameSite` | ❌ Missing | Rentan CSRF attack |
| Value encoding | ❌ Missing | Special character dalam token bisa merusak cookie |

**Rekomendasi:**
```javascript
export function setCookie(name, value, minute) {
  const date = new Date();
  date.setTime(date.getTime() + minute * 60 * 1000);
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Strict${secure}`;
}
```
> Note: `HttpOnly` tidak bisa di-set dari JavaScript — ini harus di-handle di server side (Set-Cookie header dari Laravel).

---

### SEC-05: Database Password Terekspos di .env File — Information Disclosure

**File:** [.env](file:///d:/laragon/www/api-teras-jti-v1/.env#L29)
```
DB_PASSWORD=@ShoruKun01
```

**Juga terekspos:**
- `APP_KEY=base64:xgUZH0kLqUaxfXpphpwy+/ChswU+eotZ1KBOIjAibBs=` (Line 3)

**Dampak:**
- Jika `.env` terakses (misconfigured web server, Git exposure), seluruh database bisa diakses
- APP_KEY digunakan untuk enkripsi session Laravel — jika bocor, session bisa di-forge

**Rekomendasi:**
- Pastikan `.env` ada di `.gitignore` (✅ sudah ada)
- Ganti password database menjadi lebih kuat
- Rotasi `APP_KEY` jika pernah terekspos ke repository publik

---

### SEC-06: Ngrok Domain Hardcoded — Potential Open Proxy/Redirect

**File:** [vite.config.js](file:///d:/laragon/www/teras-jti/vite.config.js#L9)
```javascript
const ngrok = "0f23-2404-c0-3571-72da-c137-1ca7-4f7c-2519.ngrok-free.app";
```

**Dampak:**
- Ngrok tunnel memungkinkan akses dari luar jaringan lokal
- Domain ngrok hardcoded → jika domain reused oleh pihak lain, HMR bisa di-hijack
- WebSocket HMR terbuka ke publik (Line 19: `protocol: "wss"`)

**Rekomendasi:**
- Gunakan environment variable: `const ngrok = process.env.NGROK_DOMAIN || 'localhost';`
- Hapus ngrok config sebelum build production
- Jangan commit domain ngrok ke repository

---

## 🟠 HIGH Findings

### SEC-07: Tidak Ada Input Validation di Frontend — XSS Potential

**File:** [MenuView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/MenuView.vue#L213)
```html
<h2 class="text-xl font-bold mb-4">{{ selectedMenu.menu_name }}</h2>
```

Walaupun Vue.js secara default melakukan HTML escaping pada `{{ }}` interpolation, ada beberapa area berisiko:

**File:** [BannerCarousel.vue](file:///d:/laragon/www/teras-jti/src/components/mobile/dinein/BannerCarousel.vue#L121-L127)
```html
<a :href="banner.link">       <!-- ← Href dari API tanpa sanitasi -->
  <img :src="banner.image" /> <!-- ← Src dari API tanpa sanitasi -->
</a>
```

**Dampak:**
- `banner.link` bisa berisi `javascript:alert('XSS')` → XSS via click
- `banner.image` bisa berisi payload yang trigger error handler dengan malicious code

**Rekomendasi:**
```javascript
const sanitizeUrl = (url) => {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '#';
    return url;
  } catch { return '#'; }
};
```
```html
<a :href="sanitizeUrl(banner.link)">
```

---

### SEC-08: Exposed Error Messages dari Backend — Information Leakage

**File:** [CartController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/CartController.php#L108-L116)
```php
} catch (\Exception $e) {
    DB::rollBack();
    return response()->json([
        'success' => false,
        'message' => $e->getMessage(), // ← Internal error terekspos!
    ], 500);
}
```

**Dampak:**
- Stack trace dan error message internal bisa memberi informasi tentang struktur database, query, dll
- Attacker bisa menggunakan informasi ini untuk crafting attack

**Rekomendasi:**
```php
} catch (\Exception $e) {
    DB::rollBack();
    \Log::error('Cart store failed', ['error' => $e->getMessage()]);
    return response()->json([
        'success' => false,
        'message' => 'Terjadi kesalahan. Silakan coba lagi.',
    ], 500);
}
```

---

### SEC-09: IDOR (Insecure Direct Object Reference) di updateQty

**File:** [CartController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/CartController.php#L145-L166)
```php
public function updateQty(Request $request, $itemId)
{
    $item = CartItem::findOrFail($itemId);
    // ← Tidak ada verifikasi bahwa item ini milik session yang aktif!
    $action = $request->action;
    // ... update qty
}
```

Sama untuk `removeItem()`:
```php
public function removeItem($itemId)
{
    CartItem::destroy($itemId); // ← Bisa hapus item milik orang lain!
}
```

**Dampak:**
- User A bisa mengubah qty atau menghapus cart item milik User B
- Cukup enumerate `itemId` (integer increment) untuk memanipulasi cart orang lain

**Rekomendasi:**
```php
public function updateQty(Request $request, $itemId)
{
    $token = $request->header('X-Session-Token');
    $session = SessionToken::where('token', $token)->first();
    
    $item = CartItem::whereHas('cart', function($q) use ($session) {
        $q->where('session_token_id', $session->token_id);
    })->findOrFail($itemId);
    
    // ... proses update
}
```

---

### SEC-10: Missing Request Validation — Mass Assignment Risk

**File:** [SessionController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/SessionController.php#L24-L30)
```php
public function create(Request $request)
{
    $type = $request->session_type; // ← Tidak di-validasi!
    // ...
    $session = SessionToken::create([
        'token' => $sessionToken,
        'session_type' => $type, // ← Bisa diisi nilai apapun
    ]);
}
```

**Juga di:**
- [ReservationController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/ReservationController.php#L97-L125) — `storeStep1` dan `storeStep2` tidak validasi input

**Dampak:**
- `session_type` bisa diisi string arbitrary (SQL injection jika tidak ada prepared statements)
- `latitude/longitude` bisa diisi non-numeric value
- `customer_name`, `customer_phone` bisa berisi HTML/SQL payload

**Rekomendasi:**
```php
public function create(Request $request)
{
    $validated = $request->validate([
        'session_type' => 'required|in:dine-in,reservation',
        'latitude' => 'nullable|numeric|between:-90,90',
        'longitude' => 'nullable|numeric|between:-180,180',
    ]);
    // gunakan $validated bukan $request->session_type
}
```

---

### SEC-11: Missing `reservation_handler` Rate Limiter Definition

**File:** [api.php](file:///d:/laragon/www/api-teras-jti-v1/routes/api.php#L49-L63)
```php
Route::prefix('reservation')
    ->middleware('throttle:reservation_handler')  // ← Rate limiter ini tidak terdefinisi!
```

**File:** [AppServiceProvider.php](file:///d:/laragon/www/api-teras-jti-v1/app/Providers/AppServiceProvider.php#L24-L36)
```php
// Hanya ada: global, cart_handler, sensitive_actions, auth_session
// reservation_handler TIDAK ADA
```

**Dampak:**
- Laravel akan throw error ketika reservation route diakses
- Atau jika Laravel fallback ke default, tidak ada rate limiting untuk reservation endpoints

**Rekomendasi:**
Tambahkan di `AppServiceProvider.php`:
```php
RateLimiter::for('reservation_handler', function (Request $request) {
    return Limit::perMinute(15)->by($request->ip());
});
```

---

## 🟡 MEDIUM Findings

### SEC-12: DevNav Component Loaded in Production

**File:** [MobileLayout.vue](file:///d:/laragon/www/teras-jti/src/layouts/MobileLayout.vue#L8)
```html
<DevNav />  <!-- ← Selalu dimuat, tidak ada environment check -->
```

**Dampak:** Menu debug dengan link ke semua route (termasuk dev tokens) terlihat di production.

**Rekomendasi:**
```html
<DevNav v-if="isDev" />
```
```javascript
const isDev = import.meta.env.DEV;
```

---

### SEC-13: CheckSessionToken Middleware — Inconsistent HTTP Status Codes

**File:** [CheckSessionToken.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Middleware/CheckSessionToken.php#L33-L47)
```php
if (!$session || now()->greaterThan($session->expired_at) || ...) {
    return response()->json([...], /* TANPA STATUS CODE → default 200! */);
}
```

**Dampak:**
- Response expired/invalid session dikembalikan dengan status **200 OK** (bukan 401/403)
- Frontend yang bergantung pada `err.response?.status === 401` **tidak akan menangkap error ini**
- Session yang expired tetap terlihat "berhasil" di frontend

**Rekomendasi:**
```php
return response()->json([
    'success' => false,
    'message' => 'Sesi tidak valid atau telah habis.',
], 401); // ← Tambahkan status code yang benar
```

---

### SEC-14: Token Format Predictable

**File:** [SessionController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/SessionController.php#L140)
```php
$sessionToken = now()->format('dm') . '-' . Str::upper(Str::random(6));
// Contoh output: "0805-ABCDEF"
```

**Analisis:**
- Prefix = tanggal+bulan (2 kemungkinan per hari × 12 bulan = diketahui)
- Random part = 6 karakter uppercase alphanumeric = 36^6 ≈ 2.17 miliar
- Dengan rate limiting 5 req/menit, brute force membutuhkan ~4.1 juta menit ≈ 7.8 tahun

**Penilaian:** Risiko brute force cukup rendah karena rate limiting, tapi token bisa lebih kuat.

**Rekomendasi:** Gunakan `Str::random(16)` atau UUID untuk entropy yang lebih tinggi.

---

### SEC-15: Frontend Menyimpan Token Sensitif di URL

**File:** [MenuView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/MenuView.vue#L94-L95)
```javascript
router.push(`/dine-in/${route.params.token}/menu/checkout`);
```

**File:** [OrderSuccessView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/OrderSuccessView.vue#L10)
```javascript
const orderToken = route.query.order_token; // Token pesanan di query string
```

**Dampak:**
- Token terlihat di address bar, browser history, dan log server
- Jika URL dibagikan (screenshot, copy-paste), token bisa bocor

---

### SEC-16: Geolocation Data Tanpa Validasi Server-Side yang Ketat

**File:** [SessionController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/SessionController.php#L96-L127)
```php
$userLat = $request->latitude;   // ← Tidak di-validate as numeric
$userLong = $request->longitude; // ← Bisa diisi string apapun
```

**Dampak:** User bisa mengirim koordinat palsu yang berada dalam radius (`-8.157, 113.723`) untuk bypass geofencing tanpa berada di lokasi Teras JTI.

**Rekomendasi:** Validasi tipe data dan tambahkan layer verifikasi tambahan (misal: device fingerprint).

---

### SEC-17: `html lang=""` Attribute Kosong

**File:** [index.html](file:///d:/laragon/www/teras-jti/index.html#L2)
```html
<html lang="">
```

**Dampak:** SEO dan accessibility issue. Tidak berdampak keamanan langsung tapi menunjukkan incomplete configuration.

**Rekomendasi:** `<html lang="id">`

---

## 🟢 LOW Findings

### SEC-18: Typo di Error Messages

- [CartController.php](file:///d:/laragon/www/api-teras-jti-v1/app/Http/Controllers/CartController.php#L26): `"Sesi tidak valiid"` (double `i`)
- [DevNav.vue](file:///d:/laragon/www/teras-jti/src/devTools/DevNav.vue#L32): `"Reservatiton"` (typo)

### SEC-19: `onBeforeMount` vs `onBeforeUnmount` Lifecycle Hook Error

**File:** [BannerCarousel.vue](file:///d:/laragon/www/teras-jti/src/components/mobile/dinein/BannerCarousel.vue#L101-L103)
```javascript
onBeforeMount(() => {  // ← Seharusnya onBeforeUnmount!
  stopAutoSlide();
});
```

**Dampak:** Timer interval tidak dibersihkan saat component unmount → memory leak.

### SEC-20: `getCartSummary()` Dipanggil Tanpa Token Param

**File:** [MenuView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/MenuView.vue#L84)
```javascript
const res = await getCartSummary(); // ← Token tidak dikirim
```

Tapi di [cart.js](file:///d:/laragon/www/teras-jti/src/api/cart.js#L12):
```javascript
export const getCartSummary = async (token) => {
    const res = await apiClient.get("/cart/summary", {
        headers: { "X-Session-Token": token }, // token = undefined!
    });
};
```

**Dampak:** API dipanggil dengan header `X-Session-Token: undefined` — request akan ditolak backend.

### SEC-21: SweetAlert2 Error Display Inconsistency

Beberapa error di [MenuView.vue](file:///d:/laragon/www/teras-jti/src/views/mobile/dinein/MenuView.vue#L66-L75) mengirim `err` langsung (object) ke `text`:
```javascript
text: err || "Gagal menambahkan pesanan.",
```
Object Error tidak akan ditampilkan sebagai teks yang readable.

---

## 📊 Summary Table

| ID | Severity | Category | Component | Status |
|----|----------|----------|-----------|--------|
| SEC-01 | 🔴 CRITICAL | Auth Bypass | Frontend Guard | Fix Required |
| SEC-02 | 🔴 CRITICAL | Error Handling | MenuView.vue | Fix Required |
| SEC-03 | 🔴 CRITICAL | Auth Mismatch | Backend Middleware | Fix Required |
| SEC-04 | 🔴 CRITICAL | Session Security | Cookie Utils | Fix Required |
| SEC-05 | 🔴 CRITICAL | Info Disclosure | .env | Verify .gitignore |
| SEC-06 | 🔴 CRITICAL | Config Exposure | vite.config.js | Fix Required |
| SEC-07 | 🟠 HIGH | XSS | BannerCarousel | Fix Required |
| SEC-08 | 🟠 HIGH | Info Leakage | CartController | Fix Required |
| SEC-09 | 🟠 HIGH | IDOR | CartController | Fix Required |
| SEC-10 | 🟠 HIGH | Input Validation | SessionController | Fix Required |
| SEC-11 | 🟠 HIGH | Rate Limiting | Routes/Provider | Fix Required |
| SEC-12 | 🟡 MEDIUM | Debug Exposure | MobileLayout | Fix Required |
| SEC-13 | 🟡 MEDIUM | HTTP Status | Middleware | Fix Required |
| SEC-14 | 🟡 MEDIUM | Token Entropy | SessionController | Improvement |
| SEC-15 | 🟡 MEDIUM | Token Exposure | URL Structure | Improvement |
| SEC-16 | 🟡 MEDIUM | Geofencing | SessionController | Improvement |
| SEC-17 | 🟡 MEDIUM | SEO/A11y | index.html | Fix Required |
| SEC-18 | 🟢 LOW | Typo | Various | Fix Required |
| SEC-19 | 🟢 LOW | Memory Leak | BannerCarousel | Fix Required |
| SEC-20 | 🟢 LOW | API Call Bug | MenuView / cart.js | Fix Required |
| SEC-21 | 🟢 LOW | UX Bug | MenuView | Fix Required |

---

## 🧪 Dev Token Testing Summary

### Token `MASTER-DEV-DN` (Dine-In)

| Test | Frontend | Backend | Verdict |
|------|----------|---------|---------|
| Route Guard Bypass | ✅ Pass (always allowed) | N/A | ⚠️ Works but unsafe |
| `/dine-in/MASTER-DEV-DN/menu` | ✅ Route accessible | ❌ API 401 (no DB record) | 🔴 Broken Flow |
| Menu Loading | ✅ Component mounts | ❌ `getMenus()` fails (401) → error silenced | 🔴 Empty page |
| Add to Cart | ✅ UI clickable | ❌ `addToCart()` fails (401) | 🔴 Silent failure |
| Checkout | ✅ Route accessible | ❌ `fetchCart()` fails (401) | 🔴 Silent failure |
| QR Code Page | ✅ Route accessible | ❌ `validateSession()` fails (401) | 🔴 Redirect to home |

### Token `MASTER-DEV-RST` (Reservation)

| Test | Frontend | Backend | Verdict |
|------|----------|---------|---------|
| Route Guard Bypass | ⚠️ `requiresToken: false` on reservation routes | N/A | Token check skipped |

### Kesimpulan Dev Token:
> **Dev token hanya berfungsi di frontend (route guard bypass), tapi TIDAK berfungsi di backend.** Semua API call akan gagal karena token tidak ada di database. Ini membuat testing flow dine-in menggunakan dev token **tidak mungkin dilakukan end-to-end**.

---

## User Review Required

> [!IMPORTANT]
> **Keputusan yang perlu diambil:**
> 
> 1. **Apakah ingin saya fix semua temuan di atas?** Saya bisa mulai dari yang CRITICAL dahulu.
> 2. **Untuk SEC-03 (backend dev token bypass):** Apakah Anda ingin saya menambahkan dev token bypass di middleware Laravel agar testing bisa berjalan end-to-end? Ini hanya akan aktif di `APP_ENV=local`.
> 3. **Untuk SEC-01 (frontend dev token):** Apakah DevNav dan dev token perlu dipertahankan untuk development, atau dihapus sepenuhnya?
> 4. **Apakah ada endpoint tambahan selain yang sudah saya analisis** yang ingin di-test?

## Open Questions

> [!WARNING]
> - Apakah project ini pernah di-deploy ke server publik (selain ngrok)? Jika ya, .env dan dev token mungkin sudah terekspos.
> - Apakah ada CORS configuration di Laravel? Saya tidak menemukan `config/cors.php` — Laravel 12 mungkin menggunakan default. Ini perlu diverifikasi karena frontend dan backend di domain berbeda (`teras-jti.test` vs `api-teras-jti-v1.test`).
> - Database `DB_PASSWORD=@ShoruKun01` — apakah ini password yang sama digunakan untuk akun lain? Jika ya, segera ganti.
