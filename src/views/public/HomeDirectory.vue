<template>
  <div class="min-h-screen bg-barber-light pb-12">
    <!-- Navbar Superior -->
    <Navbar />

    <!-- Barra de Filtros Integrada en Azul Oscuro -->
    <div class="bg-barber-dark p-3.5 sm:p-4 md:px-8">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <!-- Filtros de Categoría / Estado -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
          <button
            type="button"
            @click="filtroActual = 'todos'"
            :class="filtroActual === 'todos'
              ? 'bg-barber-red text-white font-bold shadow-sm'
              : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
            class="px-3.5 py-2 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Todos
          </button>

          <button
            type="button"
            @click="filtroActual = 'local'"
            :class="filtroActual === 'local'
              ? 'bg-barber-red text-white font-bold shadow-sm'
              : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
            class="px-3.5 py-2 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Barberias aliadas
          </button>

          <button
            type="button"
            @click="filtroActual = 'independiente'"
            :class="filtroActual === 'independiente'
              ? 'bg-barber-red text-white font-bold shadow-sm'
              : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
            class="px-3.5 py-2 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Servicio a casa
          </button>

          <button
            type="button"
            @click="filtroActual = 'abiertos'"
            :class="filtroActual === 'abiertos'
              ? 'bg-barber-red text-white font-bold shadow-sm'
              : 'bg-barber-navy text-slate-300 hover:text-white font-medium'"
            class="px-3.5 py-2 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            Abiertos ahora
          </button>
        </div>

        <!-- Filtros por Rango de Precio -->
        <div class="flex items-center justify-between sm:justify-start lg:justify-end gap-2">
          <label for="filtro-precio" class="text-[11px] font-semibold text-slate-300 whitespace-nowrap">
            Precio base:
          </label>
          <select
            id="filtro-precio"
            v-model="rangoPrecio"
            class="bg-barber-navy text-white text-xs font-semibold rounded-xl px-3 py-2 border border-white/10 focus:outline-none focus:border-barber-red cursor-pointer"
          >
            <option value="todos">Todos los precios</option>
            <option value="hasta_15000">Hasta $15.000</option>
            <option value="15001_25000">$15.001 – $25.000</option>
            <option value="mas_25000">Más de $25.000</option>
          </select>

          <button
            v-if="hayFiltrosActivos"
            type="button"
            @click="limpiarFiltros"
            class="text-[11px] font-bold text-rose-300 hover:text-white px-2.5 py-1.5 rounded-lg transition cursor-pointer"
          >
            Limpiar
          </button>

          <span class="text-xs text-slate-400 hidden xl:inline ml-2">
            Guadalajara de Buga, Valle del Cauca
          </span>
        </div>
      </div>
    </div>

    <!-- Contenedor Principal Adaptativo: 2 columnas en PC, 1 columna en Celular -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 pt-5 sm:pt-6">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <!-- COLUMNA IZQUIERDA: Listado de Negocios -->
        <div class="md:col-span-6 lg:col-span-7 space-y-4 order-2 md:order-1">
          <!-- Título Dinámico con Contador -->
          <div class="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
            <h1 class="text-base font-extrabold text-barber-dark tracking-tight">
              {{ tituloSeccion }} • {{ negociosFiltrados.length }}
            </h1>
          </div>

          <!-- Estado de Carga -->
          <div v-if="loading" class="py-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200/80">
            <div class="w-8 h-8 border-4 border-barber-red border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-slate-500">Conectando con barberías en Buga...</p>
          </div>

          <!-- Estado Vacío -->
          <div v-else-if="negociosFiltrados.length === 0" class="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-sm space-y-2.5">
            <p class="text-sm font-bold text-barber-dark">No hay resultados con estos filtros</p>
            <p class="text-xs text-slate-500">Prueba cambiando la categoría o el rango de precio.</p>
            <button
              type="button"
              @click="limpiarFiltros"
              class="mt-1 inline-flex items-center justify-center bg-barber-red hover:bg-barber-redHover text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Restablecer filtros
            </button>
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

        <!-- COLUMNA DERECHA: Mapa Interactivo Fijo/Sticky en PC -->
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
const filtroActual = ref('todos') // 'todos' | 'local' | 'independiente' | 'abiertos'
const rangoPrecio = ref('todos') // 'todos' | 'hasta_15000' | '15001_25000' | 'mas_25000'
let realtimeChannel = null

const hayFiltrosActivos = computed(() => {
  return filtroActual.value !== 'todos' || rangoPrecio.value !== 'todos'
})

function limpiarFiltros() {
  filtroActual.value = 'todos'
  rangoPrecio.value = 'todos'
}

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
  if (filtroActual.value === 'abiertos') return 'Abiertos ahora'
  return 'Barberías y barberos en Buga'
})

function obtenerPrecioReferencia(negocio) {
  if (negocio.precio_base != null && negocio.precio_base !== '') {
    return Number(negocio.precio_base)
  }
  return negocio.tipo === 'local' ? 15000 : 20000
}

const negociosFiltrados = computed(() => {
  return negocios.value.filter((negocio) => {
    if (filtroActual.value === 'local' && negocio.tipo !== 'local') {
      return false
    }
    if (filtroActual.value === 'independiente' && negocio.tipo !== 'independiente') {
      return false
    }
    if (filtroActual.value === 'abiertos') {
      const tieneActivo = negocio.barberos && negocio.barberos.some((b) => b.activo)
      if (!tieneActivo) return false
    }

    const precio = obtenerPrecioReferencia(negocio)
    if (rangoPrecio.value === 'hasta_15000' && precio > 15000) return false
    if (rangoPrecio.value === '15001_25000' && (precio <= 15000 || precio > 25000)) return false
    if (rangoPrecio.value === 'mas_25000' && precio <= 25000) return false

    return true
  })
})
</script>