# Sistem Pemesanan Berbasis QR - Teras JTI

Web-app untuk sistem pemesanan makanan berbasis QR Code di Teras JTI.
Mendukung dine-in (scan QR meja) dan reservasi + pre-order dengan payment gateway.

---

## 🚀 Tech Stack

### Frontend

- Vue 3 (Composition API)
- Vite
- Axios
- TailwindCSS

### Backend

- PHP (Laravel)
- MySQL
- Supabase (admin auth)

### Integrasi

- Midtrans (Payment Gateway)
- QR Code Generator

---

## 📦 Requirement

Pastikan sudah install:

### 1. Node.js

- Minimal versi 18

```bash
node -v
npm -v
```

### 2. PHP

- Minimal PHP 8.x
- Disarankan pakai:
  - Laragon

### 3. Database

- MySQL

### 4. Composer

```bash
composer -v
```

---

## 📁 Struktur Folder

```
project-root/
│
├── frontend/        # Vue App
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/         # PHP / Laravel
│   ├── app/
│   ├── routes/
│   └── public/
│
├── database/
│   └── (MySql)
│
└── README.md
```

---

## ⚙️ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Akses:

```
http://localhost:5173
```

---

## ⚙️ Setup Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

---

## 🔌 Konfigurasi API

File:

```
src/services/apiClient.js
```

```js
baseURL: 'http://localhost:8080/api';
```

---

## 📱 Fitur Sistem

### 🔹 Dine-In (QR Code)

- Scan QR meja
- Generate temporary token
- Pilih menu
- Checkout → QR pesanan
- Kasir scan QR

### 🔹 Reservasi

- Pilih tanggal (calendar)
- Pilih zona
- Pre-order menu
- Pembayaran via Midtrans
- Status: pending / confirmed / expired

---

## 🔐 Alur Sistem (Singkat)

1. User scan QR meja
2. Sistem generate token sementara
3. User order menu
4. Generate QR pesanan
5. Kasir scan → ambil data order

Reservasi:

1. User pilih tanggal & zona
2. Sistem validasi
3. Payment gateway
4. Update status otomatis

---

## ⚠️ Catatan Penting

- Sistem hanya mendukung **dine-in & reservasi**
- Tidak support delivery
- Token memiliki masa expired
- Pastikan webhook Midtrans aktif

---

## 📌 Future Improvement

- Notifikasi realtime (WebSocket)
- Dashboard admin
- Monitoring dapur
- Multi-device sync
