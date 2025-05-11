import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import VideoGallery from '@/views/VideoGallery.vue';
import VideoPlayer from '@/views/VideoPlayer.vue';
import ForgotPassword from "@/views/ForgotPassword.vue";
import ResetPassword from "@/views/ResetPassword.vue";
import Register from "@/views/Register.vue";
import Profile from "@/views/Profile.vue";
import TestPage from "@/views/TestPage.vue";
import LabTask from "@/views/LabTask.vue";
import VideoGalleryApplicant from "@/views/VideoGalleryApplicant.vue";
//import component from "*.vue"; // Убедитесь, что импорт корректен

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '',
        component: VideoGallery
      },
      {
        path: 'video/:id',
        component: VideoPlayer,
        name: 'video'
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
    meta: { requiresAuth: true }
  },
  {
    path: '/test/:testId',
    name: 'test',
    component: TestPage,
    props: true
  },
  {
    path: '/lab/:labId/tasks',
    name: 'LabTask', // Имя должно совпадать с router.push({ name: 'LabTask' })
    component: LabTask,
    meta: { requiresAuth: true },
  },
  {
    path: '/applicant',
    component: Home,
    children: [
      {
        path: '',
        component: VideoGalleryApplicant
      }
    ],
  },
  {
    path: '/search/:query',
    name: 'search',
    component: VideoGallery,
  },
];

//{
//  path: '/home',
//      component: Home,
//    children: [
//  {
//    path: '',
//    component: VideoGallery
//  },
//  {
//    path: 'video/:id',
//    component: VideoPlayer,
//    name: 'video'
//  }
//]
//},


const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;