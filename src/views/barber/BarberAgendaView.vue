<template>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 text-slate-900">
      <!-- Encabezado -->
      <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black">Agenda</h1>
          <p class="text-xs text-slate-300 md:text-slate-500 capitalize mt-0.5">{{ fechaCompletaLabel }}</p>
        </div>
        <span class="bg-white/15 md:bg-slate-100 text-white md:text-[#0b1329] text-xs font-extrabold px-3.5 py-1.5 rounded-xl shrink-0">
          {{ citasDelDia.length }} {{ citasDelDia.length === 1 ? 'cita' : 'citas' }}
        </span>
      </div>
  
      <!-- Selector de Días -->
      <div class="flex md:grid md:grid-cols-7 gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          v-for="dia in diasSemana"
          :key="dia.fechaStr"
          @click="seleccionarDia(dia.fechaStr)"
          :class="diaSeleccionado === dia.fechaStr
            ? 'bg-[#0b1329] text-white shadow-md border-[#0b1329]'
            : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-100'"
          class="min-w-[4.5rem] md:min-w-0 flex-1 py-2.5 px-2 rounded-2xl border text-center transition flex flex-col items-center cursor-pointer shrink-0"
        >
          <span class="text-[10px] font-semibold opacity-80 capitalize">{{ dia.etiqueta }}</span>
          <span class="text-sm sm:text-base font-black mt-0.5">{{ dia.numero }}</span>
        </button>
      </div>
  
      <!-- Carga -->
      <div v-if="cargando" class="bg-white rounded-3xl p-8 text-center border border-slate-200/70">
        <p class="text-xs font-semibold text-slate-400">Cargando citas vinculadas...</p>
      </div>
  
      <!-- Listado de Citas -->
      <div v-else-if="citasDelDia.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div
          v-for="cita in citasDelDia"
          :key="cita.id"
          :class="cita.estado === 'pendiente'
            ? 'bg-white border-2 border-[#991b1b]/80 shadow-sm'
            : 'bg-white border border-slate-200/70 opacity-85'"
          class="rounded-2xl p-4 transition flex flex-col justify-between gap-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-14 shrink-0 text-left leading-tight bg-slate-50 rounded-xl p-2 border border-slate-100">
                <span class="text-xs font-extrabold text-[#0b1329] block">{{ cita.horaCorta }}</span>
                <span class="text-[10px] font-semibold text-slate-400">{{ cita.periodo }}</span>
              </div>
              <div class="min-w-0">
                <h3 class="text-sm font-extrabold text-[#0b1329] truncate">{{ cita.cliente_nombre }}</h3>
                <p class="text-xs text-slate-500 font-medium mt-0.5">{{ cita.cliente_telefono }}</p>
              </div>
            </div>
  
            <span
              :class="{
                'bg-amber-100 text-amber-800': cita.estado === 'pendiente',
                'bg-red-100 text-[#991b1b]': cita.estado === 'cancelada',
                'bg-emerald-100 text-emerald-700': cita.estado === 'confirmada',
                'bg-slate-100 text-slate-600': !['pendiente', 'cancelada', 'confirmada'].includes(cita.estado)
              }"
              class="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0"
            >
              {{ cita.estado }}
            </span>
          </div>
  
          <div v-if="cita.estado === 'pendiente'" class="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <a
              v-if="cita.cliente_telefono"
              :href="`https://wa.me/57${limpiarTelefono(cita.cliente_telefono)}`"
              target="_blank"
              class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
            >
              WhatsApp
            </a>
            <button
              @click="cancelarCita(cita)"
              :disabled="cancelandoId === cita.id"
              class="border border-[#991b1b] text-[#991b1b] hover:bg-red-50 disabled:opacity-50 text-xs font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
            >
              {{ cancelandoId === cita.id ? 'Cancelando...' : 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Estado Vacío -->
      <div v-else class="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 space-y-1">
        <p class="text-sm font-extrabold text-[#0b1329]">Sin citas programadas</p>
        <p class="text-xs text-slate-400">No tienes reservas vinculadas para este día.</p>
      </div>
  
      <!-- Fin de Jornada -->
      <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-100/60 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
        <span class="font-bold text-[#0b1329]">Fin de jornada: {{ horaCierreBarbero }}</span>
        <span>Horario configurado</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useBarberAgenda } from '@/composables/useBarberAgenda'
  
  const {
    diasSemana,
    diaSeleccionado,
    fechaCompletaLabel,
    horaCierreBarbero,
    citasDelDia,
    cargando,
    cancelandoId,
    seleccionarDia,
    cancelarCita,
    limpiarTelefono
  } = useBarberAgenda()
  </script>
  
  <style scoped>
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  </style>