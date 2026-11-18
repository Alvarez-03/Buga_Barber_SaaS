<template>
  <div class="min-h-screen bg-barber-light text-barber-dark flex flex-col">
    <!-- Renderizado dinámico de las rutas (Home, Perfil de Barbería, Paneles) -->
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  // Inicializa y verifica si hay una sesión OAuth activa en Pinia al cargar la app
  await authStore.initSession()
})
</script>