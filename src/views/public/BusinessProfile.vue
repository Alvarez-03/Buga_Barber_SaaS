
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { supabase } from '@/services/supabase'
import { barberService } from '@/services/barberService'
import { watchEffect } from 'vue'
import Navbar from '@/components/Navbar.vue'
import BookingModal from '@/components/BookingModal.vue'

const route = useRoute()
const negocio = ref(null)
const modalAbierto = ref(false)
const barberoSeleccionado = ref(null)
let realtimeChannel = null

async function cargarDatos() {
  try {
    const slug = route.params.slug
    negocio.value = await barberService.getNegocioBySlug(slug)
  } catch (error) {
    console.error('Error al cargar negocio:', error)
    toast.error('No se pudo encontrar el establecimiento')
  }
}

watchEffect(() => {
  if (!negocio.value) return

  // Remover script anterior si existe para evitar duplicados
  const scriptId = 'json-ld-business'
  let existingScript = document.getElementById(scriptId)
  if (existingScript) existingScript.remove()

  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "name": negocio.value.nombre,
    "image": negocio.value.logo_url || "https://bugabarber.com/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": negocio.value.direccion || "Buga",
      "addressLocality": "Guadalajara de Buga",
      "addressRegion": "Valle del Cauca",
      "addressCountry": "CO"
    },
    "telephone": negocio.value.telefono,
    "priceRange": `$${negocio.value.precio_base} COP`,
    "url": window.location.href,
    "areaServed": "Guadalajara de Buga"
  })
  document.head.appendChild(script)
})

onMounted(async () => {
  await cargarDatos()

  // Suscripción en tiempo real para actualizar la fila de los barberos en este negocio
  realtimeChannel = supabase
    .channel(`public:barberos-profile-${route.params.slug}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'barberos' },
      () => {
        cargarDatos()
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})

function abrirAgendamiento(barbero) {
  barberoSeleccionado.value = barbero
  modalAbierto.value = true
}

function obtenerIniciales(nombre) {
  if (!nombre) return 'BB'
  return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>
<template>
    <div class="min-h-screen bg-slate-50 pb-12">
      <!-- Navbar / Header -->
      <Navbar />
  
      <!-- Contenido Principal -->
      <main class="max-w-4xl mx-auto px-4 pt-6 space-y-6" v-if="negocio">
        
        <!-- Botón de Retorno -->
        <router-link to="/" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition">
          &larr; Volver al directorio
        </router-link>
  
        <!-- Encabezado del Negocio -->
        <div class="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider bg-[#991b1b] text-white px-3 py-1 rounded-full font-bold">
                {{ negocio.tipo === 'local' ? 'Local Aliado' : 'A Domicilio' }}
              </span>
              <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Abierto hoy
              </span>
            </div>
  
            <h1 class="text-2xl md:text-3xl font-black text-[#0b1329] tracking-tight">{{ negocio.nombre }}</h1>
            <p class="text-slate-600 text-xs md:text-sm flex items-center gap-1.5">
              📍 {{ negocio.direccion }}
            </p>
            <p class="text-slate-600 text-xs md:text-sm flex items-center gap-1.5">
              📞 Teléfono / WhatsApp: <strong class="text-[#0b1329]">{{ negocio.telefono }}</strong>
            </p>
          </div>
  
          <div class="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-center md:text-right w-full md:w-auto shrink-0">
            <span class="text-xs text-slate-400 block font-medium">Precio base de corte</span>
            <span class="text-2xl font-black text-[#991b1b]">${{ negocio.precio_base?.toLocaleString() }} COP</span>
          </div>
        </div>
  
        <!-- Grid Principal: Barberos / Cola en Vivo + Sección de Portafolio -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <!-- Columna Izquierda: Lista de Barberos y Fila en Vivo (Ocupa 7 cols en PC) -->
          <div class="md:col-span-7 space-y-4">
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 class="font-extrabold text-[#0b1329] text-base flex items-center gap-2">
                  Profesionales y Fila en Vivo
                </h2>
                <span class="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">Sincronizado</span>
              </div>
  
              <div class="space-y-3">
                <div 
                  v-for="barbero in negocio.barberos" 
                  :key="barbero.id"
                  class="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-[#0b1329] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {{ obtenerIniciales(barbero.nombre) }}
                    </div>
                    <div>
                      <h3 class="font-bold text-[#0b1329] text-sm">{{ barbero.nombre }}</h3>
                      <p class="text-xs text-slate-500 mt-0.5">
                        {{ barbero.activo ? '🟢 Disponible para agendar' : '🔴 Ocupado / Descanso' }}
                      </p>
                    </div>
                  </div>
  
                  <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div class="text-left sm:text-right">
                      <span class="text-[10px] uppercase font-bold text-slate-400 block">En espera física</span>
                      <span class="text-base font-black text-[#991b1b]">{{ barbero.personas_en_espera }} pers.</span>
                    </div>
  
                    <button 
                      @click="abrirAgendamiento(barbero)"
                      :disabled="!barbero.activo"
                      :class="barbero.activo ? 'bg-[#991b1b] hover:bg-[#7f1d1d] shadow-md cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                      class="text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                    >
                      Separar cita
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Columna Derecha: Portafolio de Cortes (Ocupa 5 cols en PC) -->
          <div class="md:col-span-5 space-y-4">
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 class="font-extrabold text-[#0b1329] text-base border-b border-slate-100 pb-3">
                Portafolio de trabajos
              </h2>
  
              <div v-if="negocio.portafolio_fotos && negocio.portafolio_fotos.length > 0" class="grid grid-cols-2 gap-3">
                <div v-for="foto in negocio.portafolio_fotos" :key="foto.id" class="relative group rounded-2xl overflow-hidden border border-slate-100 aspect-square bg-slate-100">
                  <img :src="foto.imagen_url" :alt="foto.descripcion || 'Corte'" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              </div>
              <div v-else class="text-center py-8 text-slate-400 text-xs">
                Aún no hay fotos registradas en el portafolio.
              </div>
            </div>
          </div>
  
        </div>
      </main>
  
      <!-- Estado de carga -->
      <div v-else class="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div class="w-8 h-8 border-4 border-[#991b1b] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs text-slate-500 font-medium">Cargando perfil del establecimiento...</p>
      </div>
  
      <!-- Modal de Agendamiento de 3 Pasos -->
      <BookingModal 
        v-if="modalAbierto" 
        :negocio="negocio" 
        :barberoSeleccionado="barberoSeleccionado" 
        @close="modalAbierto = false" 
      />
    </div>
  </template>