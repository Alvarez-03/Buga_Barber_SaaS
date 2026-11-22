<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  negocio: {
    type: Object,
    required: true
  }
})

const esLocal = computed(() => props.negocio.tipo === 'local')

const precioBase = computed(() => Number(props.negocio.precio_base) || 15000)
const precioBaseDomicilio = computed(() => Number(props.negocio.precio_base) || 20000)

const barberoPrincipal = computed(() => {
  const lista = props.negocio.barberos || []
  return lista.find((b) => b.avatar_url) || lista[0] || null
})

const fotoPerfilDomiciliario = computed(() => {
  return barberoPrincipal.value?.avatar_url || props.negocio.logo_url || ''
})

const nombreBarberoVisible = computed(() => {
  if (props.negocio.nombre) return props.negocio.nombre
  return barberoPrincipal.value?.nombre || 'Barbero independiente'
})

const barberosActivosCount = computed(() => {
  if (!props.negocio.barberos) return 0
  return props.negocio.barberos.filter((b) => b.activo).length
})

const estaAbierto = computed(() => barberosActivosCount.value > 0)

const totalEnEspera = computed(() => {
  if (!props.negocio.barberos) return 0
  return props.negocio.barberos
    .filter((b) => b.activo)
    .reduce((acc, b) => acc + (b.personas_en_espera || 0), 0)
})

const proximoTurnoTexto = computed(() => {
  if (!estaAbierto.value) return 'No disponible hoy'
  const ahora = new Date()
  const horasExtra = Math.max(2, totalEnEspera.value)
  const libre = new Date(ahora.getTime() + horasExtra * 60 * 60 * 1000)
  return `Libre desde ${libre.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
})

function formatearMoneda(valor) {
  return '$' + Number(valor).toLocaleString('es-CO')
}

function obtenerIniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
</script>
<template>
  <article
    class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-200 hover:shadow-md space-y-3.5"
    :class="esLocal ? 'border-slate-200/90' : 'border-rose-200/70'"
  >
    <!-- ========================================== -->
    <!-- DISEÑO PARA LOCALES ALIADOS (BARBERÍAS)    -->
    <!-- ========================================== -->
    <template v-if="esLocal">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <!-- Logo de la barbería -->
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-barber-dark text-white flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0 border border-slate-200">
            <img
              v-if="negocio.logo_url"
              :src="negocio.logo_url"
              :alt="`Logo de ${negocio.nombre}`"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ obtenerIniciales(negocio.nombre) }}</span>
          </div>

          <div class="min-w-0">
            <!-- Etiqueta + Ícono Barbería -->
            <div class="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full mb-1">
              <!-- Ícono Local / Barbería (reemplazable por tu ícono propio) -->
              <svg class="w-3.5 h-3.5 text-barber-dark shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
              </svg>
              <span>Barbería</span>
            </div>

            <h3 class="font-extrabold text-barber-dark text-base sm:text-[17px] leading-tight truncate">
              {{ negocio.nombre }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5 truncate">
              {{ negocio.direccion || 'Guadalajara de Buga' }}
            </p>

            <!-- Resumen de barberos activos y fila en vivo -->
            <p class="text-xs font-semibold text-amber-700 mt-1">
              {{ barberosActivosCount }} {{ barberosActivosCount === 1 ? 'barbero activo' : 'barberos activos' }}
              <span v-if="estaAbierto">
                • {{ totalEnEspera > 0 ? `${totalEnEspera} ${totalEnEspera === 1 ? 'persona' : 'personas'} en espera` : 'sin fila' }}
              </span>
            </p>
          </div>
        </div>

        <span
          class="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
          :class="estaAbierto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ estaAbierto ? 'Abierto' : 'Cerrado' }}
        </span>
      </div>

      <!-- Lista de precios base -->
      <div class="border-t border-slate-100 pt-2.5 space-y-1.5 text-xs">
        <div class="flex justify-between items-center text-slate-600">
          <span>Corte clásico</span>
          <span class="font-extrabold text-barber-dark">{{ formatearMoneda(precioBase) }}</span>
        </div>
        <div class="flex justify-between items-center text-slate-600">
          <span>Corte + barba</span>
          <span class="font-extrabold text-barber-dark">{{ formatearMoneda(precioBase + 7000) }}</span>
        </div>
        <div class="flex justify-between items-center text-slate-600">
          <span>Barba</span>
          <span class="font-extrabold text-barber-dark">{{ formatearMoneda(8000) }}</span>
        </div>
      </div>

      <router-link
        :to="`/negocio/${negocio.slug_url}`"
        class="block w-full text-center bg-barber-red hover:bg-barber-redHover text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition-colors shadow-sm"
      >
        Agendar cita
      </router-link>
    </template>

    <!-- ========================================== -->
    <!-- DISEÑO PARA BARBEROS A DOMICILIO           -->
    <!-- ========================================== -->
    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-start gap-3 min-w-0">
          <!-- Foto de perfil del barbero independiente (con fallback a logo o iniciales) -->
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-barber-dark text-white flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0 ring-2 ring-rose-100">
            <img
              v-if="fotoPerfilDomiciliario"
              :src="fotoPerfilDomiciliario"
              :alt="`Foto de ${nombreBarberoVisible}`"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ obtenerIniciales(nombreBarberoVisible) }}</span>
          </div>

          <div class="min-w-0">
            <!-- Etiqueta + Ícono A domicilio -->
            <div class="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full mb-1">
              <!-- Ícono Domicilio (reemplazable por tu ícono propio) -->
              <svg class="w-3.5 h-3.5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-8 9 8M5 10v10h14V10" />
              </svg>
              <span>A domicilio</span>
            </div>

            <h3 class="font-extrabold text-barber-dark text-base sm:text-[17px] leading-tight truncate">
              {{ nombreBarberoVisible }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {{ negocio.direccion || 'Servicio a domicilio • Buga' }}
            </p>
          </div>
        </div>

        <span
          class="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
          :class="estaAbierto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
        >
          {{ estaAbierto ? 'Activo' : 'Inactivo' }}
        </span>
      </div>

      <!-- Cuadrícula de 3 fotos de portafolio -->
      <div
        v-if="negocio.portafolio_fotos && negocio.portafolio_fotos.length > 0"
        class="grid grid-cols-3 gap-2"
      >
        <div
          v-for="foto in negocio.portafolio_fotos.slice(0, 3)"
          :key="foto.id || foto.imagen_url"
          class="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 relative"
        >
          <img
            :src="foto.imagen_url"
            :alt="foto.descripcion || 'Corte'"
            class="w-full h-full object-cover"
          />
        </div>
      </div>

      <!-- Tarifa base + Hora estimada disponible -->
      <div class="flex items-center justify-between gap-2 text-xs pt-0.5">
        <p class="text-slate-600">
          Desde <strong class="text-barber-dark font-extrabold text-sm">{{ formatearMoneda(precioBaseDomicilio) }}</strong> a domicilio
        </p>
        <span class="text-[11px] text-slate-500 font-medium text-right">
          {{ proximoTurnoTexto }}
        </span>
      </div>

      <router-link
        :to="`/negocio/${negocio.slug_url}`"
        class="block w-full text-center bg-barber-red hover:bg-barber-redHover text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition-colors shadow-sm"
      >
        Separar cita
      </router-link>
    </template>
  </article>
</template>