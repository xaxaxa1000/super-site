// index.js
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/views/App.vue'
import Home from '@/views/Home.vue'
import Video from '@/views/Video.vue'
//import Login from '@/views/Login.vue'
import VideoList from '../views/VideoList.vue'
import VideoPlayer from '../views/VideoPlayer.vue'


const routes = [
  {
    path: '/',
    component: VideoList
  },
  {
    path: '/video/:id', // URL будет выглядеть как /video/zlBWZEJ_nh8
    name: 'VideoPlayer', // Это имя должно совпадать с тем, что в router-link
    component: VideoPlayer, // Убедитесь, что компонент существует
    props: true // Если хотите передавать id как prop
  },
  //{
  //  path: '/login',
  //  name: 'Login',
  //  component: Login
  //}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router