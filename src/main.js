import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import FontAwesomeIcon from "@/plugins/fontawesome";

// tailwind setup
import "@/styles/main.css";

// custom tailwindcss assets
import "@/styles/colors.css";
import "@/styles/font.css";
import "@/styles/shadow.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
