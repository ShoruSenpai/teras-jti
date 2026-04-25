<!--
  AboutSection.vue — Cerita singkat tentang Teras JTI
  ==========================================================
  GANTI / CUSTOM:
  - Copy paragraf: edit langsung di <template>.
  - Statistik (stats): ubah array di <script setup>.
-->
<script setup>
// Statistik kecil — edit sesuai data aktual
const stats = [
  { icon: "fa-users", label: "Mahasiswa JTI Dilayani", value: "1.500+" },
  { icon: "fa-mug-hot", label: "Menu Kopi & Minuman", value: "25+" },
  { icon: "fa-clock", label: "Jam Operasional", value: "07 - 23 WIB" },
];
</script>

<template>
  <section
    id="tentang"
    class="relative bg-primary-container-1 py-24 lg:py-32"
    data-testid="about-section"
  >
    <div class="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-10">
      <!-- ===== Visual kolase ===== -->
      <div class="relative">
        <div class="grid grid-cols-6 grid-rows-6 gap-4 h-130">
          <!-- Box besar -->
          <div
            class="col-span-4 row-span-4 rounded-3xl bg-primary-container-2 relative overflow-hidden shadow-lg"
          >
            <div class="absolute inset-0 grid place-items-center text-primary-card">
              <font-awesome-icon icon="fa-solid fa-store " class="text-6xl"></font-awesome-icon>
            </div>
          </div>
          <!-- Box kecil kanan -->
          <div class="col-span-2 row-span-3 rounded-3xl bg-primary-card relative overflow-hidden">
            <div class="absolute inset-0 grid place-items-center text-white">
              <font-awesome-icon icon="fa-solid fa-leaf " class="text-4xl"></font-awesome-icon>
            </div>
          </div>
          <!-- Box kecil kanan bawah -->
          <div class="col-span-2 row-span-3 rounded-3xl bg-hover-card relative overflow-hidden">
            <div class="absolute inset-0 grid place-items-center text-primary-bg">
              <font-awesome-icon
                icon="fa-solid fa-mug-saucer "
                class="text-4xl"
              ></font-awesome-icon>
            </div>
          </div>
          <!-- Box bawah lebar -->
          <div
            class="col-span-4 row-span-2 rounded-3xl bg-primary-bg relative overflow-hidden border border-primary-card/10"
          >
            <div class="absolute inset-0 flex items-center gap-4 px-6">
              <font-awesome-icon
                icon="fa-solid fa-graduation-cap "
                class="text-3xl text-primary-card"
              ></font-awesome-icon>
              <div>
                <p class="text-sm font-bold text-text-dark">Kampus JTI Polije</p>
                <p class="text-xs text-text-muted">Gedung Jurusan Teknologi Informasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Teks ===== -->
      <div>
        <span class="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-card">
          — Tentang Kami
        </span>
        <h2
          class="mt-4 font-quicksand text-3xl font-bold leading-tight text-text-dark sm:text-4xl lg:text-5xl"
        >
          Ruang kecil tempat <br />
          mahasiswa <span class="text-primary-card">bertumbuh</span>.
        </h2>

        <div class="mt-6 space-y-4 text-base leading-relaxed text-text-muted lg:text-lg">
          <p>
            <span class="font-semibold text-text-dark">Lorem ipsum</span> dolor sit amet consectetur
            adipiscing elit sed do eiusmod tempor incididunt ut labore,
            <span class="font-semibold text-primary-card">et dolore magna aliqua</span>. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris — nisi ut aliquip ex ea commodo
            consequat duis aute irure dolor in reprehenderit.
          </p>
          <p>
            Voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat
            cupidatat non proident
            <span class="font-semibold text-text-dark">sunt in culpa qui</span>, officia deserunt
            mollit anim id est laborum sed ut perspiciatis.
          </p>
        </div>

        <!-- Statistik -->
        <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            v-for="s in stats"
            :key="s.label"
            class="rounded-2xl border border-primary-card/10 bg-primary-bg p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary-card/30 hover:shadow-lg"
          >
            <div class="grid h-11 w-11 place-items-center rounded-xl bg-primary-card text-white">
              <font-awesome-icon :icon="['fa-solid', s.icon]"></font-awesome-icon>
            </div>
            <p class="mt-4 text-2xl font-bold text-text-dark">{{ s.value }}</p>
            <p class="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {{ s.label }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
