<!--
  FeatureSection.vue — Highlight fasilitas / keunggulan
  ==========================================================
  GANTI / CUSTOM:
  - Tambah / ubah item pada array `features` di <script setup>.
  - Pakai kombinasi warna `primary-card` (default) dan `hover-card`
    (on hover) sesuai permintaan brief.
-->
<script setup>
const features = [
  {
    icon: "fa-qrcode",
    title: "QR Ordering di Meja",
    desc: "Scan QR, pilih menu, bayar — tanpa antre. Khusus diakses dari HP / tablet milikmu.",
  },
  {
    icon: "fa-couch",
    title: "Hangout Space Nyaman",
    desc: "Meja komunal, colokan listrik, pencahayaan hangat — pas untuk ngopi sambil nugas.",
  },
  {
    icon: "fa-mug-hot",
    title: "Kopi & Menu Pilihan",
    desc: "Biji kopi lokal pilihan, menu ringan favorit mahasiswa, harga ramah kantong.",
  },
  {
    icon: "fa-wifi",
    title: "Wi-Fi Kencang",
    desc: "Koneksi stabil untuk kebutuhan push, zoom meeting, sampai lomba CP.",
  },
  {
    icon: "fa-people-group",
    title: "Zona Kolaborasi",
    desc: "Ruang bebas diskusi kelompok tanpa mengganggu pengunjung lain.",
  },
  {
    icon: "fa-leaf",
    title: "Suasana Kampus",
    desc: "Lokasi tepat di JTI Polije — cukup jalan kaki dari ruang kelas.",
  },
];
</script>

<template>
  <section
    id="fasilitas"
    class="relative bg-primary-bg py-24 lg:py-32"
    data-testid="feature-section"
  >
    <div class="mx-auto max-w-7xl px-6 lg:px-10">
      <!-- Header section -->
      <div class="mx-auto max-w-2xl text-center">
        <span class="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-card">
          — Fasilitas
        </span>
        <h2
          class="mt-4 font-quicksand text-3xl font-bold leading-tight text-text-dark sm:text-4xl lg:text-5xl"
        >
          Lebih dari sekadar <span class="text-primary-card">kantin</span>.
        </h2>
        <p class="mt-5 text-base text-text-muted lg:text-lg">
          Kami merancang Teras JTI agar setiap sudutnya bisa jadi ruang produktifmu.
        </p>
      </div>

      <!-- Grid fitur — default memakai `primary-card`, hover beralih ke `hover-card` -->
      <div class="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(f, i) in features"
          :key="f.title"
          :data-testid="`feature-card-${i}`"
          class="group relative overflow-hidden rounded-3xl bg-primary-card p-8 text-primary-bg transition-all duration-500 hover:-translate-y-2 hover:bg-hover-card hover:shadow-2xl hover:shadow-hover-card/30"
        >
          <!-- Decorative blob -->
          <span
            class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-bg/10 transition-transform duration-700 group-hover:scale-125"
          ></span>

          <div class="relative">
            <div
              class="grid h-14 w-14 place-items-center rounded-2xl bg-primary-bg/15 text-primary-bg backdrop-blur transition-all duration-300 group-hover:bg-primary-bg group-hover:text-hover-card"
            >
              <font-awesome-icon :icon="['fa-solid', f.icon]" class="text-xl"></font-awesome-icon>
            </div>
            <h3 class="mt-6 font-quicksand text-xl font-bold text-white">{{ f.title }}</h3>
            <p class="mt-3 text-sm leading-relaxed text-primary-bg/85">
              {{ f.desc }}
            </p>

            <div
              class="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-bg/80"
            >
              <span
                class="h-[1px] w-6 bg-primary-bg/60 transition-all duration-500 group-hover:w-12"
              ></span>
              Fasilitas
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
