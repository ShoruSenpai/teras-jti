import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// tailwind setup
import "@/styles/main.css";

// custom tailwindcss assets
import "@/styles/colors.css";
import "@/styles/font.css";
import "@/styles/shadow.css";

// fontawesome init
import { library } from "@fortawesome/fontawesome-svg-core";

// fontawesome icon component
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// import icon
import { faMugHot, faChair, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const app = createApp(App);

library.add(faMugHot, faChair, faShoppingCart);

app.use(createPinia());
app.use(router);
app.component("font-awesome-icon", FontAwesomeIcon);

app.mount("#app");
