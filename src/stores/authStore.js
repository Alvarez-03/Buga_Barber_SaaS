import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!session.value?.access_token)

  async function initSession() {
    loading.value = true
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user || null

      // Escuchar cambios de sesión en vivo (Login, Logout, refresco de token OAuth)
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user || null
      })
    } catch (error) {
      console.error('Error al inicializar sesión:', error)
    } finally {
      loading.value = false
    }
  }

  async function loginWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    session.value = data.session
    user.value = data.user
    return data
  }

  async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/dashboard`
      }
    })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    session.value = null
    user.value = null
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    initSession,
    loginWithEmail,
    loginWithGoogle,
    logout
  }
})