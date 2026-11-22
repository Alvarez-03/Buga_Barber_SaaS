<template>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 text-slate-900">
      <!-- Encabezado -->
      <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black truncate">Mi perfil</h1>
          <p class="text-xs text-slate-300 md:text-slate-500 truncate mt-0.5">{{ negocioNombre }}</p>
        </div>
        <span class="bg-white/15 md:bg-slate-100 text-white md:text-[#0b1329] text-xs font-bold px-3 py-1 rounded-full shrink-0">
          {{ rolEtiqueta }}
        </span>
      </div>
  
      <!-- Grid Responsivo: 1 columna en móvil, 2 columnas en PC -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
  
        <!-- Columna Izquierda: Datos Personales y Disponibilidad -->
        <div class="md:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 space-y-4">
          <!-- Avatar y Nombre rápido -->
          <div class="flex items-center gap-3.5">
            <button
              type="button"
              @click="triggerAvatarInput"
              aria-label="Cambiar foto de perfil"
              class="w-14 h-14 rounded-full overflow-hidden border border-slate-200 bg-[#0b1329] text-white font-black text-base flex items-center justify-center shrink-0 cursor-pointer transition hover:opacity-90"
            >
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Foto de perfil"
                class="w-full h-full object-cover"
              />
              <span v-else>{{ iniciales }}</span>
            </button>
  
            <div class="min-w-0">
              <h2 class="text-base font-extrabold text-[#0b1329] truncate">
                {{ perfil.nombre || 'Tu nombre' }}
              </h2>
              <button
                type="button"
                @click="triggerAvatarInput"
                class="text-xs font-bold text-[#991b1b] hover:underline cursor-pointer"
              >
                {{ avatarPreview ? 'Cambiar foto' : 'Subir foto' }}
              </button>
              <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            </div>
          </div>
  
          <!-- Campos Personales -->
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Nombre</label>
              <input
                v-model="perfil.nombre"
                type="text"
                placeholder="Tu nombre completo"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:bg-white focus:border-[#0b1329]"
              />
            </div>
  
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500">Teléfono</label>
                <input
                  v-model="perfil.telefono"
                  type="tel"
                  placeholder="318 000 0000"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:bg-white focus:border-[#0b1329]"
                />
              </div>
  
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500">Precio base ($)</label>
                <input
                  v-model.number="perfil.precioBase"
                  type="number"
                  step="1000"
                  min="0"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:bg-white focus:border-[#0b1329]"
                />
              </div>
            </div>
          </div>
  
          <!-- Días y Horarios -->
          <div class="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/70 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">Días y horarios</span>
              <p class="text-xs font-bold text-[#0b1329] truncate mt-0.5">{{ resumenDisponibilidad }}</p>
            </div>
            <button
              type="button"
              @click="modalHorariosAbierto = true"
              class="bg-[#0b1329] hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition cursor-pointer"
            >
              Configurar
            </button>
          </div>
        </div>
  
        <!-- Columna Derecha: Portafolio (Máx. 4 imágenes) y Acciones -->
        <div class="md:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 space-y-5">
          <div class="space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-extrabold text-[#0b1329]">{{ tituloPortafolio }}</span>
              <span class="text-[11px] text-slate-400 font-semibold shrink-0">
                {{ fotos.length }} de {{ maxFotos }} fotos
              </span>
            </div>
  
            <p v-if="esBarberoDeBarberia" class="text-[11px] text-slate-500">
              El catálogo público de la barbería lo administra el administrador del local.
            </p>
  
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-2.5">
              <div
                v-for="(foto, idx) in fotos"
                :key="foto.id || idx"
                class="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-slate-200"
              >
                <img :src="foto.url" alt="Trabajo de barbería" class="w-full h-full object-cover" />
                <button
                  @click="eliminarFoto(idx)"
                  type="button"
                  aria-label="Eliminar foto"
                  class="w-6 h-6 rounded-full bg-[#0b1329]/90 text-white text-[11px] font-bold flex items-center justify-center shadow cursor-pointer"
                  style="position: absolute; top: 6px; right: 6px;"
                >
                  ✕
                </button>
              </div>
  
              <button
                v-if="fotos.length < maxFotos"
                @click="triggerPortfolioInput"
                :disabled="guardando"
                type="button"
                class="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 flex flex-col items-center justify-center text-[#0b1329] transition cursor-pointer"
              >
                <span class="text-xl font-black leading-none">+</span>
                <span class="text-[11px] font-bold mt-1">Agregar ({{ maxFotos - fotos.length }} disp.)</span>
              </button>
            </div>
  
            <input ref="portfolioInput" type="file" accept="image/*" class="hidden" @change="onPortfolioChange" />
          </div>
  
          <!-- Guardar cambios y Cerrar sesión -->
          <div class="space-y-2 pt-2 border-t border-slate-100">
            <button
              @click="guardarCambios"
              :disabled="guardando"
              type="button"
              class="w-full bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-60 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-sm transition cursor-pointer"
            >
              {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
            </button>
  
            <button
              @click="cerrarSesion"
              type="button"
              class="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
  
      <!-- MODAL DE DÍAS Y HORARIOS DISPONIBLES -->
      <div
        v-if="modalHorariosAbierto"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-slate-900">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-black text-[#0b1329]">Días y horarios disponibles</h3>
            <button
              type="button"
              @click="modalHorariosAbierto = false"
              class="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
  
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Días activos</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="dia in LISTA_DIAS"
                :key="dia.key"
                type="button"
                @click="toggleDia(dia.key)"
                :class="disponibilidad.dias.includes(dia.key)
                  ? 'bg-[#0b1329] text-white'
                  : 'bg-slate-100 text-slate-600'"
                class="px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {{ dia.label }}
              </button>
            </div>
          </div>
  
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Hora inicio</label>
              <select
                v-model="disponibilidad.horaInicio"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0b1329] bg-white"
              >
                <option v-for="h in HORAS_OPCIONES" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>
  
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Hora fin</label>
              <select
                v-model="disponibilidad.horaFin"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0b1329] bg-white"
              >
                <option v-for="h in HORAS_OPCIONES" :key="h" :value="h">{{ h }}</option>
              </select>
            </div>
          </div>
  
          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="modalHorariosAbierto = false"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarHorarios"
              class="flex-1 bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Aplicar horario
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useBarberProfile } from '@/composables/useBarberProfile'
  
  const {
    LISTA_DIAS,
    HORAS_OPCIONES,
    maxFotos,
    modalHorariosAbierto,
    guardando,
    avatarPreview,
    avatarInput,
    portfolioInput,
    perfil,
    disponibilidad,
    fotos,
    rolEtiqueta,
    esBarberoDeBarberia,
    tituloPortafolio,
    negocioNombre,
    iniciales,
    resumenDisponibilidad,
    toggleDia,
    confirmarHorarios,
    triggerAvatarInput,
    triggerPortfolioInput,
    onAvatarChange,
    onPortfolioChange,
    eliminarFoto,
    guardarCambios,
    cerrarSesion
  } = useBarberProfile()
  </script>