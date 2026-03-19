<script setup></script>

<template>
  <div
    class="min-h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex flex-col items-center text-accent-dinein"
  >
    <!-- banner logo -->
    <div class="mx-auto py-8 sm:py-10 md:py-12 lg:py-16">
      <img src="/assets/images/logo.webp" alt="teras-logo" class="h-24 sm:h-28 md:h-36 lg:h-44" />
    </div>

    <!-- card container -->
    <div
      class="bg-primary-dinein-bg py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8 w-full flex-1 flex flex-col items-center rounded-t-4xl gap-6 shadow-dinein-hard"
    >
      <!-- card dine-in -->
      <div
        class="bg-primary-container-dinein-bg p-4 sm:p-5 md:p-6 rounded-2xl shadow-dinein-card hover:shadow-dinein-semi flex flex-col gap-6 duration-300 w-full sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <!-- content -->
        <div class="flex flex-row items-center gap-4 sm:flex-col sm:text-center sm:gap-5 md:gap-6">
          <!-- icon -->
          <div
            class="bg-secondary-dinein-bg p-4 sm:p-5 md:p-6 rounded-full flex items-center justify-center shadow-dinein-card"
          >
            <font-awesome-icon
              icon="fa-solid fa-mug-hot"
              class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            />
          </div>

          <!-- description -->
          <div class="flex flex-col gap-1 sm:gap-2 md:gap-3">
            <h1 class="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">Dine In</h1>
            <p class="font-normal text-xs sm:text-sm md:text-base lg:text-lg">
              Ketuk untuk memulai pesan atau scan qr di meja
            </p>
          </div>
        </div>

        <!-- button -->
        <RouterLink
          to="/dine-in/menu"
          class="bg-primary-dinein-card hover:bg-secondary-dinein-card rounded-md shadow-dinein-soft text-on-primary-container flex justify-center duration-300"
        >
          <h1 class="font-bold text-base sm:text-lg md:text-xl lg:text-2xl py-2 md:py-3">
            Mulai Pesan
          </h1>
        </RouterLink>
      </div>

      <!-- card reservation -->
      <div
        class="bg-primary-container-dinein-bg p-4 sm:p-5 md:p-6 rounded-2xl shadow-dinein-card hover:shadow-dinein-semi flex flex-col gap-6 duration-300 w-full sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <!-- content -->
        <div class="flex flex-row items-center gap-4 sm:flex-col sm:text-center sm:gap-5 md:gap-6">
          <!-- icon -->
          <div
            class="bg-secondary-dinein-bg p-4 sm:p-5 md:p-6 rounded-full flex items-center justify-center shadow-dinein-card"
          >
            <font-awesome-icon
              icon="fa-solid fa-chair"
              class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            />
          </div>

          <!-- description -->
          <div class="flex flex-col gap-1 sm:gap-2 md:gap-3">
            <h1 class="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">Reservation</h1>
            <p class="font-normal text-xs sm:text-sm md:text-base lg:text-lg">
              Reservasi meja lebih mudah di mana saja dan pre-order menu
            </p>
          </div>
        </div>

        <!-- button -->
        <RouterLink
          to="/reservation"
          class="bg-primary-dinein-card hover:bg-secondary-dinein-card rounded-md shadow-dinein-soft text-on-primary-container flex justify-center duration-300"
        >
          <h1 class="font-bold text-base sm:text-lg md:text-xl lg:text-2xl py-2 md:py-3">
            Mulai Pesan
          </h1>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
