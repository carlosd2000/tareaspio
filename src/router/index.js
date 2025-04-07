import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import About from '../components/About.vue'
import Kanboard from '../components/Kanboard.vue'  // 👈 IMPORTAMOS el Kanboard

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/kanboard',   // 👈 NUEVA RUTA para Kanban
    name: 'Kanboard',
    component: Kanboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
