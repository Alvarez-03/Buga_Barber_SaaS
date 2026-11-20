<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        <!-- HEADER DEL MODAL -->
        <div class="bg-[#0b1329] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <button 
            @click="paso > 1 ? paso-- : $emit('close')" 
            class="text-sm font-semibold text-slate-300 hover:text-white flex items-center gap-1 transition"
          >
            &larr; {{ paso === 1 ? 'Cancelar' : 'Atrás' }}
          </button>
          <span class="font-bold text-sm tracking-wide">
            {{ tituloPaso }}
          </span>
          <span class="text-xs bg-[#991b1b] px-2.5 py-1 rounded-full font-bold">
            Paso {{ paso }} de 3
          </span>
        </div>
  
        <!-- CUERPO DEL MODAL -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          
          <!-- PASO 1: SELECCIONAR DÍA Y HORA -->
          <div v-if="paso === 1" class="space-y-6">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-[#0b1329] text-white flex items-center justify-center font-bold text-sm">
                  {{ obtenerIniciales(barberoSeleccionado?.nombre) }}
                </div>
                <div>
                  <h3 class="font-bold text-[#0b1329] text-sm">{{ barberoSeleccionado?.nombre }}</h3>
                  <p class="text-xs text-slate-500">
                    {{ negocio.tipo === 'independiente' ? 'A domicilio' : 'Local aliado' }} • 1 hora • ${{ negocio.precio_base?.toLocaleString() }}
                  </p>
                </div>
              </div>
              <span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-full">
                Activo
              </span>
            </div>
  
            <!-- Selector de Día Dinámico -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Elige el día</label>
              <div class="grid grid-cols-4 gap-2">
                <button 
                  v-for="dia in diasDisponibles" 
                  :key="dia.fechaStr"
                  @click="seleccionarDia(dia.fechaStr)"
                  :class="diaSeleccionado === dia.fechaStr 
                    ? 'bg-[#0b1329] text-white shadow-md' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'"
                  class="py-3 rounded-2xl text-center transition flex flex-col items-center"
                >
                  <span class="text-[10px] uppercase opacity-75 font-semibold">{{ dia.nombreDia }}</span>
                  <span class="text-base font-black mt-0.5">{{ dia.numeroDia }}</span>
                </button>
              </div>
            </div>
  
            <!-- Selector de Hora Dinámico -->
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-400">Elige la hora</label>
              
              <div v-if="cargandoHorarios" class="py-8 text-center text-xs text-slate-400">
                Verificando disponibilidad...
              </div>
  
              <div v-else class="grid grid-cols-3 gap-2">
                <button 
                  v-for="hora in horasDisponibles" 
                  :key="hora.valorIso"
                  @click="!hora.ocupada && (horaSeleccionada = hora.valorIso)"
                  :disabled="hora.ocupada"
                  :class="[
                    horaSeleccionada === hora.valorIso 
                      ? 'bg-[#991b1b] text-white font-bold shadow-md' 
                      : hora.ocupada 
                        ? 'bg-slate-100 text-slate-400 border border-dashed border-slate-300 cursor-not-allowed' 
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 font-medium'
                  ]"
                  class="py-3 rounded-xl text-xs transition text-center"
                >
                  {{ hora.label }}
                </button>
              </div>
  
              <p class="text-[11px] text-slate-500 leading-relaxed pt-1">
                Cada cita dura <strong class="text-slate-700">1 hora</strong>. Para hoy se reserva con mínimo <strong class="text-slate-700">2 horas de anticipación</strong>. Para días futuros, puedes elegir cualquier horario libre.
              </p>
            </div>
          </div>
  
          <!-- PASO 2: TUS DATOS -->
          <div v-if="paso === 2" class="space-y-4">
            <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-[#0b1329] block">{{ barberoSeleccionado?.nombre }}</span>
                <span class="text-slate-500">{{ formatearResumenFecha }} • ${{ negocio.precio_base?.toLocaleString() }}</span>
              </div>
              <button @click="paso = 1" class="text-[#991b1b] font-bold hover:underline">Cambiar</button>
            </div>
  
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600">Nombre completo</label>
              <input 
                v-model="form.nombre" 
                type="text" 
                placeholder="Ej. Laura Gómez" 
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0b1329]"
              />
            </div>
  
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-600">Teléfono / WhatsApp</label>
              <input 
                v-model="form.telefono" 
                type="tel" 
                placeholder="+57 312 456 7890" 
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0b1329]"
              />
            </div>
  
            <div v-if="negocio.tipo === 'independiente'" class="space-y-3">
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-600">Dirección del servicio</label>
                <input 
                  v-model="form.direccion" 
                  type="text" 
                  placeholder="Cra 10 #4-35, Barrio Centenario" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0b1329]"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-600">Referencias (opcional)</label>
                <input 
                  v-model="form.referencias" 
                  type="text" 
                  placeholder="Casa blanca, portón negro" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0b1329]"
                />
              </div>
            </div>
          </div>
  
          <!-- PASO 3: CITA SEPARADA -->
          <div v-if="paso === 3" class="space-y-6 text-center py-2">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-inner">
              ✓
            </div>
  
            <div class="space-y-1">
              <h2 class="text-xl font-black text-[#0b1329]">¡Listo, {{ form.nombre }}!</h2>
              <p class="text-xs text-slate-500">{{ barberoSeleccionado?.nombre }} recibió tu solicitud.</p>
            </div>
  
            <div class="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-slate-200/60">
                <span class="text-slate-400">Barbero</span>
                <span class="font-bold text-[#0b1329]">{{ barberoSeleccionado?.nombre }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200/60">
                <span class="text-slate-400">Fecha y Hora</span>
                <span class="font-bold text-[#0b1329]">{{ formatearResumenFecha }}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-200/60">
                <span class="text-slate-400">Valor</span>
                <span class="font-bold text-[#991b1b]">${{ negocio.precio_base?.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Estado</span>
                <span class="font-bold text-amber-600">Pendiente</span>
              </div>
            </div>
  
            <div class="space-y-2 pt-2">
              <a 
                :href="enlaceWhatsApp" 
                target="_blank"
                class="w-full bg-emerald-600 hover:bg-emerald-700 transition text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs"
              >
                Escribir por WhatsApp
              </a>
              <button 
                @click="$emit('close')"
                class="w-full bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-bold py-3 px-4 rounded-xl text-xs"
              >
                Volver al inicio
              </button>
            </div>
          </div>
  
        </div>
  
        <!-- FOOTER -->
        <div v-if="paso < 3" class="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col gap-2">
          <button 
            @click="avanzarPaso"
            :disabled="!esValido"
            :class="esValido ? 'bg-[#991b1b] hover:bg-[#7f1d1d] shadow-lg cursor-pointer' : 'bg-slate-300 cursor-not-allowed'"
            class="w-full text-white font-bold py-3.5 px-4 rounded-xl transition text-sm"
          >
            {{ paso === 1 ? 'Continuar' : 'Confirmar cita' }}
          </button>
        </div>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { toast } from 'vue3-toastify'
  import { supabase } from '@/services/supabase'
  import { barberService } from '@/services/barberService'
  
  const props = defineProps({
    negocio: { type: Object, required: true },
    barberoSeleccionado: { type: Object, required: true }
  })
  
  const emit = defineEmits(['close'])
  
  const paso = ref(1)
  const diasDisponibles = ref([])
  const diaSeleccionado = ref('')
  const horasDisponibles = ref([])
  const horaSeleccionada = ref(null)
  const cargandoHorarios = ref(false)
  
  const form = ref({
    nombre: '',
    telefono: '',
    direccion: '',
    referencias: ''
  })
  
  // Generar los próximos 4 días dinámicamente basados en la fecha del PC
  onMounted(() => {
    const diasArr = []
    const hoy = new Date()
    
    for (let i = 0; i < 4; i++) {
      const d = new Date()
      d.setDate(hoy.getDate() + i)
      
      const anio = d.getFullYear()
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const diaNum = String(d.getDate()).padStart(2, '0')
      const fechaStr = `${anio}-${mes}-${diaNum}`
      
      let nombreDia = 'Hoy'
      if (i === 1) nombreDia = 'Mañana'
      else if (i > 1) {
        nombreDia = d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', '')
        nombreDia = nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)
      }
  
      diasArr.push({
        nombreDia,
        numeroDia: diaNum,
        fechaStr
      })
    }
  
    diasDisponibles.value = diasArr
    diaSeleccionado.value = diasArr[0].fechaStr
    calcularHorasDisponibles()
  })
  
  async function seleccionarDia(fecha) {
    diaSeleccionado.value = fecha
    horaSeleccionada.value = null
    await calcularHorasDisponibles()
  }
  
  // Calcular bloques de hora (9 AM a 7 PM) y verificar cruces en Supabase
  async function calcularHorasDisponibles() {
    cargandoHorarios.value = true
    try {
      const ahora = new Date()
      const esHoy = diaSeleccionado.value === ahora.toISOString().split('T')[0]
  
      // Consultar citas ya reservadas para este barbero
      const { data: citas, error } = await supabase
        .from('citas')
        .select('fecha_hora_inicio, fecha_hora_fin')
        .eq('barbero_id', props.barberoSeleccionado.id)
        .eq('estado', 'pendiente')
  
      if (error) throw error
  
      const bloques = [
        { hora: 9, label: '9:00 a. m.' },
        { hora: 10, label: '10:00 a. m.' },
        { hora: 11, label: '11:00 a. m.' },
        { hora: 12, label: '12:00 m.' },
        { hora: 13, label: '1:00 p. m.' },
        { hora: 14, label: '2:00 p. m.' },
        { hora: 15, label: '3:00 p. m.' },
        { hora: 16, label: '4:00 p. m.' },
        { hora: 17, label: '5:00 p. m.' },
        { hora: 18, label: '6:00 p. m.' },
        { hora: 19, label: '7:00 p. m.' },
      ]
  
      horasDisponibles.value = bloques.map(b => {
        // Construir la fecha ISO para este bloque
        const [anio, mes, dia] = diaSeleccionado.value.split('-')
        const fechaBloqueInicio = new Date(anio, mes - 1, dia, b.hora, 0, 0)
        const fechaBloqueFin = new Date(fechaBloqueInicio.getTime() + 60 * 60 * 1000)
  
        let ocupada = false
  
        // 1. Si es HOY, aplicar regla de 2 horas de anticipación
        if (esHoy) {
          const diferenciaHoras = (fechaBloqueInicio - ahora) / (1000 * 60 * 60)
          if (diferenciaHoras < 2) {
            ocupada = true
          }
        }
  
        // 2. Verificar cruces con citas existentes en la base de datos
        const hayCruce = citas?.some(cita => {
          const citaInicio = new Date(cita.fecha_hora_inicio)
          const citaFin = new Date(cita.fecha_hora_fin)
          return fechaBloqueInicio < citaFin && fechaBloqueFin > citaInicio
        })
  
        if (hayCruce) {
          ocupada = true
        }
  
        return {
          label: b.label,
          valorIso: fechaBloqueInicio.toISOString(),
          ocupada
        }
      })
    } catch (err) {
      console.error('Error al calcular horarios:', err)
    } finally {
      cargandoHorarios.value = false
    }
  }
  
  const tituloPaso = computed(() => {
    if (paso.value === 1) return 'Separar cita'
    if (paso.value === 2) return 'Tus datos'
    return 'Cita separada'
  })
  
  const esValido = computed(() => {
    if (paso.value === 1) return horaSeleccionada.value !== null
    if (paso.value === 2) {
      if (!form.value.nombre || !form.value.telefono) return false
      if (props.negocio.tipo === 'independiente' && !form.value.direccion) return false
      return true
    }
    return true
  })
  
  async function avanzarPaso() {
    if (paso.value === 1) {
      paso.value = 2
    } else if (paso.value === 2) {
      try {
        await barberService.crearCita({
          negocios_id: props.negocio.id,
          barbero_id: props.barberoSeleccionado.id,
          cliente_nombre: form.value.nombre,
          cliente_telefono: form.value.telefono,
          fecha_hora_inicio_str: horaSeleccionada.value
        })
        paso.value = 3
        toast.success('¡Cita registrada con éxito!')
      } catch (error) {
        toast.error(error.message || 'Error al guardar la cita')
      }
    }
  }
  
  const formatearResumenFecha = computed(() => {
    if (!horaSeleccionada.value) return ''
    const fecha = new Date(horaSeleccionada.value)
    return fecha.toLocaleString('es-CO', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  })
  
  const enlaceWhatsApp = computed(() => {
    const tel = props.negocio.telefono || '3101234567'
    const msg = encodeURIComponent(`Hola, acabo de separar una cita para el ${formatearResumenFecha.value} con ${props.barberoSeleccionado.nombre}. Mi nombre es ${form.value.nombre}.`)
    return `https://wa.me/57${tel}?text=${msg}`
  })
  
  function obtenerIniciales(nombre) {
    if (!nombre) return 'BB'
    return nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }
  </script>