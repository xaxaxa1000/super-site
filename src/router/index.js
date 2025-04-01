// index.js
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import VideoGallery from '@/views/VideoGallery.vue';
import VideoPlayer from '@/views/VideoPlayer.vue';
import ForgotPassword from "@/views/ForgotPassword.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import Register from "@/views/Register.vue";
import Profile from "@/views/Profile.vue";


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
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    name: 'forgot-password'
  },
  {
    path: '/reset',
    component: ResetPassword,
    name: 'resetPassword'
  },
  {
    path: '/register',
    component: Register,
    name: 'register'
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true } // Добавьте защиту для роута
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;