import { createApp } from 'vue';
import router from './router'
import App from './views/App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'; // Стили BootstrapVue
import { BootstrapVue3 } from 'bootstrap-vue-3';

createApp(App).use(router).use(BootstrapVue3).mount('#app');