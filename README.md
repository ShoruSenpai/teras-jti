# Teras JTI - Admin Panel Backend Integration Report

Dokumen ini berisi analisis lengkap dari semua fitur di frontend admin yang saat ini menggunakan *dummy data*, beserta kontrak API (REST API Endpoints) yang dibutuhkan untuk mengintegrasikan frontend ini dengan backend yang sebenarnya.

Sistem ini menggunakan **Double Guard Architecture** yang berarti pengamanan dilakukan melalui *Session Token* (Autentikasi) dan *Role Checking* (Otorisasi).

---

## Konfigurasi Global API (Axios)

Untuk menyelaraskan dengan web pelanggan, frontend admin mengirimkan sesi melalui header khusus `X-Session-Token`.

```javascript
import axios from 'axios';
// (Sesuaikan baseURL dengan domain backend)
const baseURL = 'https://api-teras-jti-v2.com/admin'; 

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user && user.token) {
    // Header sesi selaras dengan standard web pelanggan
    reqConfig.headers['X-Session-Token'] = user.token;
  }
  return reqConfig;
});

export default apiClient;
```

> [!WARNING]
> Backend **wajib** mengimplementasikan 2 middleware:
> 1. **Middleware Sesi**: Memeriksa validitas `X-Session-Token`.
> 2. **Middleware Role**: Memeriksa kecocokan role user yang memiliki token tersebut dengan endpoint yang dituju

> Role: owner, admin, kasir
> 
> Owner: 
> - /reports
> - /dinein
> - /reservation
> - /menu
> - /banner
> - /cashier
> - /accounts
> - /settings
> 
> Admin:
> - /reports
> - /dinein
> - /reservation
> - /menu
> - /banner
> - /settings
> 
> Kasir:
> - /cashier
> - /settings

---

## 1. Modul Autentikasi & Akun

File terkait: `src/views/LoginView.js`, `src/views/AccountsView.js`, `src/components/AccountPopup.js`

### 1.1. Login

