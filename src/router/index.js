import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeDirectory from '../views/public/HomeDirectory.vue'
import BusinessProfile from '../views/public/BusinessProfile.vue'
import LoginBarber from '../views/barber/LoginBarber.vue'
import BarberLayout from '../views/barber/BarberLayout.vue'
import BarberQueueView from '../views/barber/BarberQueueView.vue'
import BarberAgendaView from '../views/barber/BarberAgendaView.vue'
import BarberProfileView from '../views/barber/BarberProfileView.vue'
import AdminNavbar from '../components/AdminNavbar.vue'
import AdminTeamView from '../views/admin/AdminTeamView.vue'
import AdminBusinessView from '../views/admin/AdminBusinessView.vue'
import LandingView from '../views/public/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: LandingView },
    { path: '/directorio', name: 'home', component: HomeDirectory },
    { path: '/negocio/:slug', name: 'business-profile', component: BusinessProfile },
    { path: '/barbero/login', name: 'barber-login', component: LoginBarber },

    // Rutas de Barbero (Local e Independiente)
    {
      path: '/barbero',
      component: BarberLayout,
      redirect: '/barbero/fila',
      meta: { requiresAuth: true, roles: ['barbero_local', 'barbero_independiente', 'admin_barberia'] },
      children: [
        {
          path: 'fila',
          name: 'barber-queue',
          component: BarberQueueView,
          meta: { requiresAuth: true, roles: ['barbero_local', 'barbero_independiente'] }
        },
        {
          path: 'agenda',
          name: 'barber-agenda',
          component: BarberAgendaView,
          meta: { requiresAuth: true, roles: ['barbero_local', 'barbero_independiente'] }
        },
        {
          path: 'perfil',
          name: 'barber-profile',
          component: BarberProfileView,
          meta: { requiresAuth: true, roles: ['barbero_local', 'barbero_independiente', 'admin_barberia'] }
        }
      ]
    },

    // Rutas de Administrador de Barbería
    {
      path: '/admin',
      component: AdminNavbar,
      redirect: '/admin/equipo',
      meta: { requiresAuth: true, roles: ['admin_barberia'] },
      children: [
        {
          path: 'equipo',
          name: 'admin-team',
          component: AdminTeamView,
          meta: { requiresAuth: true, roles: ['admin_barberia'] }
        },
        {
          path: 'negocio',
          name: 'admin-business',
          component: AdminBusinessView,
          meta: { requiresAuth: true, roles: ['admin_barberia'] }
        }
      ]
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.loading) {
    await authStore.initSession()
  }

  const requiereAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const rolesPermitidos = to.matched
    .flatMap((record) => record.meta?.roles || [])

  if (requiereAuth && !authStore.isAuthenticated) {
    return { name: 'barber-login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'barber-login' && authStore.isAuthenticated) {
    return authStore.isAdmin ? { name: 'admin-team' } : { name: 'barber-queue' }
  }

  // Si es admin_barberia y cae en /barbero o /barbero/fila, llevarlo a /admin/equipo
  if (authStore.isAdmin && (to.path === '/barbero' || to.path === '/barbero/' || to.name === 'barber-queue')) {
    return { name: 'admin-team' }
  }

  if (requiereAuth && rolesPermitidos.length > 0 && !rolesPermitidos.includes(authStore.userRole)) {
    return authStore.isAdmin ? { name: 'admin-team' } : { name: 'barber-queue' }
  }
})

export default router