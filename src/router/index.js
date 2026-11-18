import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeDirectory from '@/views/public/HomeDirectory.vue'
import BusinessProfile from '../views/public/BusinessProfile.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeDirectory
  },
  {
    path: '/negocio/:slug',
    name: 'business-profile',
    component: BusinessProfile
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