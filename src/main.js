import { createApp } from "vue";
import VueGoogleMaps from '@fawmi/vue-google-maps';
import App from "./App.vue";

const app = createApp(App);

app.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCbDwWwkpQrD04Z_0OtZka_Y3A7qPOxpf4',
    libraries: "places"
  },
}).mount("#app");