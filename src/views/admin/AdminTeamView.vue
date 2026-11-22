<template>
    <div class="p-4 sm:p-6 space-y-4 sm:space-y-6 text-slate-900">
      <!-- VISTA PRINCIPAL: MI EQUIPO -->
      <template v-if="vistaActiva === 'equipo'">
        <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black truncate">Mi equipo</h1>
            <p class="text-xs text-slate-300 md:text-slate-500 truncate mt-0.5">
              {{ negocioNombre }} • {{ equipo.length }} {{ equipo.length === 1 ? 'barbero' : 'barberos' }}
            </p>
          </div>
          <span class="bg-emerald-500/20 md:bg-emerald-100 text-emerald-300 md:text-emerald-700 text-xs font-bold px-3 py-1 rounded-full shrink-0">
            {{ suscripcionActiva ? 'Suscripción activa' : 'Inactiva' }}
          </span>
        </div>
  
        <!-- Acciones principales -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            @click="abrirModalNuevo"
            class="bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm transition cursor-pointer"
          >
            + Nuevo barbero
          </button>
          <button
            type="button"
            @click="irABuscarBarberos"
            class="bg-white hover:bg-slate-50 text-[#0b1329] border-2 border-[#0b1329] font-extrabold py-3 px-4 rounded-2xl text-xs sm:text-sm transition cursor-pointer"
          >
            Buscar barberos
          </button>
        </div>
  
        <!-- Lista de barberos del negocio -->
        <div class="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/70 space-y-3">
          <div v-if="cargandoEquipo" class="py-8 text-center text-xs text-slate-400">
            Cargando equipo...
          </div>
  
          <div v-else-if="equipo.length === 0" class="py-8 text-center space-y-1">
            <p class="text-xs font-bold text-slate-600">Aún no tienes barberos en tu equipo</p>
            <p class="text-[11px] text-slate-400">Crea uno nuevo o busca barberos independientes.</p>
          </div>
  
          <div
            v-else
            v-for="barbero in equipo"
            :key="barbero.id"
            class="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="barbero.avatar_url"
                :src="barbero.avatar_url"
                :alt="barbero.nombre"
                class="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div
                v-else
                class="w-11 h-11 rounded-full bg-[#0b1329] text-white font-black text-xs flex items-center justify-center shrink-0"
              >
                {{ iniciales(barbero.nombre) }}
              </div>
  
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h2 class="text-sm font-extrabold text-[#0b1329] truncate">{{ barbero.nombre }}</h2>
                  <span
                    v-if="barbero.rol === 'admin_barberia'"
                    class="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full shrink-0"
                  >
                    Admin
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 truncate">
                  Fila: {{ barbero.personas_en_espera ?? 0 }} • Citas hoy: {{ barbero.citas_hoy ?? 0 }}
                </p>
              </div>
            </div>
  
            <div class="flex items-center gap-2.5 shrink-0">
              <span
                :class="barbero.activo
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-600'"
                class="text-[11px] font-bold px-2.5 py-1 rounded-full"
              >
                {{ barbero.activo ? 'En línea' : 'Desconectado' }}
              </span>
  
              <button
                v-if="barbero.rol !== 'admin_barberia'"
                type="button"
                @click="solicitarEliminarBarbero(barbero)"
                :disabled="guardando"
                aria-label="Eliminar barbero del equipo"
                class="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#991b1b] flex items-center justify-center transition cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
  
          <p class="text-[11px] text-slate-400 pt-1">
            Toca el bote de basura para eliminar a un barbero del equipo.
          </p>
        </div>
      </template>
  
      <!-- SUBVISTA: BUSCAR BARBEROS INDEPENDIENTES -->
      <template v-else>
        <div class="bg-[#0b1329] md:bg-white text-white md:text-[#0b1329] rounded-3xl p-5 shadow-sm md:border md:border-slate-200/80 flex items-center gap-3">
          <button
            type="button"
            @click="volverAEquipo"
            class="px-3 py-1.5 rounded-xl bg-white/10 md:bg-slate-100 text-xs font-bold cursor-pointer"
          >
            &larr; Volver
          </button>
          <div class="min-w-0">
            <h1 class="text-lg sm:text-xl font-black truncate">Buscar barberos</h1>
            <p class="text-xs text-slate-300 md:text-slate-500 truncate">
              Solo barberos independientes disponibles para sumar a {{ negocioNombre }}
            </p>
          </div>
        </div>
  
        <div class="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/70 space-y-4">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar barbero independiente por nombre o correo..."
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329] focus:outline-none focus:bg-white focus:border-[#0b1329]"
          />
  
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              @click="filtroEstilo = 'todos'"
              :class="filtroEstilo === 'todos' ? 'bg-[#0b1329] text-white' : 'bg-slate-100 text-slate-600'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Todos
            </button>
            <button
              type="button"
              @click="filtroEstilo = 'disponibles'"
              :class="filtroEstilo === 'disponibles' ? 'bg-[#0b1329] text-white' : 'bg-slate-100 text-slate-600'"
              class="px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Disponibles
            </button>
          </div>
  
          <div v-if="cargandoIndependientes" class="py-8 text-center text-xs text-slate-400">
            Buscando barberos independientes...
          </div>
  
          <div v-else-if="independientesFiltrados.length === 0" class="py-8 text-center text-xs text-slate-400">
            No hay barberos independientes disponibles con ese criterio.
          </div>
  
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="item in independientesFiltrados"
              :key="item.id"
              class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <img
                  v-if="item.avatar_url"
                  :src="item.avatar_url"
                  :alt="item.nombre"
                  class="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div
                  v-else
                  class="w-11 h-11 rounded-full bg-[#0b1329] text-white font-black text-xs flex items-center justify-center shrink-0"
                >
                  {{ iniciales(item.nombre) }}
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-extrabold text-[#0b1329] truncate">{{ item.nombre }}</h3>
                  <p class="text-[11px] text-slate-500 truncate">
                    Independiente • {{ item.telefono || item.email }}
                  </p>
                </div>
              </div>
  
              <!-- Miniaturas de portafolio del barbero independiente -->
              <div v-if="item.fotos && item.fotos.length > 0" class="grid grid-cols-3 gap-2">
                <img
                  v-for="foto in item.fotos"
                  :key="foto.id"
                  :src="foto.imagen_url"
                  alt="Corte"
                  class="w-full h-16 rounded-xl object-cover border border-slate-200"
                />
              </div>
  
              <button
                type="button"
                @click="invitarBarberoIndependiente(item)"
                :disabled="guardando"
                class="w-full py-2.5 px-3 rounded-xl border border-[#991b1b] text-[#991b1b] hover:bg-[#991b1b] hover:text-white text-xs font-bold transition cursor-pointer"
              >
                Invitar al equipo
              </button>
            </div>
          </div>
        </div>
      </template>
  
      <!-- MODAL: NUEVO BARBERO (SE CREA PERTENECIENDO A LA BARBERÍA) -->
      <div
        v-if="modalNuevoAbierto"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div class="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-3.5 text-slate-900 max-h-[92dvh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-black text-[#0b1329]">Nuevo barbero</h3>
              <p class="text-[11px] text-slate-500">Se vinculará directamente a {{ negocioNombre }}</p>
            </div>
            <button
              type="button"
              @click="modalNuevoAbierto = false"
              class="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
  
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Nombre completo *</label>
            <input
              v-model="nuevoBarbero.nombre"
              type="text"
              placeholder="Santiago Herrera"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
            />
          </div>
  
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Correo de Google (para que inicie sesión) *</label>
            <input
              v-model="nuevoBarbero.email"
              type="email"
              placeholder="santiago.herrera@gmail.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
            />
          </div>
  
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="space-y-1">
              <label class="text-[11px] font-bold text-slate-500">Teléfono *</label>
              <input
                v-model="nuevoBarbero.telefono"
                type="tel"
                placeholder="311 222 3344"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
              />
            </div>
  
            <div class="grid grid-cols-2 gap-1.5">
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500">Inicio</label>
                <input
                  v-model="nuevoBarbero.horaInicio"
                  type="time"
                  class="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
                />
              </div>
              <div class="space-y-1">
                <label class="text-[11px] font-bold text-slate-500">Fin</label>
                <input
                  v-model="nuevoBarbero.horaFin"
                  type="time"
                  class="w-full px-2 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0b1329]"
                />
              </div>
            </div>
          </div>
  
          <!-- Días disponibles -->
          <div class="space-y-1">
            <label class="text-[11px] font-bold text-slate-500">Días disponibles *</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="dia in LISTA_DIAS_ADMIN"
                :key="dia.key"
                type="button"
                @click="toggleDiaNuevoBarbero(dia.key)"
                :class="nuevoBarbero.diasDisponibles.includes(dia.key)
                  ? 'bg-[#0b1329] text-white'
                  : 'bg-slate-100 text-slate-600'"
                class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer"
              >
                {{ dia.label }}
              </button>
            </div>
          </div>
  
          <div class="flex items-center justify-between pt-1">
            <div>
              <p class="text-xs font-bold text-[#0b1329]">Disponible desde ya</p>
              <p class="text-[11px] text-slate-400">Aparecerá en línea en tu perfil</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="nuevoBarbero.activo" type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
  
          <!-- Validación explícita del usuario -->
          <label class="flex items-start gap-2 pt-1 text-[11px] text-slate-600 cursor-pointer">
            <input
              v-model="nuevoBarbero.confirmadoPorUsuario"
              type="checkbox"
              class="mt-0.5 rounded border-slate-300 text-[#991b1b] focus:ring-[#991b1b]"
            />
            <span>Confirmo que los datos son correctos y deseo agregarlo a {{ negocioNombre }}.</span>
          </label>
  
          <button
            type="button"
            @click="crearBarbero"
            :disabled="guardando"
            class="w-full bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-60 text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs sm:text-sm transition cursor-pointer"
          >
            {{ guardando ? 'Creando...' : 'Crear barbero' }}
          </button>
        </div>
      </div>
  
      <!-- MODAL DE CONFIRMACIÓN PARA ELIMINAR BARBERO -->
      <div
        v-if="modalEliminar.abierto && modalEliminar.barbero"
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl text-center space-y-4 text-slate-900">
          <div class="w-11 h-11 rounded-2xl bg-rose-100 text-[#991b1b] flex items-center justify-center mx-auto font-black">
            🗑
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-black text-[#0b1329]">
              ¿Eliminar a {{ modalEliminar.barbero.nombre }}?
            </h3>
            <p class="text-xs text-slate-500">
              Saldrá de tu equipo (quedará como barbero independiente) y se eliminarán sus
              <strong class="text-[#991b1b]">{{ modalEliminar.citasPendientes }} citas pendientes</strong>.
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="flex gap-2.5 pt-1">
            <button
              type="button"
              @click="cancelarEliminacion"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarEliminarBarbero"
              :disabled="guardando"
              class="flex-1 bg-[#991b1b] hover:bg-[#7f1d1d] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              {{ guardando ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAdminTeam } from '@/composables/useAdminTeam'
  
  const {
    LISTA_DIAS_ADMIN,
    equipo,
    independientesFiltrados,
    cargandoEquipo,
    cargandoIndependientes,
    guardando,
    vistaActiva,
    modalNuevoAbierto,
    modalEliminar,
    nuevoBarbero,
    busqueda,
    filtroEstilo,
    negocioNombre,
    suscripcionActiva,
    toggleDiaNuevoBarbero,
    abrirModalNuevo,
    crearBarbero,
    solicitarEliminarBarbero,
    cancelarEliminacion,
    confirmarEliminarBarbero,
    irABuscarBarberos,
    volverAEquipo,
    invitarBarberoIndependiente,
    iniciales
  } = useAdminTeam()
  </script>