**Endpoint:** `POST /auth/login`
**Request Body:**
```json
{
  "email": "admin@terasjti.com",
  "password": "password123"
}
```
**Response (Success):**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@terasjti.com",
  "role": "admin", // enum: "owner", "admin", "kasir"
  "token": "jwt-or-session-token-string"
}
```

### 1.2. Manajemen Akun (Khusus Owner)

**Endpoint:** `GET /accounts` (Mendapatkan list staf)
**Response:** Array objek user (tanpa password).

**Endpoint:** `POST /accounts` (Menambah staf baru)
**Request Body:**
```json
{
  "name": "Budi Kasir",
  "email": "budi@terasjti.com",
  "role": "kasir",
  "password": "securepassword"
}
```

**Endpoint:** `PUT /accounts/:id` (Update data/role staf)
**Request Body:** Sama dengan POST, namun `password` opsional (jika kosong, jangan diubah).

**Endpoint:** `DELETE /accounts/:id` (Hapus staf)

---

## 2. Modul Laporan & Dashboard (ReportsView)

File terkait: `src/views/ReportsView.js`

**Endpoint:** `GET /stats/summary`
**Response:**
```json
{
  "revenue": 24500000,
  "revenueTrend": "+12.5%", // perbandingan bulan ini dan bulan lalu
  "orders": 1248,
  "ordersTrend": "+5.2%", // perbandingan minggu ini dan minggu lalu
  "avgOrder": 19600,
  "avgOrderTrend": "0.0%", // perbandingan minggu ini dan minggu lalu
  "activeOrders": 24
}
```

**Endpoint:** `GET /stats/recent-transactions`
**Response:**
```json
[
  { 
    "id": "#ORD-0842", 
    "table": "T-02", 
    "amount": 85000, 
    "status": "PAID" // Enum: "PAID", "PENDING", "CANCELLED", "EXPIRED"
  }
]
```

---

## 3. Modul Kasir & Menu (CashierView & MenuView)

File terkait: `src/views/CashierView.js`, `src/views/MenuView.js`, `src/components/MenuPopup.js`

### 3.1. Master Menu

**Endpoint:** `GET /menu`
**Response:**
```json
[
  { 
    "id": 1, 
    "category": "Appetizers", 
    "name": "Fresh Garden Salad", 
    "description": "Sayuran segar", 
    "price": 45000, 
    "stock": 20,
    "image": "https://url-gambar.com/img.jpg", 
    "is_new": 1, // 1 = true, 0 = false
    "is_recommended": 1, // 1 = true, 0 = false
    "status": "available" // Enum: "available", "sold_out", "disabled"
  }
]
```

**Endpoint:** `POST /menu` (Tambah Menu)
**Endpoint:** `PUT /menu/:id` (Edit Menu)
**Endpoint:** `DELETE /menu/:id` (Hapus Menu)

### 3.2. Order POS (Kasir)

**Endpoint:** `POST /orders`
Fungsi ini dipanggil ketika kasir menekan tombol "Place Order" (terdapat di `CashierView`).
**Request Body:**
```json
{
  "orderType": "Dine In", // atau "Take Away"
  "tableNumber": "A-12", // Opsional, kosong jika Take Away
  "items": [
    { "id": 1, "qty": 2, "price": 45000 },
    { "id": 5, "qty": 1, "price": 75000 }
  ],
  "subtotal": 165000,
  "tax": 16500,
  "total": 181500
}
```

---

## 4. Modul Dine-In & Reservasi (DineInView & ReservationView)

File terkait: `src/views/DineInView.js`, `src/views/ReservationView.js`

### 4.1. Dine In (Live Orders)

**Endpoint:** `GET /orders/active`
Berisi pesanan-pesanan yang belum selesai.
**Response:**
**Table `order_history`**
```json
[
  { 
    "id": "#D-1024", 
    "table": "A-12", 
    "time": "12:45",
    "total": 214000, 
    "status": "Pending", // Enum: "Pending", "Paid", "Cancelled", "Expired"
    "items": [
      { "name": "JTI Burger", "qty": 2 }
    ]
  }
]
```

### 4.2. Reservasi

**Endpoint:** `GET /reservations`
**Response:**
```json
[
  { 
    "id": 1, 
    "customer": "Jane Doe", 
    "phone": "+62 812 3456 7890", 
    "date": "Today", 
    "time": "19:00", 
    "guests": 4, 
    "tablePref": "Window Seat", 
    "status": "Pending" // Enum: "Pending", "Confirmed", "Cancelled"
  }
]
```

**Endpoint:** `PATCH /reservations/:id/status` (Mengubah status dari aksi admin)
**Request Body:**
```json
{
  "status": "Confirmed"
}
```

---

## 5. Modul Banner Management (BannerView)

File terkait: `src/views/BannerView.js`, `src/components/BannerPopup.js`

**Table `banner_carousel`**

### 5.1. List Banners

**Endpoint:** `GET /banners`
**Response:**
```json
[
  {
    "banner_id": 1,
    "banner_title": "Special Nasi Goreng Promo",
    "image_url": "https://url-gambar.com/banner1.jpg",
    "link_url": "/promo/nasi-goreng",
    "start_at": "2026-05-01T00:00:00",
    "end_at": "2026-06-30T23:59:00",
    "is_active": true,
    "display_order": 1,
    "created_at": "2026-05-01T10:00:00"
  }
]
```

### 5.2. Create Banner

**Endpoint:** `POST /banners`
**Request Body:**
```json
{
  "banner_title": "Summer Sale",
  "image_url": "https://url-gambar.com/summer.jpg",
  "link_url": "/promo/summer",
  "start_at": "2026-06-01T00:00",
  "end_at": "2026-08-31T23:59",
  "is_active": true,
  "display_order": 4
}
```

### 5.3. Update Banner

**Endpoint:** `PUT /banners/:banner_id`
**Request Body:** Sama dengan POST.

### 5.4. Toggle Status Banner

**Endpoint:** `PATCH /banners/:banner_id/toggle`
Mengubah `is_active` dari `true` ke `false` atau sebaliknya.
**Response:** Objek banner yang telah diupdate.

### 5.5. Delete Banner

**Endpoint:** `DELETE /banners/:banner_id`

---

## 6. Modul Profil User (SettingsView)

File terkait: `src/views/SettingsView.js`

**Endpoint:** `PUT /profile`
Mengubah profil diri sendiri (nama/email).
**Request Body:**
```json
{
  "name": "Budi Terbaru",
  "email": "budi.baru@terasjti.com"
}
```

**Endpoint:** `PUT /profile/password`
**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newsecurepassword"
}
```

---
> [!TIP]
> **Tugas Developer Backend:**
> Buatkan struktur skema database relasional berdasarkan data di atas, dan bangun endpoint-endpoint sesuai spesifikasi JSON yang diminta. Integrasikan interceptor middleware untuk mengecek `X-Session-Token` dan mencocokkan `Role` dari token tersebut.
