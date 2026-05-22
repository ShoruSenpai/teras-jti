// api-tester.js
const BASE_URL = "http://localhost/api-teras-jti-v2/api"; // Sesuaikan URL Laragon-mu

// State Penyimpanan Robot
let dineInToken = "";
let reservationToken = "";
let targetMenuId = null;
let reservationId = null;

// Helper Tabel Console
const col1 = 35; // Lebar Skenario
const col2 = 35; // Lebar Harapan
const col3 = 15; // Lebar Hasil
const col4 = 15; // Lebar Kesimpulan

function printBorder() {
  console.log(
    `+${"-".repeat(col1 + 2)}+${"-".repeat(col2 + 2)}+${"-".repeat(col3 + 2)}+${"-".repeat(col4 + 2)}+`,
  );
}

function printRow(c1, c2, c3, c4) {
  console.log(
    `| ${c1.padEnd(col1)} | ${c2.padEnd(col2)} | ${c3.padEnd(col3)} | ${c4.padEnd(col4)} |`,
  );
}

// Wrapper Test
async function runTest(scenario, expected, testFn) {
  try {
    await testFn();
    printRow(scenario, expected, "\x1b[32mValid (Pass)\x1b[0m", "Sesuai");
  } catch (error) {
    printRow(scenario, expected, "\x1b[31mInvalid (Fail)\x1b[0m", "Error");
    console.log(`\n\x1b[31m[DEBUG ERROR] Skenario: ${scenario} -> ${error.message}\x1b[0m\n`);
  }
}

async function startTesting() {
  console.log("\n🚀 MEMULAI AUTOMATED BLACKBOX TESTING API TERAS JTI V2...\n");

  printBorder();
  printRow("Skenario Pengujian", "Hasil yang Diharapkan", "Hasil Pengujian", "Kesimpulan");
  printBorder();

  // ==========================================
  // BAGIAN 1: MODUL PUBLIC & DINE IN
  // ==========================================
  await runTest("Create Session Dine-in", "Berhasil dapat Token", async () => {
    const res = await fetch(`${BASE_URL}/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_type: "dine-in", latitude: -8.1574, longitude: 113.723 }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    dineInToken = data.token;
  });

  await runTest("Get Daftar Menu", "Berhasil load array menu", async () => {
    const res = await fetch(`${BASE_URL}/menus`, {
      headers: { "X-Session-Token": dineInToken },
    });
    const data = await res.json();
    if (!data.success || data.data.length === 0) throw new Error("Menu kosong/gagal");
    targetMenuId = data.data[0].menu_id;
  });

  await runTest("Add Item to Cart", "Data sukses ditambahkan", async () => {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": dineInToken },
      body: JSON.stringify({ menu_id: targetMenuId, options: [] }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  });

  await runTest("Get Cart Summary", "Total Items > 0", async () => {
    const res = await fetch(`${BASE_URL}/cart/summary`, {
      headers: { "X-Session-Token": dineInToken },
    });
    const data = await res.json();
    if (!data.success || data.data.total_items === 0) throw new Error("Keranjang kosong");
  });

  // ==========================================
  // BAGIAN 2: MODUL RESERVATION
  // ==========================================
  await runTest("Create Session Reservation", "Berhasil dapat Token Reservasi", async () => {
    const res = await fetch(`${BASE_URL}/session/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_type: "reservation" }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    reservationToken = data.token;
  });

  await runTest("Cek Ketersediaan Bulan", "Mendapatkan data kalender", async () => {
    const res = await fetch(`${BASE_URL}/reservation/month-availability?month=2026-05`, {
      headers: { "X-Session-Token": reservationToken },
    });
    const data = await res.json();
    if (!data.success) throw new Error("Gagal load bulan");
  });

  await runTest("Input Step 1 (Pilih Area)", "Mendapat reservation_id", async () => {
    // Ambil tanggal besok lusa agar validasi "minimal 1 hari" lewat
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split("T")[0];

    const res = await fetch(`${BASE_URL}/reservation/step-area`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": reservationToken },
      body: JSON.stringify({ date: dateStr, area_id: 1 }), // Asumsi area_id 1 ada
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    reservationId = data.reservation_id;
  });

  await runTest("Input Step 2 (Data Diri)", "Update waktu & durasi sukses", async () => {
    const res = await fetch(`${BASE_URL}/reservation/step-personal-data`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Token": reservationToken },
      body: JSON.stringify({
        reservation_time: "10:00",
        reservation_duration: 3,
        customer_name: "Shoru Tester",
        customer_phone: "081234567890",
        guest_count: 15, // Asumsi masuk min-max
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
  });

  await runTest("Kalkulasi Tagihan Reservasi", "Mendapatkan hitungan DP", async () => {
    const res = await fetch(`${BASE_URL}/reservation/summary`, {
      headers: { "X-Session-Token": reservationToken },
    });
    const data = await res.json();
    if (!data.success || !data.data.total) throw new Error("Summary gagal dihitung");
  });

  printBorder();
  console.log("\n🎉 SELURUH SKENARIO TESTING TELAH SELESAI DIEKSEKUSI!\n");
}

startTesting();
