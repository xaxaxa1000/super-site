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
    path: '/video/:id',
    component: VideoPlayer,
    props: true
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