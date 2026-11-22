<template>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 text-slate-900">
      <!-- Encabezado -->
      <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black truncate">Mi negocio</h1>
          <p class="text-xs text-slate-300 md:text-slate-500 truncate mt-0.5">Información y ubicación</p>
        </div>
        <span class="bg-emerald-500/20 md:bg-emerald-100 text-emerald-300 md:text-emerald-700 text-xs font-bold px-3 py-1 rounded-full shrink-0">
          {{ estadoTexto }}
        </span>
      </div>
  
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
        <!-- Datos y Logo -->
        <div class="md:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 space-y-4">
          <div class="flex items-center gap-3.5">
            <img
              v-if="logoPreview"
              :src="logoPreview"
              alt="Logo del negocio"
              class="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div
              v-else
              class="w-14 h-14 rounded-2xl bg-[#0b1329] text-white font-black text-base flex items-center justify-center shrink-0"
            >
              {{ inicialesNegocio }}
            </div>
            <div class="min-w-0">
              <h2 class="text-base font-extrabold text-[#0b1329] truncate">{{ form.nombre || 'Mi barbería' }}</h2>
              <button
                type="button"
                @click="triggerLogoInput"
                class="text-xs font-bold text-[#991b1b] hover:underline cursor-pointer"
              >
                Cambiar logo
              </button>
              <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="onLogoChange" />
            </div>
          </div>
  
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Nombre de la barbería *</label>
            <input
              v-model="form.nombre"
              type="text"
              placeholder="Barbería El Clásico"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
            />
          </div>
  
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Dirección *</label>
            <input
              v-model="form.direccion"
              type="text"
              placeholder="Cra 14 #6-29, Centro, Buga"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
            />
          </div>
  
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Teléfono *</label>
              <input
                v-model="form.telefono"
                type="tel"
                placeholder="316 222 1010"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
              />
            </div>
  
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Precio base ($) *</label>
              <input
                v-model.number="form.precioBase"
                type="number"
                step="1000"
                min="0"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
              />
            </div>
          </div>
        </div>
  
        <!-- Mapa Movible y Guardar -->
        <div class="md:col-span-6 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 space-y-3.5">
          <div>
            <label class="text-[11px] font-bold text-slate-500 block">
              Ubicación en el mapa (arrastra el pin o toca el mapa)
            </label>
            <div
              ref="mapContainer"
              class="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 mt-1.5 z-10"
            ></div>
          </div>
  
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>{{ form.lat }}, {{ form.lng }}</span>
            <span v-if="form.slugUrl" class="truncate">/negocio/{{ form.slugUrl }}</span>
          </div>
  
          <button
            type="button"
            @click="solicitarGuardarNegocio"
            :disabled="guardando"
            class="w-full bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-60 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm transition cursor-pointer"
          >
            {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
  
      <!-- MODAL DE CONFIRMACIÓN PARA GUARDAR CAMBIOS DEL NEGOCIO -->
      <div
        v-if="modalConfirmarAbierto"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl text-center space-y-4 text-slate-900">
          <div class="w-11 h-11 rounded-2xl bg-slate-100 text-[#0b1329] flex items-center justify-center mx-auto font-black">
            ✓
          </div>
          <div class="space-y-1.5">
            <h3 class="text-base font-black text-[#0b1329]">
              ¿Guardar cambios de {{ form.nombre }}?
            </h3>
            <p class="text-xs text-slate-500">
              Se actualizarán los datos de tú negocio,
              <strong class="text-[#0b1329]">¿estás seguro de realizar estos cambios?.</strong>
            </p>
          </div>
          <div class="flex gap-2.5 pt-1">
            <button
              type="button"
              @click="cancelarGuardarNegocio"
              :disabled="guardando"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarGuardarNegocio"
              :disabled="guardando"
              class="flex-1 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              {{ guardando ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAdminBusiness } from '@/composables/useAdminBusiness'
  
  const {
    mapContainer,
    logoInput,
    logoPreview,
    guardando,
    modalConfirmarAbierto,
    form,
    estadoTexto,
    inicialesNegocio,
    triggerLogoInput,
    onLogoChange,
    solicitarGuardarNegocio,
    cancelarGuardarNegocio,
    confirmarGuardarNegocio
  } = useAdminBusiness()
  </script>