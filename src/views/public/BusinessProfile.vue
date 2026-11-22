<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { supabase } from '@/services/supabase'
import { barberService } from '@/services/barberService'
import Navbar from '@/components/Navbar.vue'
import BookingModal from '@/components/BookingModal.vue'

const route = useRoute()
const negocio = ref(null)
const modalAbierto = ref(false)
const barberoSeleccionado = ref(null)
const tabActiva = ref('barberos') // 'barberos' | 'precios' | 'portafolio'
let realtimeChannel = null

async function cargarDatos() {
  try {
    const slug = route.params.slug
    const data = await barberService.getNegocioBySlug(slug)
    negocio.value = data

    // Mantener o preseleccionar el primer barbero activo
    if (data?.barberos?.length) {
      const actualSigueActivo =
        barberoSeleccionado.value &&
        data.barberos.some((b) => b.id === barberoSeleccionado.value.id && b.activo)

      if (actualSigueActivo) {
        barberoSeleccionado.value = data.barberos.find(
          (b) => b.id === barberoSeleccionado.value.id
        )
      } else {
        barberoSeleccionado.value = data.barberos.find((b) => b.activo) || null
      }
    }
  } catch (error) {
    console.error('Error al cargar negocio:', error)
    toast.error('No se pudo encontrar el establecimiento')
  }
}

watchEffect(() => {
  if (!negocio.value) return

  const scriptId = 'json-ld-business'
  const existingScript = document.getElementById(scriptId)
  if (existingScript) existingScript.remove()

  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.text = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    name: negocio.value.nombre,
    image: negocio.value.logo_url || 'https://bugabarber.com/logo.png',
    address: {
      '@type': 'PostalAddress',
      streetAddress: negocio.value.direccion || 'Buga',
      addressLocality: 'Guadalajara de Buga',
      addressRegion: 'Valle del Cauca',
      addressCountry: 'CO'
    },
    telephone: negocio.value.telefono,
    priceRange: `$${negocio.value.precio_base} COP`,
    url: window.location.href,
    areaServed: 'Guadalajara de Buga'
  })
  document.head.appendChild(script)
})

