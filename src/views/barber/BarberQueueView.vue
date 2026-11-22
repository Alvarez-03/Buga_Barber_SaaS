<template>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 text-slate-900">
      <!-- Encabezado con datos reales del barbero y su negocio -->
      <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black truncate">
            Hola, {{ primerNombre }}
          </h1>
          <p class="text-xs text-slate-300 md:text-slate-500 truncate mt-0.5">
            {{ authStore.negocio?.nombre || 'Establecimiento no vinculado' }}
          </p>
        </div>
  
        <span
          :class="barberoActivo
            ? 'bg-emerald-500/20 md:bg-emerald-100 text-emerald-300 md:text-emerald-700'
            : 'bg-slate-700 md:bg-slate-200 text-slate-300 md:text-slate-600'"
          class="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0"
        >
          <span
            :class="barberoActivo ? 'bg-emerald-400 md:bg-emerald-500 animate-pulse' : 'bg-slate-400'"
            class="w-2 h-2 rounded-full"
          ></span>
          {{ barberoActivo ? 'En línea' : 'En pausa' }}
        </span>
      </div>
  
      <!-- Grid Responsivo: 1 columna en celular, 2 columnas en PC -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        
        <!-- Columna Principal: Estado + Control de Fila Presencial -->
        <div class="md:col-span-7 space-y-4">
          <!-- Switch Estado "Estoy disponible" -->
          <div class="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/70 flex items-center justify-between gap-4">
            <div>
              <h3 class="font-bold text-[#0b1329] text-sm">Estoy disponible</h3>
              <p class="text-[11px] text-slate-400">Los clientes pueden agendarte en tiempo real</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                v-model="barberoActivo"
                :disabled="!authStore.barbero?.id || guardandoEstado"
                @change="toggleEstado"
                class="sr-only peer"
              >
              <div class="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
  
          <!-- Control de Personas en Espera (Fila Física) -->
          <div class="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/70 text-center space-y-4">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Personas en espera
            </span>
  
            <div class="flex items-center justify-center gap-7 sm:gap-9 py-1">
              <button
                @click="cambiarFila(-1)"
                :disabled="!authStore.barbero?.id || personasEspera === 0"
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-200 text-slate-700 disabled:opacity-40 text-2xl font-black flex items-center justify-center hover:bg-slate-50 transition active:scale-95 cursor-pointer"
              >
                -
              </button>
  
              <span class="text-5xl sm:text-6xl font-black text-[#0b1329] min-w-[3.5rem]">
                {{ personasEspera }}
              </span>
  
              <button
                @click="cambiarFila(1)"
                :disabled="!authStore.barbero?.id"
                class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#991b1b] disabled:opacity-40 text-white text-2xl font-black flex items-center justify-center shadow-lg hover:bg-[#7f1d1d] transition active:scale-95 cursor-pointer"
              >
                +
              </button>
            </div>
  
            <div class="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-500 border border-slate-100 space-y-1">
              <p v-if="personasEspera > 0">
                Fila ocupada hasta <strong class="text-[#0b1329]">{{ horaFinFila }}</strong>
              </p>
              <p v-else>
                Sin fila física en este momento
              </p>
              <p class="text-[11px] text-[#991b1b] font-semibold">
                Próximo turno web libre desde {{ proximoTurnoWeb }}
              </p>
            </div>
          </div>
        </div>
  
        <!-- Columna Secundaria: Próxima Cita Web -->
        <div class="md:col-span-5">
          <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Próxima cita web
              </span>
              <span
                v-if="proximaCita"
                class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full"
              >
                Pendiente
              </span>
            </div>
  
            <div v-if="cargandoCita" class="py-4 text-center text-xs text-slate-400">
              Consultando agenda...
            </div>
  
            <div v-else-if="proximaCita" class="space-y-3">
              <div>
                <span class="text-xs font-bold text-[#991b1b] block">
                  {{ formatearFechaHora(proximaCita.fecha_hora_inicio) }}
                </span>
                <h4 class="font-extrabold text-[#0b1329] text-base mt-0.5">
                  {{ proximaCita.cliente_nombre }}
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  Tel: {{ proximaCita.cliente_telefono }}
                </p>
              </div>
  
              <div class="flex items-center gap-2 pt-1">
                <a
                  :href="`https://wa.me/57${limpiarTelefono(proximaCita.cliente_telefono)}`"
                  target="_blank"
                  class="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold py-2.5 px-3 rounded-xl transition"
                >
                  WhatsApp
                </a>
                <button
                  @click="cancelarCitaWeb(proximaCita.id)"
                  class="flex-1 border border-[#991b1b] text-[#991b1b] text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-red-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
  
            <div v-else class="py-6 text-center space-y-1">
              <p class="text-xs font-bold text-slate-500">Sin citas pendientes próximas</p>
              <p class="text-[11px] text-slate-400">Las nuevas reservas aparecerán aquí al instante.</p>
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
  import { useAuthStore } from '@/stores/authStore'
  
  const authStore = useAuthStore()
  const barberoActivo = ref(true)
  const personasEspera = ref(0)
  const guardandoEstado = ref(false)
  const proximaCita = ref(null)
  const cargandoCita = ref(false)
  let canalRealtime = null
  
  const primerNombre = computed(() => {
    const nombre = authStore.barbero?.nombre || authStore.user?.user_metadata?.full_name || 'Barbero'
    return nombre.split(' ')[0]
  })
  
  const horaFinFila = computed(() => {
    const fin = new Date(Date.now() + personasEspera.value * 60 * 60 * 1000)
    return fin.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  })
  
  const proximoTurnoWeb = computed(() => {
    const ahora = new Date()
    const baseMs = Math.max(2, personasEspera.value) * 60 * 60 * 1000
    const libre = new Date(ahora.getTime() + baseMs)
    if (libre.getMinutes() > 0) {
      libre.setHours(libre.getHours() + 1, 0, 0, 0)
    }
    return libre.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  })
  
  async function cargarProximaCita() {
    const barberoId = authStore.barbero?.id
    if (!barberoId) return
  
    cargandoCita.value = true
    try {
      const { data, error } = await supabase
        .from('citas')
        .select('id, cliente_nombre, cliente_telefono, fecha_hora_inicio, estado')
        .eq('barbero_id', barberoId)
        .eq('estado', 'pendiente')
        .gte('fecha_hora_inicio', new Date().toISOString())
        .order('fecha_hora_inicio', { ascending: true })
        .limit(1)
        .maybeSingle()
  
      if (error) throw error
      proximaCita.value = data
    } catch (err) {
      console.error('Error al cargar próxima cita:', err)
    } finally {
      cargandoCita.value = false
    }
  }
  
  onMounted(async () => {
    // Limpiar cualquier hash o query residual de OAuth en la URL
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  
    if (authStore.loading) {
      await authStore.initSession()
    }
  
    if (authStore.barbero) {
      barberoActivo.value = authStore.barbero.activo ?? true
      personasEspera.value = authStore.barbero.personas_en_espera ?? 0
      await cargarProximaCita()
  
      if (authStore.barbero.id) {
        canalRealtime = supabase
          .channel(`barbero-fila-${authStore.barbero.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'citas', filter: `barbero_id=eq.${authStore.barbero.id}` },
            () => cargarProximaCita()
          )
          .subscribe()
      }
    }
  })
  
  onUnmounted(() => {
    if (canalRealtime) {
      supabase.removeChannel(canalRealtime)
    }
  })
  
  async function toggleEstado() {
    if (!authStore.barbero?.id) return
    guardandoEstado.value = true
    try {
      await barberService.actualizarEstadoBarbero(authStore.barbero.id, barberoActivo.value)
      authStore.barbero.activo = barberoActivo.value
      toast.info(barberoActivo.value ? 'Estás en línea para recibir citas' : 'Has pausado tu disponibilidad')
    } catch (err) {
      barberoActivo.value = !barberoActivo.value
      toast.error('No se pudo actualizar tu estado')
    } finally {
      guardandoEstado.value = false
    }
  }
  
  async function cambiarFila(delta) {
    if (!authStore.barbero?.id) return
    const anterior = personasEspera.value
    const nuevoValor = Math.max(0, anterior + delta)
    if (nuevoValor === anterior) return
  
    personasEspera.value = nuevoValor
    try {
      await barberService.actualizarFilaPresencial(authStore.barbero.id, nuevoValor)
      authStore.barbero.personas_en_espera = nuevoValor
    } catch (err) {
      personasEspera.value = anterior
      toast.error('No se pudo actualizar la fila en la base de datos')
    }
  }
  
  async function cancelarCitaWeb(citaId) {
    if (!confirm('¿Deseas cancelar esta cita?')) return
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
  
    if (error) {
      toast.error('No se pudo cancelar la cita')
      return
    }
    toast.success('Cita cancelada correctamente')
    await cargarProximaCita()
  }
  
  function formatearFechaHora(iso) {
    const fecha = new Date(iso)
    const hoy = new Date()
    const esHoy = fecha.toDateString() === hoy.toDateString()
    const hora = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    if (esHoy) return `Hoy • ${hora}`
    const dia = fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
    return `${dia} • ${hora}`
  }
  
  function limpiarTelefono(tel) {
    return (tel || '').replace(/\D/g, '')
  }
  </script>