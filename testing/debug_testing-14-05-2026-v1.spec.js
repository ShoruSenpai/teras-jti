import { test, expect } from '@playwright/test';

test.describe('Teras JTI - E2E Testing (Skenario Dine-In)', () => {
  // Setup geolocation untuk bypass jarak jika diperlukan
  test.use({
    geolocation: { latitude: -7.9467136, longitude: 112.6156684 }, // Sesuaikan dengan koordinat lokasi asli aplikasi
    permissions: ['geolocation'],
  });

  test('SKENARIO 1: Flow Dine-In Normal', async ({ page }) => {
    // 1. Buka halaman utama
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/Teras JTI/i);

    // 2. Klik tombol "Mulai Pesanan" pada card dine in
    // Mencari tombol yang mengarah ke link /dine-in
    const dineInButton = page.locator("a[href='/dine-in']");
    await expect(dineInButton).toBeVisible();
    await dineInButton.click();

    // 3. Verifikasi halaman berpindah ke /dine-in/{token}/menu
    // Sistem akan memanggil API /session/create dan redirect
    await page.waitForURL(/\/dine-in\/.*\/menu/, { timeout: 15000 });

    // 4. Tunggu daftar menu termuat (pastikan elemen icon cart pada menu muncul)
    const addToCartBtn = page.locator('svg[data-icon="cart-shopping"]').first();
    await addToCartBtn.waitFor({ state: 'visible' });

    // 5. Klik tombol "Tambah" (cart icon) pada menu pertama
    await addToCartBtn.click();

    // 6. Handle Modal (Opsional: Jika item menu memiliki varian/opsi)
    // Menunggu sejenak untuk melihat apakah modal animasi muncul
    await page.waitForTimeout(1000); 
    const modalConfirmBtn = page.locator('button:has-text("Tambahkan ke Keranjang")');
    if (await modalConfirmBtn.isVisible()) {
        // Pilih opsi radio button pertama jika ada
        const firstOption = page.locator('input[type="radio"]').first();
        if (await firstOption.isVisible()) {
            await firstOption.check();
        }
        await modalConfirmBtn.click();
    }

    // 7. Verifikasi tombol "Checkout" / Floating Cart muncul setelah item ditambahkan
    const checkoutBtn = page.locator('button:has-text("Checkout")');
    await checkoutBtn.waitFor({ state: 'visible' });
    
    // 8. Klik tombol "Checkout"
    await checkoutBtn.click();

    // 9. Verifikasi halaman berpindah ke halaman keranjang/checkout
    await page.waitForURL(/\/dine-in\/.*\/menu\/checkout/, { timeout: 10000 });

    // 10. Klik checkout terakhir ("Pesan Sekarang")
    const finalCheckoutBtn = page.locator('button:has-text("Pesan Sekarang")');
    await expect(finalCheckoutBtn).toBeVisible();
    await finalCheckoutBtn.click();

    // 11. Verifikasi Pesanan Berhasil
    // Pastikan teks konfirmasi muncul
    await expect(page.locator('text="Pesanan Terkirim!"')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text="Menunggu Pembayaran"')).toBeVisible();
  });
});
