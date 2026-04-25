<!--
  Footer.vue — Footer Teras JTI
  ==========================================================
  GANTI / CUSTOM:
  - Alamat, jam operasional, sosmed: semua placeholder.
    Edit array `contact` dan `socials` di <script setup>.
  - Tahun copyright otomatis dari `new Date().getFullYear()`.
-->
<script setup>
const year = new Date().getFullYear();

const contact = [
  { icon: "fa-location-dot", label: "Gedung JTI, Politeknik Negeri Jember, Jawa Timur" },
  { icon: "fa-clock", label: "Senin – Jumat · 07.00 – 18.00 WIB" },
  { icon: "fa-envelope", label: "halo@terasjti.placeholder" },
  { icon: "fa-phone", label: "+62 8xx-xxxx-xxxx (placeholder)" },
];

const socials = [
  { icon: "fa-instagram", href: "#", label: "Instagram" },
  { icon: "fa-tiktok", href: "#", label: "TikTok" },
  { icon: "fa-whatsapp", href: "#", label: "WhatsApp" },
];
</script>

<template>
  <footer
    id="kontak"
    class="relative overflow-hidden bg-hover-card text-primary-bg"
    data-testid="footer"
  >
    <!-- Ornamen -->
    <div
      class="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-primary-card/30 blur-3xl"
    ></div>

    <div class="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
        <!-- Brand block -->
        <div>
          <div class="flex items-center gap-3">
            <span
              class="grid h-12 w-12 place-items-center rounded-2xl bg-primary-bg text-hover-card shadow-lg"
            >
              <font-awesome-icon icon="fa-solid fa-mug-hot " class="text-lg"></font-awesome-icon>
            </span>
            <div>
              <p class="text-xl font-bold tracking-tight">Teras JTI</p>
              <p class="text-[11px] uppercase tracking-[0.25em] text-primary-bg/70">Polije Cafe</p>
            </div>
          </div>
          <p class="mt-6 max-w-sm text-sm leading-relaxed text-primary-bg/80">
            Ruang kafe & kantin modern untuk civitas akademika Politeknik Negeri Jember — tempat
            ngopi, nugas, dan nongkrong yang lebih tertata berkat digital ordering.
          </p>

          <div class="mt-6 flex items-center gap-3">
            <a
              v-for="s in socials"
              :key="s.label"
              :href="s.href"
              :aria-label="s.label"
              :data-testid="`footer-social-${s.label.toLowerCase()}`"
              class="grid h-11 w-11 place-items-center rounded-full bg-primary-bg/10 text-primary-bg transition-all duration-300 hover:-translate-y-1 hover:bg-primary-bg hover:text-hover-card"
            >
              <font-awesome-icon :icon="['fa-brands', s.icon]"></font-awesome-icon>
            </a>
          </div>
        </div>

        <!-- Kontak -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-bg/70">Kontak</p>
          <ul class="mt-5 space-y-4 text-sm">
            <li
              v-for="c in contact"
              :key="c.label"
              class="flex items-start gap-3 text-primary-bg/85"
            >
              <font-awesome-icon
                :icon="['fa-solid', c.icon]"
                class="mt-1 text-primary-bg"
              ></font-awesome-icon>
              <span>{{ c.label }}</span>
            </li>
          </ul>
        </div>

        <!-- Info kampus -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-bg/70">
            Lokasi Kampus
          </p>
          <div class="mt-5 rounded-2xl border border-primary-bg/15 bg-primary-bg/5 p-5">
            <div class="flex items-center gap-3">
              <font-awesome-icon
                icon="fa-solid fa-graduation-cap "
                class="text-xl"
              ></font-awesome-icon>
              <p class="text-sm font-semibold">Politeknik Negeri Jember</p>
            </div>
            <p class="mt-3 text-xs leading-relaxed text-primary-bg/75">
              Jurusan Teknologi Informasi (JTI). Mudah dijangkau dari gedung kelas, parkir, dan
              perpustakaan kampus.
            </p>
            <a
              href="#"
              class="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary-bg/90 hover:text-white"
            >
              Lihat Peta <font-awesome-icon icon="fa-solid fa-arrow-right"></font-awesome-icon>
            </a>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div
        class="mt-16 flex flex-col items-start justify-between gap-4 border-t border-primary-bg/15 pt-6 text-xs text-primary-bg/70 sm:flex-row sm:items-center"
      >
        <p>&copy; {{ year }} Teras JTI · Politeknik Negeri Jember. Semua hak dilindungi.</p>
        <p>Dibuat untuk mendigitalisasi kantin kampus.</p>
      </div>
    </div>
  </footer>
</template>
