import { createApp } from 'vue';
import router from './router'
import App from './views/App.vue';
import 'bootstrap/dist/css/bootstrap.min.css';

createApp(App).use(router).mount('#app');