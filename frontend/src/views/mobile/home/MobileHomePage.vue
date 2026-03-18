<script setup></script>

<template class="h-screen w-screen">
  <div
    class="h-screen w-full font-[quicksand] bg-linear-to-b from-primary-dinein via-accent-dinein to-primary-dinein flex justify-center items-start flex-col"
  >
    <!-- banner logo -->
    <div class="mx-auto py-12">
      <img src="/assets/images/logo.webp" alt="teras-logo" class="h-32" />
    </div>
    <!-- card dine-in & reservation -->
    <div
      class="bg-primary-dinein-bg py-12 px-6 h-full w-full flex justify-start items-center flex-col rounded-t-4xl gap-6 shadow-dinein-hard"
    >
      <!-- card dine-in -->
      <div
        class="bg-primary-container-dinein-bg p-6 rounded-2xl shadow-dinein-card hover:shadow-dinein-semi flex flex-col w-full gap-6 duration-300"
      >
        <!-- content -->
        <div class="flex text-accent-dinein gap-6">
          <!-- icon -->
          <div
            class="bg-secondary-dinein-bg p-4 rounded-full justify-center items-center h-fit w-fit shadow-dinein-card"
          >
            <font-awesome-icon icon="fa-solid fa-mug-hot" class="text-3xl" />
          </div>
          <!-- description -->
          <div class="flex flex-col">
            <!-- headline -->
            <h1 class="font-bold text-2xl">Dine In</h1>
            <!-- paragraph -->
            <p class="font-normal text-xs">Ketuk untuk memulai pesan atau scan qr di meja</p>
          </div>
        </div>
        <!-- btn route -->
        <RouterLink
          to="/dine-in/menu"
          class="bg-primary-dinein-card hover:bg-secondary-dinein-card rounded-md shadow-dinein-soft text-on-primary-container flex justify-center duration-300"
        >
          <h1 class="font-bold text-lg py-1">Mulai Pesan</h1>
        </RouterLink>
      </div>
      <!-- card reservation -->
      <div
        class="bg-primary-container-dinein-bg p-6 rounded-2xl shadow-dinein-card hover:shadow-dinein-semi flex flex-col w-full gap-6 duration-300"
      >
        <!-- content -->
        <div class="flex text-accent-dinein gap-6">
          <!-- icon -->
          <div
            class="bg-secondary-dinein-bg p-4 rounded-full justify-center items-center h-fit w-fit shadow-dinein-card"
          >
            <font-awesome-icon icon="fa-solid fa-chair" class="text-3xl" />
          </div>
          <!-- description -->
          <div class="flex flex-col">
            <!-- headline -->
            <h1 class="font-bold text-2xl">Reservation</h1>
            <!-- paragraph -->
            <p class="font-normal text-xs">
              Reservasi meja lebih mudah di mana saja dan pre-order menu
            </p>
          </div>
        </div>
        <!-- btn route -->
        <RouterLink
          to="/reservation"
          class="bg-primary-dinein-card hover:bg-secondary-dinein-card rounded-md shadow-dinein-soft text-on-primary-container flex justify-center duration-300"
        >
          <h1 class="font-bold text-lg py-1">Mulai Pesan</h1>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
