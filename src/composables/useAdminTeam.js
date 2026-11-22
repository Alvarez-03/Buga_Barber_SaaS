import { ref, reactive, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'
import { adminService } from '@/services/adminService'

export const LISTA_DIAS_ADMIN = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' }
]

export function useAdminTeam() {
  const authStore = useAuthStore()

  const equipo = ref([])
  const independientes = ref([])
  const cargandoEquipo = ref(false)
  const cargandoIndependientes = ref(false)
  const guardando = ref(false)

  const vistaActiva = ref('equipo') // 'equipo' | 'buscar'
  const modalNuevoAbierto = ref(false)
  const modalEliminar = reactive({
    abierto: false,
    barbero: null,
    citasPendientes: 0
  })

  const nuevoBarbero = reactive({
    nombre: '',
    email: '',
    telefono: '',
    activo: true,
    diasDisponibles: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
    horaInicio: '09:00',
    horaFin: '20:00',
    confirmadoPorUsuario: false
  })

  const busqueda = ref('')
  const filtroEstilo = ref('todos')

  const negocioId = computed(() => authStore.negocio?.id || authStore.barbero?.negocios_id || null)
  const negocioNombre = computed(() => authStore.negocio?.nombre || 'Establecimiento')
  const suscripcionActiva = computed(() => Boolean(authStore.negocio?.estado_suscripcion))

  const independientesFiltrados = computed(() => {
    const q = busqueda.value.trim().toLowerCase()
    return independientes.value.filter((b) => {
      if (filtroEstilo.value === 'disponibles' && !b.activo) return false
      if (!q) return true
      return (
        (b.nombre || '').toLowerCase().includes(q) ||
        (b.email || '').toLowerCase().includes(q) ||
        (b.telefono || '').toLowerCase().includes(q)
      )
    })
  })

  async function cargarEquipo() {
    if (!negocioId.value) return
    cargandoEquipo.value = true
    try {
      equipo.value = await adminService.obtenerEquipo(negocioId.value)
    } catch (err) {
      console.error('Error al cargar equipo:', err)
      toast.error('No se pudo cargar el equipo')
    } finally {
      cargandoEquipo.value = false
    }
  }

  async function cargarIndependientes() {
    cargandoIndependientes.value = true
    try {
      independientes.value = await adminService.buscarBarberosIndependientes()
    } catch (err) {
      console.error('Error al buscar barberos independientes:', err)
      toast.error('No se pudieron cargar los barberos independientes')
    } finally {
      cargandoIndependientes.value = false
    }
  }

  watch(
    () => negocioId.value,
    (id) => {
      if (id) cargarEquipo()
    },
    { immediate: true }
  )

  onMounted(async () => {
    if (authStore.loading) await authStore.initSession()
    if (negocioId.value) await cargarEquipo()
  })

  function toggleDiaNuevoBarbero(key) {
    const idx = nuevoBarbero.diasDisponibles.indexOf(key)
    if (idx === -1) nuevoBarbero.diasDisponibles.push(key)
    else nuevoBarbero.diasDisponibles.splice(idx, 1)
  }

  function abrirModalNuevo() {
    nuevoBarbero.nombre = ''
    nuevoBarbero.email = ''
    nuevoBarbero.telefono = ''
    nuevoBarbero.activo = true
    nuevoBarbero.diasDisponibles = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab']
    nuevoBarbero.horaInicio = '09:00'
    nuevoBarbero.horaFin = '20:00'
    nuevoBarbero.confirmadoPorUsuario = false
    modalNuevoAbierto.value = true
  }

  function validarFormularioBarbero() {
    if (!nuevoBarbero.nombre.trim() || nuevoBarbero.nombre.trim().length < 2) {
      toast.warning('Ingresa el nombre completo del barbero')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(nuevoBarbero.email.trim())) {
      toast.warning('Ingresa un correo de Google válido')
      return false
    }
    const telLimpio = (nuevoBarbero.telefono || '').replace(/\D/g, '')
    if (telLimpio.length < 7) {
      toast.warning('Ingresa un número de teléfono válido')
      return false
    }
    if (nuevoBarbero.diasDisponibles.length === 0) {
      toast.warning('Selecciona al menos un día disponible')
      return false
    }
    if (nuevoBarbero.horaInicio >= nuevoBarbero.horaFin) {
      toast.warning('La hora de fin debe ser mayor que la de inicio')
      return false
    }
    if (!nuevoBarbero.confirmadoPorUsuario) {
      toast.warning('Confirma que deseas agregar este barbero a tu barbería')
      return false
    }
    return true
  }

  async function crearBarbero() {
    if (!negocioId.value) {
      toast.error('No se encontró el negocio del administrador')
      return
    }
    if (!validarFormularioBarbero()) return

    guardando.value = true
    try {
      const creado = await adminService.crearBarberoLocal(negocioId.value, {
        nombre: nuevoBarbero.nombre,
        email: nuevoBarbero.email,
        telefono: nuevoBarbero.telefono,
        activo: nuevoBarbero.activo,
        diasDisponibles: [...nuevoBarbero.diasDisponibles],
        horaInicio: nuevoBarbero.horaInicio,
        horaFin: nuevoBarbero.horaFin
      })
      equipo.value.push(creado)
      modalNuevoAbierto.value = false
      toast.success(`${creado.nombre} agregado como barbero de ${negocioNombre.value}`)
    } catch (err) {
      console.error('Error al crear barbero:', err)
      toast.error(err?.message || 'No se pudo crear el barbero')
    } finally {
      guardando.value = false
    }
  }

  async function solicitarEliminarBarbero(barbero) {
    if (!barbero?.id) return
    if (barbero.id === authStore.barbero?.id) {
      toast.warning('No puedes eliminarte a ti mismo como administrador')
      return
    }

    guardando.value = true
    try {
      const citasPendientes = await adminService.contarCitasPendientesBarbero(barbero.id)
      modalEliminar.barbero = barbero
      modalEliminar.citasPendientes = citasPendientes
      modalEliminar.abierto = true
    } catch (err) {
      console.error('Error al consultar citas del barbero:', err)
      toast.error('No se pudo verificar la información del barbero')
    } finally {
      guardando.value = false
    }
  }

  function cancelarEliminacion() {
    modalEliminar.abierto = false
    modalEliminar.barbero = null
    modalEliminar.citasPendientes = 0
  }

  async function confirmarEliminarBarbero() {
    const barbero = modalEliminar.barbero
    if (!barbero?.id) return

    guardando.value = true
    try {
      await adminService.eliminarBarberoDeEquipo(barbero.id)
      equipo.value = equipo.value.filter((item) => item.id !== barbero.id)
      cancelarEliminacion()
      toast.info(`${barbero.nombre} salió del equipo y quedó como barbero independiente`)
    } catch (err) {
      console.error('Error al eliminar barbero:', err)
      toast.error('No se pudo eliminar al barbero del equipo')
    } finally {
      guardando.value = false
    }
  }

  async function irABuscarBarberos() {
    vistaActiva.value = 'buscar'
    await cargarIndependientes()
  }

  function volverAEquipo() {
    vistaActiva.value = 'equipo'
  }

  async function invitarBarberoIndependiente(barbero) {
    if (!negocioId.value || !barbero?.id) return

    const seguro = window.confirm(
      `¿Deseas invitar y sumar a ${barbero.nombre} a tu equipo en ${negocioNombre.value}?`
    )
    if (!seguro) return

    guardando.value = true
    try {
      const vinculado = await adminService.vincularBarberoIndependiente(barbero.id, negocioId.value)
      independientes.value = independientes.value.filter((b) => b.id !== barbero.id)
      equipo.value.push(vinculado)
      toast.success(`${barbero.nombre} ahora hace parte de tu equipo`)
    } catch (err) {
      console.error('Error al invitar barbero:', err)
      toast.error('No se pudo sumar al barbero al equipo')
    } finally {
      guardando.value = false
    }
  }

  function iniciales(nombre = '') {
    if (!nombre) return 'BB'
    return nombre
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  return {
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
  }
}