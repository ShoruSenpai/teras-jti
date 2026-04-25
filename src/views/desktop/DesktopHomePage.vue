<!--
  DesktopView.vue — Halaman /desktop (Company Profile)
  ==========================================================
  Merakit semua section menjadi satu halaman full.
  Halaman ini ditampilkan untuk pengguna DESKTOP yang tidak dapat
  melakukan ordering (ordering khusus mobile/tablet).
-->
<script setup>
import Navbar from "@/components/desktop/Navbar.vue";
import HeroSection from "@/components/desktop/HeroSection.vue";
import AboutSection from "@/components/desktop/AboutSection.vue";
import FeatureSection from "@/components/desktop/FeatureSection.vue";
import Footer from "@/components/desktop/Footer.vue";
</script>

<template>
  <div
    class="min-h-screen bg-primary-bg font-quicksand cursor-default bg-primary-bg text-text-dark"
  >
    <Navbar />
    <main>
      <HeroSection />
      <AboutSection />
      <FeatureSection />
    </main>
    <Footer />
  </div>
</template>
