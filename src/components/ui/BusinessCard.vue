<template>
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
      
      <!-- ========================================== -->
      <!-- DISEÑO PARA LOCALES ALIADOS                -->
      <!-- ========================================== -->
      <template v-if="negocio.tipo === 'local'">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-extrabold text-barber-dark text-base leading-tight">
              {{ negocio.nombre }}
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
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
  
          <span 
            class="text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
            :class="estaAbierto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ estaAbierto ? 'Abierto' : 'Cerrado' }}
          </span>
        </div>
  
        <!-- Lista de precios base (Desde BD o tarifas estándar del local) -->
        <div class="border-t border-slate-100 pt-2.5 space-y-1.5 text-xs">
          <div class="flex justify-between items-center text-slate-600">
            <span>Corte clásico</span>
            <span class="font-extrabold text-barber-dark">{{ formatearMoneda(negocio.precio_base || 15000) }}</span>
          </div>
          <div class="flex justify-between items-center text-slate-600">
            <span>Corte + barba</span>
            <span class="font-extrabold text-barber-dark">{{ formatearMoneda((negocio.precio_base || 15000) + 7000) }}</span>
          </div>
          <div class="flex justify-between items-center text-slate-600">
            <span>Barba</span>
            <span class="font-extrabold text-barber-dark">{{ formatearMoneda(8000) }}</span>
          </div>
        </div>
  
        <router-link 
          :to="`/negocio/${negocio.slug_url}`"
          class="block w-full text-center bg-barber-red hover:bg-barber-redHover text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm"
        >
          Agendar cita
        </router-link>
      </template>
  
      <!-- ========================================== -->
      <!-- DISEÑO PARA BARBEROS A DOMICILIO           -->
      <!-- ========================================== -->
      <template v-else>
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center space-x-3">
            <!-- Avatar circular con iniciales o foto -->
            <div class="w-11 h-11 rounded-full bg-barber-dark text-white flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0">
              <img 
                v-if="negocio.logo_url" 
                :src="negocio.logo_url" 
                :alt="negocio.nombre" 
                class="w-full h-full object-cover"
              />
              <span v-else>{{ obtenerIniciales(negocio.nombre) }}</span>
            </div>
            <div>
              <h3 class="font-extrabold text-barber-dark text-base leading-tight">
                {{ negocio.nombre }}
              </h3>
              <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {{ negocio.direccion || 'Corte, barba y cejas • Buga' }}
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
  
        <!-- Cuadrícula de 3 fotos de portafolio (Supabase Storage) -->
        <div class="grid grid-cols-3 gap-2">
          <div 
            v-for="index in 3" 
            :key="index"
            class="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 relative"
          >
            <img 
              v-if="negocio.portafolio_fotos && negocio.portafolio_fotos[index - 1]" 
              :src="negocio.portafolio_fotos[index - 1].imagen_url" 
              :alt="negocio.portafolio_fotos[index - 1].descripcion || 'Corte'"
              class="w-full h-full object-cover"
            />
            <!-- Placeholder elegante con patrón diagonal si aún no sube las 3 fotos -->
            <div 
              v-else 
              class="w-full h-full opacity-40"
              style="background-image: repeating-linear-gradient(45deg, #cbd5e1 0, #cbd5e1 6px, transparent 6px, transparent 12px);"
            ></div>
          </div>
        </div>
  
        <!-- Tarifa base + Hora estimada disponible -->
        <div class="flex items-center justify-between text-xs pt-0.5">
          <p class="text-slate-600">
            Desde <strong class="text-barber-dark font-extrabold text-sm">{{ formatearMoneda(negocio.precio_base || 20000) }}</strong> a domicilio
          </p>
          <span class="text-[11px] text-slate-500 font-medium">
            {{ proximoTurnoTexto }}
          </span>
        </div>
  
        <router-link 
          :to="`/negocio/${negocio.slug_url}`"
          class="block w-full text-center bg-barber-red hover:bg-barber-redHover text-white font-bold text-xs py-3 rounded-xl transition-colors shadow-sm"
        >
          Separar cita
        </router-link>
      </template>
  
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { RouterLink } from 'vue-router'
  
  const props = defineProps({
    negocio: {
      type: Object,
      required: true
    }
  })
  
  const barberosActivosCount = computed(() => {
    if (!props.negocio.barberos) return 0
    return props.negocio.barberos.filter(b => b.activo).length
  })
  
  const estaAbierto = computed(() => barberosActivosCount.value > 0)
  
  const totalEnEspera = computed(() => {
    if (!props.negocio.barberos) return 0
    return props.negocio.barberos
      .filter(b => b.activo)
      .reduce((acc, b) => acc + (b.personas_en_espera || 0), 0)
  })
  
  // Calcula hora libre respetando regla de 2h + fila presencial
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
  
  function obtenerIniciales(nombre) {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }
  </script>