<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { supabase } from '@/services/supabase'
import { barberService } from '@/services/barberService'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const router = useRouter()
const token = String(route.params.token || '')

const cita = ref(null)
const cargando = ref(true)
const errorCarga = ref('')
const notificacionesActivas = ref(false)
let canalCitas = null

const estaCancelada = computed(() => cita.value?.estado === 'cancelada')

const fechaFormateada = computed(() => {
  if (!cita.value?.fecha_hora_inicio) return ''
  return new Date(cita.value.fecha_hora_inicio).toLocaleString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const precioFormateado = computed(() => {
  const valor = Number(cita.value?.negocios?.precio_base)
  if (!valor) return null
  return '$' + valor.toLocaleString('es-CO')
})

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

async function solicitarPermisoNotificaciones() {
  if (!('Notification' in window)) {
    toast.info('Tu navegador no soporta notificaciones nativas, pero esta pestaña te avisará en pantalla.')
    return
  }
  if (Notification.permission === 'granted') {
    notificacionesActivas.value = true
    toast.success('Notificaciones del navegador activadas')
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission()
    notificacionesActivas.value = perm === 'granted'
    if (perm === 'granted') {
      toast.success('Notificaciones activadas')
    }
  }
}

function reproducirAvisoSonoro() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(523.25, ctx.currentTime)
    osc.frequency.setValueAtTime(392.0, ctx.currentTime + 0.14)
    gain.gain.setValueAtTime(0.14, ctx.currentTime)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.34)
  } catch {
    // Evitar error si el navegador bloquea el audio automático
  }
}

function dispararAlertaCancelacion(nuevaData) {
  toast.error('Tu cita fue cancelada por el barbero')
  reproducirAvisoSonoro()

  if ('vibrate' in navigator) {
    navigator.vibrate([250, 120, 250])
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    const hora = nuevaData?.fecha_hora_inicio
      ? new Date(nuevaData.fecha_hora_inicio).toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : ''
    new Notification('Cita cancelada — BugaBarber', {
      body: `Tu turno${hora ? ` de las ${hora}` : ''} fue cancelado. Toca aquí para reagendar.`,
      icon: '/favicon.ico'
    })
  }
}

async function copiarEnlaceSeguimiento() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Enlace de seguimiento copiado')
  } catch {
    toast.info(window.location.href)
  }
}

async function cargarCita() {
  cargando.value = true
  errorCarga.value = ''
  try {
    const data = await barberService.obtenerCitaPorTrackingToken(token)
    cita.value = data
  } catch (err) {
    console.error('Error al cargar cita:', err)
    errorCarga.value = 'No encontramos una cita asociada a este enlace de seguimiento.'
  } finally {
    cargando.value = false
  }
}

