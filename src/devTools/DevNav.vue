<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const isOpen = ref(false);
const router = useRouter();

const routeGroups = computed(() => {
  const allRoutes = router.options.routes;

  return allRoutes
    .filter((parent) => parent.path === "/")
    .map((parent) => {
      const dineInRoutes = parent.children.filter((c) => c.path.startsWith("dine-in"));
      const reservationRoutes = parent.children.filter((c) => c.path.startsWith("reservation"));
      const otherRoutes = parent.children.filter(
        (c) => !c.path.startsWith("dine-in") && !c.path.startsWith("reservation"),
      );

      return [
        {
          name: "General",
          parentPath: parent.path,
          children: otherRoutes,
        },
        {
          name: "Dine In",
          parentPath: parent.path,
          children: dineInRoutes,
        },
        {
          name: "Reservatiton",
          parentPath: parent.path,
          children: reservationRoutes,
        },
      ];
    })
    .flat()
    .filter((group) => group.children.length > 0);
});

const generatePath = (parentPath, childPath) => {
  let fullPath = `${parentPath}/${childPath}`.replace(/\/+/g, "/");

  // Replace token sesuai modulnya
  if (fullPath.includes(":token")) {
    if (fullPath.includes("dine-in")) {
      fullPath = fullPath.replace(":token", "MASTER-DEV-DN");
    } else if (fullPath.includes("reservation")) {
      fullPath = fullPath.replace(":token", "MASTER-DEV-RST");
    }
  }

  return fullPath;
};

onMounted(() => {
  // console.log("route list: ", router.options.routes);
});
</script>

<template>
  <div class="fixed bottom-5 right-5 z-50 font-sans">
    <button
      @click="isOpen = !isOpen"
      class="bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all"
    >
      <span v-if="!isOpen">🛠️ Dev Menu</span>
      <span v-else>✕ Close</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute bottom-16 right-0 w-72 max-h-[80vh] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto"
    >
      <div class="p-4 bg-gray-50 border-b border-gray-200">
        <h3 class="font-bold text-gray-700">Teras JTI Debug Menu</h3>
        <p class="text-xs text-gray-500">Quick access to all routes</p>
      </div>

      <div v-for="group in routeGroups" :key="group.name" class="p-2">
        <div class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          {{ group.name }}
        </div>

        <router-link
          v-for="route in group.children"
          :key="route.path"
          :to="generatePath(group.parentPath, route.path)"
          @click="isOpen = false"
          class="block px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
        >
          <div class="font-medium">{{ route.name || "Unnamed Route" }}</div>
          <div class="text-[10px] text-gray-400 font-mono">
            {{ generatePath(group.parentPath, route.path) }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>
