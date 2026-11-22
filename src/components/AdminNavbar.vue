<template>
    <div class="min-h-dvh w-full bg-slate-50 text-slate-900 flex flex-col">
      <!-- Barra superior en PC (md+) -->
      <header class="hidden md:block bg-[#0b1329] text-white border-b border-slate-800 sticky top-0 z-40">
        <div class="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <img 
                src="/logoBarberBuga.png" 
                alt="BugaBarber Logo" 
                class="w-12 h-12 object-contain rounded-lg" 
            />
            <span class="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-semibold ml-1">
              Panel Administrador
            </span>
          </div>
  
          <div class="flex items-center gap-3">
            <nav class="flex items-center gap-2">
              <router-link
                to="/admin/equipo"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 [&.router-link-active]:bg-[#991b1b] [&.router-link-active]:text-white transition"
              >
                Equipo
              </router-link>
              <router-link
                to="/admin/negocio"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/70 [&.router-link-active]:bg-[#991b1b] [&.router-link-active]:text-white transition"
              >
                Negocio
              </router-link>
            </nav>
  
            <button
              type="button"
              @click="cerrarSesion"
              class="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-200 hover:text-white bg-rose-950/60 hover:bg-[#991b1b] border border-rose-800/50 transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
  
      <!-- Contenido principal -->
      <main class="flex-1 w-full max-w-5xl mx-auto pb-24 md:pb-10">
        <router-view />
      </main>
  
      <!-- Barra inferior fija en móvil (< md) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2.5 flex justify-around items-center z-40 shadow-lg">
        <router-link
          to="/admin/equipo"
          class="flex flex-col items-center gap-1 text-slate-400 [&.router-link-active]:text-[#991b1b] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-[10px] font-bold">Equipo</span>
        </router-link>
  
        <router-link
          to="/admin/negocio"
          class="flex flex-col items-center gap-1 text-slate-400 [&.router-link-active]:text-[#991b1b] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span class="text-[10px] font-bold">Negocio</span>
        </router-link>
  
        <button
          type="button"
          @click="cerrarSesion"
          class="flex flex-col items-center gap-1 text-slate-400 hover:text-[#991b1b] transition cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
          </svg>
          <span class="text-[10px] font-bold">Salir</span>
        </button>
      </nav>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  
  const router = useRouter()
  const authStore = useAuthStore()
  
  async function cerrarSesion() {
    await authStore.logout()
    router.push('/barbero/login')
  }
  </script>