function suscribirseACambiosCita() {
  if (!token) return
  canalCitas = supabase
    .channel(`public:citas:tracking_token=eq.${token}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'citas',
        filter: `tracking_token=eq.${token}`
      },
      (payload) => {
        const estadoAnterior = cita.value?.estado
        cita.value = {
          ...cita.value,
          ...payload.new
        }

        if (estadoAnterior !== 'cancelada' && payload.new.estado === 'cancelada') {
          dispararAlertaCancelacion(cita.value)
        }
      }
    )
    .subscribe()
}

function irAReagendar() {
  const slug = cita.value?.negocios?.slug_url
  if (slug) {
    router.push(`/negocio/${slug}`)
  } else {
    router.push('/directorio')
  }
}

onMounted(async () => {
  await cargarCita()
  await solicitarPermisoNotificaciones()
  suscribirseACambiosCita()
})

onUnmounted(() => {
  if (canalCitas) {
    supabase.removeChannel(canalCitas)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] text-[#0b1329] pb-16">
    <Navbar />

    <div class="max-w-xl mx-auto px-4 pt-6 sm:pt-8 space-y-4">
      <!-- Aviso persistente para mantener abierta la pestaña mientras la cita esté activa -->
      <div
        v-if="cita && !estaCancelada"
        class="bg-amber-50/95 border border-amber-200/90 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
            !
          </div>
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-xs sm:text-sm font-black text-amber-950">
                No cierres esta página
              </p>
              <span class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                En vivo
              </span>
            </div>
            <p class="text-xs text-amber-900/85 leading-relaxed">
              Mantén esta pestaña abierta para recibir aviso inmediato si el barbero cancela tu cita.
              <span v-if="cita.cliente_email">
                También te enviaremos un correo a <strong class="font-bold">{{ cita.cliente_email }}</strong>.
              </span>
            </p>
            <button
              v-if="!notificacionesActivas"
              type="button"
              @click="solicitarPermisoNotificaciones"
              class="text-xs font-extrabold text-[#be123c] hover:text-[#9f1239] underline pt-0.5 cursor-pointer"
            >
              Activar alertas del navegador
            </button>
          </div>
        </div>
      </div>

      <!-- Cargando -->
      <div
        v-if="cargando"
        class="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs space-y-3"
      >
        <div class="w-8 h-8 border-4 border-[#be123c] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-medium text-slate-500">Consultando el estado de tu cita...</p>
      </div>

      <!-- Error / Token no encontrado -->
      <div
        v-else-if="errorCarga"
        class="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs space-y-4"
      >
        <div class="w-12 h-12 rounded-2xl bg-rose-50 text-[#be123c] flex items-center justify-center mx-auto font-black text-lg">
          ?
        </div>
        <div class="space-y-1">
          <h1 class="text-lg font-black text-[#0b1329]">Enlace no disponible</h1>
          <p class="text-xs text-slate-500 leading-relaxed">{{ errorCarga }}</p>
        </div>
        <button
          type="button"
          @click="router.push('/directorio')"
          class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#be123c] hover:bg-[#9f1239] text-white font-extrabold text-xs sm:text-sm transition cursor-pointer"
        >
          Explorar barberías en Buga
        </button>
      </div>

      <!-- TARJETA PRINCIPAL DE LA CITA -->
      <div
        v-else-if="cita"
        class="bg-white rounded-3xl shadow-sm border overflow-hidden transition-all"
        :class="estaCancelada ? 'border-rose-300' : 'border-slate-200/80'"
      >
        <!-- Banner superior -->
        <div
          class="px-5 sm:px-7 pt-4 pb-12 relative"
          :class="estaCancelada
            ? 'bg-gradient-to-br from-[#3f0d1c] via-[#7f1d1d] to-[#be123c] text-white'
            : 'bg-gradient-to-br from-[#0b1329] via-[#181633] to-[#58142b] text-white'"
        >
          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              @click="router.push('/directorio')"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white bg-black/25 hover:bg-black/40 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              &larr; Directorio
            </button>

            <span
              class="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full"
              :class="estaCancelada
                ? 'bg-white text-[#be123c]'
                : 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30'"
            >
              {{ estaCancelada ? 'Cancelada' : cita.estado }}
            </span>
          </div>

          <p class="text-[11px] font-bold uppercase tracking-widest text-rose-200/90 mt-4">
            BugaBarber • Guadalajara de Buga
          </p>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
            {{ cita.negocios?.nombre || 'Establecimiento' }}
          </h1>
          <p class="text-xs text-white/80 mt-0.5">
            {{ cita.negocios?.direccion || 'Guadalajara de Buga, Valle del Cauca' }}
          </p>
        </div>

        <!-- Franja Barber Pole -->
        <div class="h-2.5 w-full barber-pole-stripe"></div>

        <!-- Cuerpo de la tarjeta -->
        <div class="p-5 sm:p-7 space-y-5">
          <!-- Bloque de alerta si fue cancelada -->
          <div
            v-if="estaCancelada"
            class="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded-xl bg-[#be123c] text-white flex items-center justify-center font-black text-sm shrink-0">
                ✕
              </span>
              <div>
                <h2 class="text-sm sm:text-base font-black text-[#881337]">
                  Tu cita fue cancelada por el barbero
                </h2>
                <p class="text-xs text-rose-800/90">
                  El turno programado para <strong class="capitalize">{{ fechaFormateada }}</strong> ya no está activo.
                </p>
              </div>
            </div>

            <div
              v-if="cita.motivo_cancelacion"
              class="mt-2 bg-white/90 border border-rose-200/80 rounded-xl px-3.5 py-2.5 text-xs text-rose-950"
            >
              <span class="font-extrabold">Motivo indicado:</span> {{ cita.motivo_cancelacion }}
            </div>
          </div>

          <!-- Datos del barbero y cliente -->
          <div class="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5">
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="cita.barberos?.avatar_url"
                :src="cita.barberos.avatar_url"
                :alt="cita.barberos?.nombre"
                class="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div
                v-else
                class="w-11 h-11 rounded-full bg-[#0b1329] text-white flex items-center justify-center font-black text-xs shrink-0"
              >
                {{ obtenerIniciales(cita.barberos?.nombre) }}
              </div>
              <div class="min-w-0">
                <p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Barbero asignado</p>
                <p class="text-sm font-extrabold text-[#0b1329] truncate">
                  {{ cita.barberos?.nombre || 'Barbero' }}
                </p>
              </div>
            </div>
            <span
              v-if="precioFormateado"
              class="text-xs sm:text-sm font-black text-[#0b1329] bg-white border border-slate-200 px-3 py-1.5 rounded-xl shrink-0"
            >
              {{ precioFormateado }}
            </span>
          </div>

          <!-- Resumen en filas -->
          <div class="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl px-4 bg-white text-xs sm:text-sm">
            <div class="py-3 flex items-center justify-between gap-3">
              <span class="text-slate-400 font-medium">Cliente</span>
              <span class="font-bold text-[#0b1329] text-right">{{ cita.cliente_nombre }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-3">
              <span class="text-slate-400 font-medium">Fecha y hora</span>
              <span class="font-bold text-[#0b1329] capitalize text-right">{{ fechaFormateada }}</span>
            </div>
            <div class="py-3 flex items-center justify-between gap-3">
              <span class="text-slate-400 font-medium">Estado actual</span>
              <span
                class="font-extrabold capitalize"
                :class="estaCancelada ? 'text-[#be123c]' : 'text-amber-600'"
              >
                {{ cita.estado }}
              </span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="space-y-2.5 pt-1">
            <button
              v-if="estaCancelada"
              type="button"
              @click="irAReagendar"
              class="w-full py-3.5 px-5 rounded-xl bg-[#be123c] hover:bg-[#9f1239] text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-[0.99] cursor-pointer"
            >
              Reagendar cita ahora
            </button>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                @click="copiarEnlaceSeguimiento"
                class="w-full py-2.5 px-4 rounded-xl border border-[#be123c]/35 text-[#be123c] hover:bg-rose-50 font-extrabold text-xs transition cursor-pointer"
              >
                Copiar enlace de estado
              </button>

              <button
                type="button"
                @click="router.push('/directorio')"
                class="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition cursor-pointer"
              >
                Ver otras barberías
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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