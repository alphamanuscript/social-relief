import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/about.vue')
  },
  {
    path: '/donate',
    name: 'donate',
    component: () => import(/* webpackChunkName: "about" */ '../views/donate.vue')
  },
  {
    path: '/how-it-works',
    name: 'how-it-works',
    component: () => import(/* webpackChunkName: "about" */ '../views/how-it-works.vue')
  },
  {
    path: '/donor-signup',
    name: 'donor-signup',
    component: () => import(/* webpackChunkName: "about" */ '../views/donor-signup.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
