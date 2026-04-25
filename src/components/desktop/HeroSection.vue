<!--
  HeroSection.vue — Headline utama Teras JTI
  ==========================================================
  GANTI / CUSTOM:
  - Copy headline / subheadline: langsung edit <template>.
  - Gambar hero: ganti <img src="/hero-placeholder.jpg" />
    atau pakai URL CDN.
  - Section ini sengaja TIDAK menyediakan tombol order —
    ordering dibatasi untuk perangkat mobile/tablet.
-->
<script setup>
// Komponen statis — tidak perlu state
</script>

<template>
  <section
    id="top"
    class="relative overflow-hidden bg-primary-bg pt-12 pb-24 lg:pt-20 lg:pb-32"
    data-testid="hero-section"
  >
    <!-- Ornamen dekoratif -->
    <div
      class="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-container-2 blur-3xl opacity-70"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-primary-card/20 blur-3xl"
    ></div>

    <div
      class="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-10"
    >
      <!-- ====== Kolom teks ====== -->
      <div class="animate-fade-up">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-primary-card/20 bg-primary-container-1 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary-card"
        >
          <font-awesome-icon icon="fa-solid fa-location-dot"></font-awesome-icon>
          Politeknik Negeri Jember
        </span>

        <h1
          class="mt-6 font-quicksand text-4xl font-bold leading-[1.05] tracking-tight text-text-dark sm:text-5xl lg:text-6xl"
        >
          Ngopi, Nugas, dan
          <span class="relative inline-block">
            <span class="relative z-10 text-primary-card">Nongkrong</span>
            <span
              class="absolute inset-x-0 bottom-1 z-0 h-3 bg-primary-container-2 rounded-full"
            ></span>
          </span>
          <br class="hidden sm:block" />
          di Teras <span class="italic">JTI</span>.
        </h1>

        <p class="mt-6 max-w-xl text-base leading-relaxed text-text-muted lg:text-lg">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          <span class="font-semibold text-primary-card"
            >quis nostrud exercitation ullamco laboris nisi</span
          >
          ut aliquip ex ea commodo consequat.
        </p>

        <!-- Info-chip (BUKAN tombol order, hanya informasi) -->
        <div class="mt-8 flex flex-wrap gap-3">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-primary-container-1 px-4 py-2 text-sm font-semibold text-text-dark shadow-sm"
          >
            <font-awesome-icon
              icon="fa-solid fa-mobile-screen"
              class="text-primary-card"
            ></font-awesome-icon>
            Pesan lewat HP / Tablet
          </div>
          <div
            class="inline-flex items-center gap-2 rounded-full bg-primary-container-1 px-4 py-2 text-sm font-semibold text-text-dark shadow-sm"
          >
            <font-awesome-icon
              icon="fa-solid fa-qrcode"
              class="text-primary-card"
            ></font-awesome-icon>
            Scan QR di meja
          </div>
          <div
            class="inline-flex items-center gap-2 rounded-full bg-primary-container-1 px-4 py-2 text-sm font-semibold text-text-dark shadow-sm"
          >
            <font-awesome-icon
              icon="fa-solid fa-wifi"
              class="text-primary-card"
            ></font-awesome-icon>
            Free Wi-Fi
          </div>
        </div>

        <!-- Catatan desktop → arahkan ke mobile untuk order -->
        <div
          class="mt-10 flex items-start gap-3 rounded-2xl border border-primary-card/15 bg-primary-container-1/70 p-4 text-sm text-text-muted backdrop-blur"
          data-testid="desktop-notice"
        >
          <font-awesome-icon
            icon="fa-solid fa-circle-info"
            class="mt-0.5 text-primary-card"
          ></font-awesome-icon>
          <p>
            Kamu sedang membuka versi <span class="font-semibold text-text-dark">desktop</span>.
            Untuk memesan menu, silakan buka website ini melalui
            <span class="font-semibold text-primary-card">HP atau tablet</span>, atau kunjungi
            langsung Teras JTI.
          </p>
        </div>
      </div>

      <!-- ====== Kolom visual (placeholder) ====== -->
      <div class="relative">
        <div
          class="relative aspect-4/5 w-full overflow-hidden rounded-[2.5rem] bg-primary-container-2 shadow-[0_30px_80px_-30px_rgba(92,58,33,0.45)]"
        >
          <!-- Placeholder gambar: ganti dengan <img src="..." /> bila sudah ada aset -->
          <div class="absolute inset-0 grid place-items-center">
            <div class="text-center">
              <div
                class="mx-auto grid h-28 w-28 place-items-center rounded-full bg-primary-card text-white shadow-xl animate-float-soft"
              >
                <font-awesome-icon
                  icon="fa-solid fa-mug-saucer "
                  class="text-4xl"
                ></font-awesome-icon>
              </div>
              <p
                class="mt-6 px-8 text-sm font-semibold uppercase tracking-[0.25em] text-primary-card"
              >
                Hero Image Placeholder
              </p>
              <p class="mt-2 px-8 text-xs text-text-muted">
                Ganti di
                <code class="rounded bg-primary-bg px-1">/public/hero-placeholder.jpg</code>
              </p>
            </div>
          </div>
          <!-- Overlay pattern -->
          <div class="absolute inset-0 bg-grain opacity-60"></div>
        </div>

        <!-- Card floating kanan-bawah -->
        <div
          class="absolute -bottom-6 -left-4 hidden items-center gap-3 rounded-2xl bg-primary-container-1 p-4 shadow-xl sm:flex"
        >
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-primary-card text-white">
            <font-awesome-icon icon="fa-solid fa-star"></font-awesome-icon>
          </div>
          <div>
            <p class="text-sm font-bold text-text-dark">Favorit Mahasiswa</p>
            <!-- <p class="text-xs text-text-muted">Sejak berdiri di JTI Polije</p> -->
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
