// index.js
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import VideoGallery from '@/views/VideoGallery.vue';
import VideoPlayer from '@/views/VideoPlayer.vue';


const routes = [
  {
    path: '/',
    redirect: '/home' // Перенаправление с корня на /home
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '', // Дефолтный маршрут для /home
        component: VideoGallery
      },
      {
        path: 'video/:id', // Динамический параметр ID
        component: VideoPlayer,
        name: 'video' // Именованный маршрут для удобства
      }
    ]
  },
  {
    path: '/login',
    component: Login
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;