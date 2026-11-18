<template>
    <div class="min-h-screen bg-barber-light pb-12">
      <!-- Navbar Superior -->
      <Navbar />
  
      <!-- Barra de Filtros Integrada en Azul Oscuro -->
      <div class="bg-barber-dark p-4 md:px-8">
        <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <!-- Botones de Filtro -->
          <div class="flex items-center space-x-2 overflow-x-auto no-scrollbar">
            <button 
              @click="filtroActual = 'local'"
              :class="filtroActual === 'local' 
                ? 'bg-barber-red text-white font-bold shadow-sm' 
                : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
              class="px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors"
            >
              Locales aliados
            </button>
    
            <button 
              @click="filtroActual = 'independiente'"
              :class="filtroActual === 'independiente' 
                ? 'bg-barber-red text-white font-bold shadow-sm' 
                : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
              class="px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors"
            >
              A domicilio
            </button>
    
            <button 
              @click="filtroActual = 'abiertos'"
              :class="filtroActual === 'abiertos' 
                ? 'bg-barber-red text-white font-bold shadow-sm' 
                : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
              class="px-4 py-2 rounded-full text-xs whitespace-nowrap transition-colors"
            >
              Abiertos ahora
            </button>
          </div>
  
          <span class="text-xs text-slate-400 hidden md:block">
            Guadalajara de Buga, Valle del Cauca
          </span>
        </div>
      </div>
  
      <!-- Contenedor Principal Adaptativo: 2 columnas en PC, 1 columna en Celular -->
      <div class="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <!-- COLUMNA IZQUIERDA: Listado de Negocios y Buscador (Ocupa 6 o 7 columnas en PC) -->
          <div class="md:col-span-6 lg:col-span-7 space-y-4 order-2 md:order-1">
            <!-- Título Dinámico con Contador -->
            <div class="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <h1 class="text-base font-extrabold text-barber-dark tracking-tight">
                {{ tituloSeccion }} • {{ negociosFiltrados.length }}
              </h1>
              <span class="text-xs font-medium text-slate-500">Resultados en vivo</span>
            </div>
    
            <!-- Estado de Carga -->
            <div v-if="loading" class="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
              <div class="w-8 h-8 border-4 border-barber-red border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-slate-500">Conectando con barberías en Buga...</p>
            </div>
    
            <!-- Estado Vacío -->
            <div v-else-if="negociosFiltrados.length === 0" class="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-sm space-y-1.5">
              <p class="text-sm font-bold text-barber-dark">No hay resultados disponibles</p>
              <p class="text-xs text-slate-500">Intenta seleccionando otra categoría en la barra superior.</p>
            </div>
    
            <!-- Listado de Tarjetas -->
            <div v-else class="space-y-3.5">
              <BusinessCard 
                v-for="negocio in negociosFiltrados" 
                :key="negocio.id" 
                :negocio="negocio" 
              />
            </div>
          </div>
  
          <!-- COLUMNA DERECHA: Mapa Interactivo Fijo/Sticky en PC (Ocupa 6 o 5 columnas) -->
          <div class="md:col-span-6 lg:col-span-5 order-1 md:order-2 md:sticky md:top-24">
            <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 h-72 md:h-[calc(100vh-10rem)] min-h-[350px]">
              <LeafletMap :negocios="negociosFiltrados" class="w-full h-full" />
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { toast } from 'vue3-toastify'
  import { supabase } from '@/services/supabase'
  import { barberService } from '@/services/barberService'
  import Navbar from '@/components/Navbar.vue'
  import LeafletMap from '@/components/LeafletMap.vue'
  import BusinessCard from '@/components/ui/BusinessCard.vue'
  
  const negocios = ref([])
  const loading = ref(true)
  const filtroActual = ref('local') // 'local' | 'independiente' | 'abiertos'
  let realtimeChannel = null
  
  async function cargarDirectorio() {
    try {
      negocios.value = await barberService.getNegociosActivos()
    } catch (error) {
      console.error('Error al cargar directorio:', error)
      toast.error('No se pudo conectar con la base de datos')
    } finally {
      loading.value = false
    }
  }
  
  onMounted(async () => {
    await cargarDirectorio()
  
    // Suscripción en vivo a la tabla 'barberos' para actualizar estados Abierto/Cerrado y filas
    realtimeChannel = supabase
      .channel('public:barberos-directory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barberos' }, () => {
        cargarDirectorio()
      })
      .subscribe()
  })
  
  onUnmounted(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
    }
  })
  
  const tituloSeccion = computed(() => {
    if (filtroActual.value === 'local') return 'Barberías aliadas'
    if (filtroActual.value === 'independiente') return 'Barberos a domicilio'
    return 'Abiertos ahora'
  })
  
  const negociosFiltrados = computed(() => {
    return negocios.value.filter(negocio => {
      if (filtroActual.value === 'local') {
        return negocio.tipo === 'local'
      }
      if (filtroActual.value === 'independiente') {
        return negocio.tipo === 'independiente'
      }
      if (filtroActual.value === 'abiertos') {
        return negocio.barberos && negocio.barberos.some(b => b.activo)
      }
      return true
    })
  })
  </script>