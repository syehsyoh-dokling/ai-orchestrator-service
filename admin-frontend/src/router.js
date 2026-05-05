import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import PromptManagerView from './views/PromptManagerView.vue'
import SocialSchedulerView from './views/SocialSchedulerView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'PromptManager',
    component: PromptManagerView,
    meta: { requiresAuth: true }
  },
  {
    path: '/social-scheduler',
    name: 'SocialScheduler',
    component: SocialSchedulerView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