onMounted(async () => {
  await cargarDatos()

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

const barberosActivosCount = computed(() => {
  if (!negocio.value?.barberos) return 0
  return negocio.value.barberos.filter((b) => b.activo).length
})

const estaAbierto = computed(() => barberosActivosCount.value > 0)

const totalEnEspera = computed(() => {
  if (!negocio.value?.barberos) return 0
  return negocio.value.barberos
    .filter((b) => b.activo)
    .reduce((acc, b) => acc + (b.personas_en_espera || 0), 0)
})

const precioBase = computed(() => Number(negocio.value?.precio_base) || 15000)

const listaPrecios = computed(() => [
  { nombre: 'Corte clásico', detalle: 'Asesoría, corte y acabado', precio: precioBase.value },
  { nombre: 'Corte + barba', detalle: 'Corte completo y perfilado de barba', precio: precioBase.value + 7000 },
  { nombre: 'Barba y cejas', detalle: 'Ritual de toalla y perfilado', precio: 8000 }
])

function calcularHoraLibre(barbero) {
  if (!barbero?.activo) return null
  const ahora = new Date()
  const horasExtra = Math.max(2, Number(barbero.personas_en_espera || 0))
  const inicio = new Date(ahora.getTime() + horasExtra * 60 * 60 * 1000)
  inicio.setMinutes(0, 0, 0)
  const fin = new Date(inicio.getTime() + 60 * 60 * 1000)

  const fmt = (d) =>
    d.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

  return {
    desde: fmt(inicio),
    rango: `Hoy, ${fmt(inicio)} – ${fmt(fin)}`
  }
}

const resumenBarberoSeleccionado = computed(() => {
  if (!barberoSeleccionado.value) return null
  const horario = calcularHoraLibre(barberoSeleccionado.value)
  return {
    primerNombre: barberoSeleccionado.value.nombre?.split(' ')[0] || 'barbero',
    nombreCompleto: barberoSeleccionado.value.nombre,
    rango: horario?.rango || 'Disponible hoy'
  }
})

function seleccionarBarbero(barbero) {
  if (!barbero.activo) return
  barberoSeleccionado.value = barbero
}

function abrirAgendamiento(barbero = barberoSeleccionado.value) {
  if (!barbero || !barbero.activo) return
  barberoSeleccionado.value = barbero
  modalAbierto.value = true
}

function abrirComoLlegar() {
  if (!negocio.value) return
  const tieneCoords =
    negocio.value.lat != null &&
    negocio.value.lng != null &&
    !Number.isNaN(Number(negocio.value.lat)) &&
    !Number.isNaN(Number(negocio.value.lng))

  const destino = tieneCoords
    ? `${negocio.value.lat},${negocio.value.lng}`
    : encodeURIComponent(`${negocio.value.direccion || negocio.value.nombre}, Guadalajara de Buga, Valle del Cauca`)

  window.open(`https://www.google.com/maps/dir/?api=1&destination=${destino}`, '_blank')
}

async function compartirPerfil() {
  const url = window.location.href
  const titulo = `${negocio.value?.nombre || 'Barber Buga'} | Separa tu cita`

  if (navigator.share) {
    try {
      await navigator.share({ title: titulo, url })
      return
    } catch {
      // Si cancela el diálogo nativo, no mostramos error
      return
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    toast.success('Enlace copiado para compartir')
  } catch {
    toast.info(url)
  }
}

function obtenerIniciales(nombre) {
  if (!nombre) return 'BB'
  return nombre
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function formatearMoneda(valor) {
  return '$' + Number(valor).toLocaleString('es-CO')
}
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-[#0b1329] pb-28 lg:pb-14">
    <!-- Navbar Global -->
    <Navbar />

    <div v-if="negocio" class="max-w-5xl mx-auto lg:px-6 lg:pt-6">
      <div class="bg-white lg:rounded-3xl lg:shadow-sm lg:border lg:border-slate-200/80 overflow-hidden">
        <!-- BANNER SUPERIOR DEGRADADO + BOTÓN VOLVER -->
        <div class="relative h-32 sm:h-40 bg-gradient-to-br from-[#0b1329] via-[#181633] to-[#58142b] px-4 sm:px-8 pt-4">
          <router-link
            to="/directorio"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-black/25 hover:bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full transition"
          >
            &larr; Volver
          </router-link>
        </div>

        <!-- FRANJA BARBER POLE -->
        <div class="h-2.5 w-full barber-pole-stripe"></div>

        <!-- CABECERA DEL PERFIL (LOGO SUPERPUESTO + DATOS + BOTONES) -->
        <div class="px-4 sm:px-8 pb-5">
          <div class="flex items-end justify-between gap-3 -mt-10 sm:-mt-12 mb-3.5 relative z-10">
            <!-- Logo cuadrado redondeado -->
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0b1329] text-[#f43f5e] border-4 border-white shadow-lg flex items-center justify-center font-black text-2xl sm:text-3xl overflow-hidden shrink-0">
              <img
                v-if="negocio.logo_url"
                :src="negocio.logo_url"
                :alt="negocio.nombre"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ obtenerIniciales(negocio.nombre) }}</span>
            </div>

            <!-- Badge Estado -->
            <span
              class="text-xs font-extrabold px-3 py-1 rounded-full mb-1 shrink-0"
              :class="estaAbierto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            >
              {{ estaAbierto ? 'Abierto' : 'Cerrado' }}
            </span>
          </div>

          <!-- Nombre, Dirección y Resumen en Vivo -->
          <div class="space-y-1">
            <h1 class="text-xl sm:text-2xl font-black text-[#0b1329] tracking-tight leading-tight">
              {{ negocio.nombre }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500">
              {{ negocio.direccion || 'Guadalajara de Buga, Valle del Cauca' }}
            </p>
            <p class="text-xs text-slate-500 font-medium pt-0.5">
              <span v-if="negocio.telefono">{{ negocio.telefono }} • </span>
              <span>{{ barberosActivosCount }} {{ barberosActivosCount === 1 ? 'barbero activo' : 'barberos activos' }}</span>
              <span v-if="estaAbierto">
                • {{ totalEnEspera }} {{ totalEnEspera === 1 ? 'persona' : 'personas' }} en espera
              </span>
            </p>
          </div>

          <!-- Botones de Acción: Cómo llegar y Compartir -->
          <div class="grid grid-cols-2 sm:flex sm:items-center gap-3 mt-4">
            <button
              type="button"
              @click="abrirComoLlegar"
              class="sm:min-w-[165px] py-2.5 px-4 rounded-xl border border-[#be123c]/35 text-[#be123c] hover:bg-rose-50 font-extrabold text-xs sm:text-sm transition cursor-pointer"
            >
              Cómo llegar
            </button>
            <button
              type="button"
              @click="compartirPerfil"
              class="sm:min-w-[165px] py-2.5 px-4 rounded-xl border border-[#be123c]/35 text-[#be123c] hover:bg-rose-50 font-extrabold text-xs sm:text-sm transition cursor-pointer"
            >
              Compartir
            </button>
          </div>
        </div>

        <!-- PESTAÑAS (En móvil alterna vistas; en PC sirve de acceso rápido / sub-sección) -->
        <!-- PESTAÑAS SOLO EN MÓVIL (Ocultas en PC para mostrar barberos, precios y portafolio juntos) -->
        <div class="lg:hidden border-y border-slate-200/80 px-4 grid grid-cols-3 text-center">
          <button
            type="button"
            @click="tabActiva = 'barberos'"
            :class="tabActiva === 'barberos'
              ? 'border-[#be123c] text-[#be123c] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-[#0b1329] font-semibold'"
            class="py-3 text-xs border-b-2 transition cursor-pointer"
          >
            Barberos
          </button>

          <button
            type="button"
            @click="tabActiva = 'precios'"
            :class="tabActiva === 'precios'
              ? 'border-[#be123c] text-[#be123c] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-[#0b1329] font-semibold'"
            class="py-3 text-xs border-b-2 transition cursor-pointer"
          >
            Precios
          </button>

          <button
            type="button"
            @click="tabActiva = 'portafolio'"
            :class="tabActiva === 'portafolio'
              ? 'border-[#be123c] text-[#be123c] font-extrabold'
              : 'border-transparent text-slate-500 hover:text-[#0b1329] font-semibold'"
            class="py-3 text-xs border-b-2 transition cursor-pointer"
          >
            Portafolio
          </button>
        </div>

        <!-- CONTENIDO PRINCIPAL: 1 COLUMNA EN MÓVIL, 2 COLUMNAS EN PC -->
        <div class="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-slate-50/50">
          <!-- COLUMNA BARBEROS (Visible en móvil si tabActiva === 'barberos', y siempre visible en PC) -->
          <div
            :class="tabActiva === 'barberos' ? 'block' : 'hidden lg:block'"
            class="lg:col-span-7 space-y-3.5"
          >
            <p class="text-xs text-slate-500 font-medium">
              {{ negocio.nombre }} • Toca al barbero con quien quieres tu cita
            </p>

            <div
              v-if="!negocio.barberos || negocio.barberos.length === 0"
              class="bg-white rounded-2xl p-6 text-center border border-slate-200/80 text-xs text-slate-500"
            >
              Este establecimiento aún no tiene barberos registrados.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="barbero in negocio.barberos"
                :key="barbero.id"
                @click="seleccionarBarbero(barbero)"
                :class="[
                  barbero.activo ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed',
                  barberoSeleccionado?.id === barbero.id && barbero.activo
                    ? 'bg-rose-50/70 border-2 border-[#be123c] shadow-xs'
                    : 'bg-white border border-slate-200/90 hover:border-slate-300'
                ]"
                class="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <!-- Radio Button Visual -->
                  <span
                    :class="barberoSeleccionado?.id === barbero.id && barbero.activo
                      ? 'border-[#be123c]'
                      : 'border-slate-300'"
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 bg-white"
                  >
                    <span
                      v-if="barberoSeleccionado?.id === barbero.id && barbero.activo"
                      class="w-2.5 h-2.5 rounded-full bg-[#be123c]"
                    ></span>
                  </span>

                  <!-- Avatar / Iniciales -->
                  <img
                    v-if="barbero.avatar_url"
                    :src="barbero.avatar_url"
                    :alt="barbero.nombre"
                    class="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div
                    v-else
                    class="w-11 h-11 rounded-full bg-[#0b1329] text-white flex items-center justify-center font-extrabold text-xs shrink-0"
                  >
                    {{ obtenerIniciales(barbero.nombre) }}
                  </div>

                  <!-- Nombre y Fila -->
                  <div class="min-w-0">
                    <h2 class="font-extrabold text-[#0b1329] text-sm truncate">
                      {{ barbero.nombre }}
                    </h2>
                    <p class="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      <template v-if="barbero.activo">
                        Fila: {{ barbero.personas_en_espera || 0 }} • Libre desde {{ calcularHoraLibre(barbero)?.desde }}
                      </template>
                      <template v-else>
                        No disponible en este momento
                      </template>
                    </p>
                  </div>
                </div>

                <!-- Badge En línea / Inactivo -->
                <span
                  :class="barbero.activo
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'"
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                >
                  {{ barbero.activo ? 'En línea' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>

          <!-- COLUMNA LATERAL: PRECIOS Y PORTAFOLIO (En móvil según pestaña; en PC siempre accesible) -->
          <div class="lg:col-span-5 space-y-5">
            <!-- Tarjeta de Precios -->
            <div
              :class="tabActiva === 'precios' ? 'block' : 'hidden lg:block'"
              class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
            >
              <div class="flex items-center justify-between">
                <h2 class="font-extrabold text-[#0b1329] text-sm">Tarifas del servicio</h2>
                <span class="text-[11px] font-bold text-[#be123c]">COP</span>
              </div>

              <div class="divide-y divide-slate-100">
                <div
                  v-for="servicio in listaPrecios"
                  :key="servicio.nombre"
                  class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div>
                    <p class="text-xs font-bold text-[#0b1329]">{{ servicio.nombre }}</p>
                    <p class="text-[11px] text-slate-400">{{ servicio.detalle }}</p>
                  </div>
                  <span class="text-sm font-black text-[#0b1329] shrink-0">
                    {{ formatearMoneda(servicio.precio) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Tarjeta de Portafolio -->
            <div
              :class="tabActiva === 'portafolio' ? 'block' : 'hidden lg:block'"
              class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
            >
              <h2 class="font-extrabold text-[#0b1329] text-sm">Portafolio de cortes</h2>

              <div
                v-if="negocio.portafolio_fotos && negocio.portafolio_fotos.length > 0"
                class="grid grid-cols-3 lg:grid-cols-2 gap-2.5"
              >
                <div
                  v-for="foto in negocio.portafolio_fotos"
                  :key="foto.id"
                  class="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-slate-100"
                >
                  <img
                    :src="foto.imagen_url"
                    :alt="foto.descripcion || 'Corte'"
                    class="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                </div>
              </div>

              <p v-else class="text-xs text-slate-400 py-4 text-center">
                Aún no hay fotos publicadas en el portafolio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado de Carga -->
    <div v-else class="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div class="w-8 h-8 border-4 border-[#be123c] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xs text-slate-500 font-medium">Cargando perfil del establecimiento...</p>
    </div>

    <!-- BARRA INFERIOR DE ACCIÓN PARA AGENDAR (Móvil fija abajo + Escritorio centrada) -->
    <div
      v-if="negocio"
      class="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)]"
    >
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div v-if="resumenBarberoSeleccionado" class="min-w-0">
          <p class="text-xs sm:text-sm font-black text-[#0b1329] truncate">
            {{ resumenBarberoSeleccionado.nombreCompleto }}
          </p>
          <p class="text-[11px] text-slate-500 font-medium">
            {{ resumenBarberoSeleccionado.rango }} • {{ formatearMoneda(precioBase) }}
          </p>
        </div>
        <div v-else class="text-xs text-slate-500 font-medium">
          No hay barberos disponibles para agendar en este momento
        </div>

        <button
          type="button"
          @click="abrirAgendamiento()"
          :disabled="!barberoSeleccionado || !barberoSeleccionado.activo"
          :class="barberoSeleccionado && barberoSeleccionado.activo
            ? 'bg-[#be123c] hover:bg-[#9f1239] text-white shadow-md cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
          class="w-full sm:w-auto sm:min-w-[240px] py-3 px-6 rounded-xl font-extrabold text-xs sm:text-sm transition active:scale-[0.99]"
        >
          {{
            resumenBarberoSeleccionado
              ? `Agendar con ${resumenBarberoSeleccionado.primerNombre}`
              : 'Sin disponibilidad'
          }}
        </button>
      </div>
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

<style scoped>
.barber-pole-stripe {
  background: repeating-linear-gradient(
    -45deg,
    #be123c 0px,
    #be123c 14px,
    #ffffff 14px,
    #ffffff 28px,
    #0b1329 28px,
    #0b1329 42px,
    #ffffff 42px,
    #ffffff 56px
  );
}
</style>