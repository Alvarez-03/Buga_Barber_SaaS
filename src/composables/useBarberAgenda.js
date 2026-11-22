import { ref, computed, onMounted, onUnmounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'
import { agendaService } from '@/services/agendaService'

export function useBarberAgenda() {
  const authStore = useAuthStore()
  const citasDelDia = ref([])
  const cargando = ref(false)
  const cancelandoId = ref(null)
  let canalRealtime = null

  const diasSemana = computed(() => {
    const hoy = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i)
      const yyyy = fecha.getFullYear()
      const mm = String(fecha.getMonth() + 1).padStart(2, '0')
      const dd = String(fecha.getDate()).padStart(2, '0')

      return {
        etiqueta: i === 0 ? 'Hoy' : fecha.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
        numero: String(fecha.getDate()),
        fechaStr: `${yyyy}-${mm}-${dd}`,
        completa: fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
      }
    })
  })

  const diaSeleccionado = ref(diasSemana.value[0].fechaStr)

  const fechaCompletaLabel = computed(() =>
    diasSemana.value.find((d) => d.fechaStr === diaSeleccionado.value)?.completa || ''
  )

  const horaCierreBarbero = computed(() => {
    const [h, m] = (authStore.barbero?.hora_fin || '20:00').split(':').map(Number)
    const date = new Date()
    date.setHours(h || 20, m || 0, 0, 0)
    return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })
  })

  function formatearCita(cita) {
    const horaFormateada = new Date(cita.fecha_hora_inicio).toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const [horaCorta, ...resto] = horaFormateada.split(' ')
    return {
      ...cita,
      horaCorta: horaCorta || horaFormateada,
      periodo: resto.join(' ') || ''
    }
  }

  async function cargarCitas() {
    const barberoId = authStore.barbero?.id
    if (!barberoId) return

    cargando.value = true
    try {
      const [anio, mes, dia] = diaSeleccionado.value.split('-').map(Number)
      const inicioDia = new Date(anio, mes - 1, dia, 0, 0, 0, 0).toISOString()
      const finDia = new Date(anio, mes - 1, dia, 23, 59, 59, 999).toISOString()

      const data = await agendaService.obtenerCitasPorRango(barberoId, inicioDia, finDia)
      citasDelDia.value = data.map(formatearCita)
    } catch (err) {
      console.error('Error al cargar agenda:', err)
      toast.error('No se pudieron cargar las citas')
    } finally {
      cargando.value = false
    }
  }

  async function seleccionarDia(fechaStr) {
    diaSeleccionado.value = fechaStr
    await cargarCitas()
  }

  async function cancelarCita(cita) {
    if (!confirm(`¿Cancelar la cita de ${cita.cliente_nombre} a las ${cita.horaCorta} ${cita.periodo}?`)) {
      return
    }

    cancelandoId.value = cita.id
    try {
      await agendaService.cancelarCita(cita.id, authStore.barbero.id)
      cita.estado = 'cancelada'
      toast.success('Cita cancelada correctamente')
    } catch (err) {
      console.error('Error al cancelar cita:', err)
      toast.error('No se pudo cancelar la cita')
    } finally {
      cancelandoId.value = null
    }
  }

  const limpiarTelefono = (tel) => (tel || '').replace(/\D/g, '')

  onMounted(async () => {
    if (authStore.loading) await authStore.initSession()
    await cargarCitas()

    if (authStore.barbero?.id) {
      canalRealtime = agendaService.suscribirCambiosCitas(authStore.barbero.id, cargarCitas)
    }
  })

  onUnmounted(() => agendaService.desuscribirCanal(canalRealtime))

  return {
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
  }
}