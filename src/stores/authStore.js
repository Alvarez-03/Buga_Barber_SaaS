import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

function normalizarRol(rol) {
  return String(rol || '').trim().toLowerCase()
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const barbero = ref(null)
  const negocio = ref(null)
  const loading = ref(true)
  const noRegistrado = ref(false)

  // Solo está autenticado si tiene sesión Y existe en la tabla barberos
  const isAuthenticated = computed(() => !!session.value?.access_token && !!barbero.value?.id)

  // Rol efectivo normalizado:
  // - Si tiene rol admin_barberia y negocio vinculado -> admin_barberia
  // - Si no tiene negocio vinculado -> barbero_independiente
  // - En otro caso con negocio -> barbero_local
  const userRole = computed(() => {
    const b = barbero.value
    if (!b?.id) return null

    const rolRaw = normalizarRol(b.rol)
    const negocioId = b.negocios_id || negocio.value?.id || null

    if (rolRaw === 'admin_barberia') {
      return 'admin_barberia'
    }

    if (!negocioId) {
      return 'barbero_independiente'
    }

    return rolRaw === 'barbero_independiente' ? 'barbero_independiente' : 'barbero_local'
  })

  const isAdmin = computed(() => userRole.value === 'admin_barberia')

  const defaultHomeRoute = computed(() => {
    if (!isAuthenticated.value) return '/barbero/login'
    return isAdmin.value ? '/admin/equipo' : '/barbero/fila'
  })

  async function cargarDatosBarbero(currentUser) {
    if (!currentUser) {
      barbero.value = null
      negocio.value = null
      return
    }

    try {
      const { data, error } = await supabase
        .from('barberos')
        .select(`
          *,
          negocios ( id, nombre, slug_url, tipo, direccion, precio_base, telefono, logo_url, estado_suscripcion, lat, lng )
        `)
        .or(`user_id.eq.${currentUser.id},email.eq.${currentUser.email}`)
        .maybeSingle()

      if (error) throw error

      // Si el correo de Google NO existe en la tabla barberos, denegar acceso y cerrar sesión
      if (!data) {
        noRegistrado.value = true
        await supabase.auth.signOut()
        session.value = null
        user.value = null
        barbero.value = null
        negocio.value = null
        return
      }

      const rolNormalizado = normalizarRol(data.rol) || (data.negocios_id ? 'barbero_local' : 'barbero_independiente')
      data.rol = rolNormalizado

      // Vincular user_id si es su primer inicio de sesión
      if (!data.user_id) {
        await supabase
          .from('barberos')
          .update({ user_id: currentUser.id })
          .eq('id', data.id)
        data.user_id = currentUser.id
      }

      // Si no tiene negocio vinculado y no es admin_barberia, asegurar rol barbero_independiente
      if (!data.negocios_id && rolNormalizado !== 'admin_barberia' && rolNormalizado !== 'barbero_independiente') {
        await supabase
          .from('barberos')
          .update({ rol: 'barbero_independiente' })
          .eq('id', data.id)
        data.rol = 'barbero_independiente'
      }

      noRegistrado.value = false
      barbero.value = data
      negocio.value = data.negocios || null
    } catch (error) {
      console.error('Error al validar usuario:', error)
      barbero.value = null
      negocio.value = null
    }
  }

  async function initSession() {
    loading.value = true
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user || null
      await cargarDatosBarbero(user.value)

      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
        await cargarDatosBarbero(user.value)
      })
    } catch (error) {
      console.error('Error al inicializar sesión:', error)
    } finally {
      loading.value = false
    }
  }

  async function loginWithEmail(email, password) {
    noRegistrado.value = false
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    session.value = data.session
    user.value = data.user
    await cargarDatosBarbero(data.user)
    return data
  }

  async function loginWithGoogle(redirectPath = '/barbero/fila') {
    noRegistrado.value = false
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`
      }
    })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
    barbero.value = null
    negocio.value = null
  }

  return {
    user,
    session,
    barbero,
    negocio,
    loading,
    noRegistrado,
    isAuthenticated,
    userRole,
    isAdmin,
    defaultHomeRoute,
    initSession,
    loginWithEmail,
    loginWithGoogle,
    logout,
    cargarDatosBarbero
  }
})