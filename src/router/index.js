import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/public/HomeDirectory.vue')
  },
  {
    path: '/negocio/:slug',
    name: 'business-profile',
    component: () => import('@/views/public/BusinessProfile.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/public/LoginView.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/barbero/panel',
    name: 'barber-panel',
    component: () => import('@/views/barber/BarberPanel.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await authStore.initSession()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router