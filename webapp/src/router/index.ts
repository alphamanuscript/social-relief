import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/home/home.vue'

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
    path: '/how-it-works',
    name: 'how-it-works',
    component: () => import(/* webpackChunkName: "how-it-works" */ '../views/how-it-works.vue')
  },
  {
    path: '/invitations/:link_code',
    name: 'accept-invitation',
    component: () => import(/* webpackChunkName: "accept-invitation" */ '../views/accept-invitation.vue')
  },
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import(/* webpackChunkName: "sign-in" */ '../views/sign-in.vue')
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import(/* webpackChunkName: "sign-up" */ '../views/sign-up.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
