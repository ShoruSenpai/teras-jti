<!--
  Navbar.vue — Sticky header Teras JTI
  ==========================================================
  GANTI / CUSTOM:
  - Logo placeholder: lihat <img src="/logo-placeholder.svg" />.
    Ganti file di /public/logo-placeholder.svg atau ubah src.
  - Link section: props `links` (array) — tambah/hapus sesuai kebutuhan.
  - Warna: pakai token tema (bg-primary-bg, text-primary-card, dst).
-->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Daftar link navigasi — ubah di sini untuk menambah section
const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#kontak", label: "Kontak" },
];

const scrolled = ref(false);
const mobileOpen = ref(false);

const onScroll = () => {
  scrolled.value = window.scrollY > 12;
};
onMounted(() => window.addEventListener("scroll", onScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled
        ? 'bg-primary-bg/85 backdrop-blur-xl shadow-[0_6px_24px_-12px_rgba(92,58,33,0.25)]'
        : ' bg-transparent',
    ]"
    data-testid="main-navbar"
  >
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
      <!-- ===== Logo ===== -->
      <a href="#top" class="group flex items-center gap-3" data-testid="navbar-logo">
        <!-- Placeholder logo: ganti src di /public/logo-placeholder.svg -->
        <span
          class="grid h-11 w-11 place-items-center rounded-2xl bg-primary-card text-white shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105"
        >
          <font-awesome-icon icon="fa-solid fa-mug-hot" class="text-lg"></font-awesome-icon>
        </span>
        <div class="leading-tight">
          <p class="text-lg font-bold tracking-tight text-text-dark">
            Teras <span class="text-primary-card">JTI</span>
          </p>
          <p class="text-[11px] font-medium uppercase tracking-[0.2em] text-text-muted">
            Polije Cafe
          </p>
        </div>
      </a>

      <!-- ===== Nav Links (desktop) ===== -->
      <nav class="hidden items-center gap-10 md:flex">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          :data-testid="`navlink-${l.label.toLowerCase()}`"
          class="relative text-sm font-semibold text-text-dark/80 transition-colors hover:text-primary-card"
        >
          {{ l.label }}
          <span
            class="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary-card transition-all duration-300 group-hover:w-full"
          ></span>
        </a>
      </nav>

      <!-- ===== CTA Kanan ===== -->
      <div class="hidden items-center gap-3 md:flex">
        <a
          href="#kontak"
          data-testid="navbar-cta"
          class="inline-flex items-center gap-2 rounded-full bg-primary-card px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-hover-card hover:shadow-lg hover:shadow-hover-card/20"
        >
          <font-awesome-icon icon="fa-solid fa-location-dot"></font-awesome-icon>
          Kunjungi Kami
        </a>
      </div>

      <!-- ===== Mobile toggle ===== -->
      <button
        class="grid h-11 w-11 place-items-center rounded-xl bg-primary-container-2 text-primary-card md:hidden"
        @click="mobileOpen = !mobileOpen"
        data-testid="navbar-mobile-toggle"
        aria-label="Buka menu"
      >
        <font-awesome-icon
          :icon="['fa-solid', mobileOpen ? 'fa-xmark' : 'fa-bars']"
        ></font-awesome-icon>
      </button>
    </div>

    <!-- ===== Mobile dropdown ===== -->
    <div
      v-show="mobileOpen"
      class="md:hidden border-t border-primary-container-2 bg-primary-bg/95 backdrop-blur-xl"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          class="rounded-xl px-4 py-3 text-sm font-semibold text-text-dark hover:bg-primary-container-2"
          @click="mobileOpen = false"
          >{{ l.label }}</a
        >
      </div>
    </div>
  </header>
</template>
