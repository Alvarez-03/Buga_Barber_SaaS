<template>
    <div class="min-h-dvh w-full bg-slate-50 text-slate-900 flex flex-col">
      <!-- Barra Superior solo visible en PC (md+) -->
      <header class="hidden md:block bg-[#0b1329] text-white border-b border-slate-800 sticky top-0 z-40">
        <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
            <span class="font-black text-lg tracking-tight">
              Barber<span class="text-[#ef4444]">Buga</span>
            </span>
            <span class="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold ml-1">
              Panel Barbero
            </span>
          </div>
  
          <div class="flex items-center gap-3">
            <nav class="flex items-center gap-2">
              <router-link
                to="/barbero/fila"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 [&.router-link-active]:bg-[#991b1b] [&.router-link-active]:text-white transition"
              >
                Fila en vivo
              </router-link>
              <router-link
                to="/barbero/agenda"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 [&.router-link-active]:bg-[#991b1b] [&.router-link-active]:text-white transition"
              >
                Agenda
              </router-link>
              <router-link
                to="/barbero/perfil"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 [&.router-link-active]:bg-[#991b1b] [&.router-link-active]:text-white transition"
              >
                Mi perfil
              </router-link>
            </nav>
  
            <button
              type="button"
              @click="cerrarSesion"
              :disabled="cerrandoSesion"
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white bg-rose-950/60 hover:bg-[#991b1b] border border-rose-800/50 disabled:opacity-50 flex items-center gap-1.5 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
              </svg>
              <span>{{ cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión' }}</span>
            </button>
          </div>
        </div>
      </header>
  
      <!-- Contenido principal: ocupa todo el ancho en móvil y se centra en PC -->
      <main class="flex-1 w-full max-w-4xl mx-auto pb-24 md:pb-10">
        <router-view />
      </main>
  
      <!-- Barra de Navegación Inferior fija solo en Móvil (< md) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2.5 flex justify-around items-center z-40 shadow-lg">
        <router-link
          to="/barbero/fila"
          class="flex flex-col items-center gap-1 text-slate-400 [&.router-link-active]:text-[#991b1b] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span class="text-[10px] font-bold">Fila</span>
        </router-link>
  
        <router-link
          to="/barbero/agenda"
          class="flex flex-col items-center gap-1 text-slate-400 [&.router-link-active]:text-[#991b1b] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-[10px] font-bold">Agenda</span>
        </router-link>
  
        <router-link
          to="/barbero/perfil"
          class="flex flex-col items-center gap-1 text-slate-400 [&.router-link-active]:text-[#991b1b] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-[10px] font-bold">Perfil</span>
        </router-link>
  
        <button
          type="button"
          @click="cerrarSesion"
          :disabled="cerrandoSesion"
          class="flex flex-col items-center gap-1 text-slate-400 hover:text-[#991b1b] disabled:opacity-50 transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
          </svg>
          <span class="text-[10px] font-bold">{{ cerrandoSesion ? 'Saliendo' : 'Salir' }}</span>
        </button>
      </nav>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { toast } from 'vue3-toastify'
  import { useAuthStore } from '@/stores/authStore'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const cerrandoSesion = ref(false)
  
  async function cerrarSesion() {
    if (cerrandoSesion.value) return
    cerrandoSesion.value = true
    try {
      await authStore.logout()
      router.push('/barbero/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
      toast.error('No se pudo cerrar sesión')
    } finally {
      cerrandoSesion.value = false
    }
  }
  </script>