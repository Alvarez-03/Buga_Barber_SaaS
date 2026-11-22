import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'
import { profileService } from '@/services/profileService'

export const MAX_FOTOS_PORTAFOLIO = 4
export const MAX_SIZE_MB = 3
export const BUCKET_AVATARS = 'avatars'
export const BUCKET_PORTAFOLIO = 'portafolio'

export const ROLES_USUARIO = {
  BARBERO_INDEPENDIENTE: 'barbero_independiente',
  BARBERO_LOCAL: 'barbero_local',
  ADMIN_BARBERIA: 'admin_barberia'
}

export const LISTA_DIAS = [
  { key: 'lun', label: 'Lun' },
  { key: 'mar', label: 'Mar' },
  { key: 'mie', label: 'Mié' },
  { key: 'jue', label: 'Jue' },
  { key: 'vie', label: 'Vie' },
  { key: 'sab', label: 'Sáb' },
  { key: 'dom', label: 'Dom' }
]

export const HORAS_OPCIONES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00'
]

function obtenerExtension(nombreArchivo = '') {
  if (!nombreArchivo.includes('.')) return 'jpg'
  return nombreArchivo.split('.').pop().toLowerCase() || 'jpg'
}

export function useBarberProfile() {
  const router = useRouter()
  const authStore = useAuthStore()

  const maxFotos = MAX_FOTOS_PORTAFOLIO
  const modalHorariosAbierto = ref(false)
  const guardando = ref(false)

  const avatarFile = ref(null)
  const avatarPreview = ref('')
  const avatarInput = ref(null)
  const portfolioInput = ref(null)

  const perfil = reactive({
    nombre: '',
    telefono: '',
    precioBase: 0
  })

  const disponibilidad = reactive({
    dias: ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
    horaInicio: '09:00',
    horaFin: '20:00'
  })

  const fotos = ref([])

  // Rol efectivo: si no tiene negocio vinculado, siempre es barbero_independiente
  const rolEfectivo = computed(() => {
    const b = authStore.barbero
    const negocioId = b?.negocios_id || authStore.negocio?.id || null
    if (!negocioId) {
      return ROLES_USUARIO.BARBERO_INDEPENDIENTE
    }
    if (b?.rol === ROLES_USUARIO.ADMIN_BARBERIA) {
      return ROLES_USUARIO.ADMIN_BARBERIA
    }
    return ROLES_USUARIO.BARBERO_LOCAL
  })

  const rolEtiqueta = computed(() => {
    if (rolEfectivo.value === ROLES_USUARIO.ADMIN_BARBERIA) return 'Administrador de barbería'
    if (rolEfectivo.value === ROLES_USUARIO.BARBERO_LOCAL) return 'Barbero de barbería'
    return 'Barbero independiente'
  })

  const esAdminBarberia = computed(() => rolEfectivo.value === ROLES_USUARIO.ADMIN_BARBERIA)
  const esBarberoDeBarberia = computed(() => rolEfectivo.value === ROLES_USUARIO.BARBERO_LOCAL)

  const tituloPortafolio = computed(() => {
    if (esAdminBarberia.value) return 'Catálogo de la barbería'
    if (esBarberoDeBarberia.value) return 'Mi portafolio personal (no visible en catálogo de la barbería)'
    return 'Mi portafolio'
  })

  const negocioNombre = computed(() => {
    if (rolEfectivo.value === ROLES_USUARIO.BARBERO_INDEPENDIENTE) {
      return authStore.negocio?.nombre || 'Barbero independiente'
    }
    return authStore.negocio?.nombre || 'Establecimiento no vinculado'
  })

  const iniciales = computed(() => {
    const base = perfil.nombre || authStore.user?.email || 'BB'
    return base
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  })

  const resumenDisponibilidad = computed(() => {
    const diasTexto =
      disponibilidad.dias.length === 7
        ? 'Lun–Dom'
        : disponibilidad.dias
            .map((k) => LISTA_DIAS.find((d) => d.key === k)?.label)
            .filter(Boolean)
            .join(', ')
    return `${diasTexto || 'Sin días'} • ${disponibilidad.horaInicio} - ${disponibilidad.horaFin}`
  })

  function limpiarPreviewTemporal() {
    if (avatarPreview.value?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview.value)
    }
  }

  function sincronizarDesdeStore() {
    const b = authStore.barbero
    const n = authStore.negocio
    const meta = authStore.user?.user_metadata || {}

    perfil.nombre = b?.nombre || meta.full_name || meta.name || ''
    perfil.telefono = n?.telefono || b?.telefono || ''
    perfil.precioBase = Number(n?.precio_base ?? 0)

    if (!avatarFile.value) {
      avatarPreview.value = b?.avatar_url || meta.avatar_url || meta.picture || ''
    }

    if (Array.isArray(b?.dias_disponibles) && b.dias_disponibles.length > 0) {
      disponibilidad.dias = [...b.dias_disponibles]
    }
    if (b?.hora_inicio) disponibilidad.horaInicio = b.hora_inicio
    if (b?.hora_fin) disponibilidad.horaFin = b.hora_fin
  }

  async function cargarPortafolio() {
    const negocioId = authStore.negocio?.id || authStore.barbero?.negocios_id
    if (!negocioId) {
      fotos.value = []
      return
    }

    try {
      fotos.value = await profileService.obtenerPortafolio({
        negocioId,
        barberoId: esAdminBarberia.value ? null : authStore.barbero?.id || null,
        esAdminNegocio: esAdminBarberia.value,
        limite: maxFotos
      })
    } catch (err) {
      console.error('Error al cargar portafolio:', err)
    }
  }

  watch(
    () => [authStore.barbero, authStore.negocio, authStore.user],
    () => {
      sincronizarDesdeStore()
    },
    { immediate: true }
  )

  watch(
    () => [authStore.negocio?.id, authStore.barbero?.id, rolEfectivo.value],
    () => {
      cargarPortafolio()
    }
  )

  onMounted(async () => {
    if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    if (authStore.loading) {
      await authStore.initSession()
    }
    sincronizarDesdeStore()
    await cargarPortafolio()
  })

  onUnmounted(() => {
    limpiarPreviewTemporal()
  })

  function toggleDia(key) {
    const idx = disponibilidad.dias.indexOf(key)
    if (idx === -1) disponibilidad.dias.push(key)
    else disponibilidad.dias.splice(idx, 1)
  }

  function confirmarHorarios() {
    if (disponibilidad.dias.length === 0) {
      toast.warning('Selecciona al menos un día disponible')
      return
    }
    if (disponibilidad.horaInicio >= disponibilidad.horaFin) {
      toast.warning('La hora de fin debe ser mayor que la hora de inicio')
      return
    }
    modalHorariosAbierto.value = false
    toast.success('Horario listo (pulsa Guardar cambios para aplicar)')
  }

  const triggerAvatarInput = () => avatarInput.value?.click()

  const triggerPortfolioInput = () => {
    if (fotos.value.length >= maxFotos) {
      toast.warning(`Solo puedes tener máximo ${maxFotos} fotos en tu portafolio`)
      return
    }
    portfolioInput.value?.click()
  }

  function onAvatarChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.warning('Selecciona un archivo de imagen válido')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.warning(`La foto de perfil debe pesar máximo ${MAX_SIZE_MB} MB`)
      return
    }

    limpiarPreviewTemporal()
    avatarFile.value = file
    avatarPreview.value = URL.createObjectURL(file)
    toast.info('Foto de perfil lista. Pulsa "Guardar cambios" para aplicarla')
  }

  async function onPortfolioChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (fotos.value.length >= maxFotos) {
      toast.warning(`Límite alcanzado: máximo ${maxFotos} imágenes`)
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.warning('Selecciona un archivo de imagen válido')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.warning(`Cada foto del portafolio debe pesar máximo ${MAX_SIZE_MB} MB`)
      return
    }

    const negocioId = authStore.negocio?.id || authStore.barbero?.negocios_id
    if (!negocioId) {
      toast.error('No hay un establecimiento vinculado para guardar la foto')
      return
    }

    guardando.value = true
    try {
      const ext = obtenerExtension(file.name)
      const ruta = `${negocioId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
      const urlPublica = await profileService.subirImagenStorage(BUCKET_PORTAFOLIO, ruta, file)

      const nuevaFoto = await profileService.guardarRegistroPortafolio({
        negocioId,
        barberoId: esAdminBarberia.value ? null : authStore.barbero?.id || null,
        imagenUrl: urlPublica
      })

      fotos.value.unshift(nuevaFoto)
      if (fotos.value.length > maxFotos) {
        fotos.value = fotos.value.slice(0, maxFotos)
      }
      toast.success('Foto agregada al portafolio')
    } catch (err) {
      console.error('Error al subir foto de portafolio:', err)
      toast.error('No se pudo subir la imagen')
    } finally {
      guardando.value = false
    }
  }

  async function eliminarFoto(idx) {
    const foto = fotos.value[idx]
    if (!foto) return

    try {
      if (foto.id) {
        await profileService.eliminarFotoPortafolio(foto.id)
      }
      fotos.value.splice(idx, 1)
      toast.info('Foto eliminada del portafolio')
    } catch (err) {
      console.error('Error al eliminar foto:', err)
      toast.error('No se pudo eliminar la foto')
    }
  }

  async function guardarCambios() {
    if (!perfil.nombre.trim()) {
      toast.warning('El nombre es obligatorio')
      return
    }

    const barberoId = authStore.barbero?.id
    if (!barberoId) return

    guardando.value = true
    try {
      let avatarUrlFinal = avatarPreview.value?.startsWith('blob:')
        ? (authStore.barbero?.avatar_url || null)
        : (avatarPreview.value || null)

      if (avatarFile.value) {
        const ext = obtenerExtension(avatarFile.value.name)
        const rutaAvatar = `${barberoId}/${Date.now()}.${ext}`
        avatarUrlFinal = await profileService.subirImagenStorage(
          BUCKET_AVATARS,
          rutaAvatar,
          avatarFile.value
        )
        limpiarPreviewTemporal()
        avatarFile.value = null
        avatarPreview.value = avatarUrlFinal
      }

      const barberoActualizado = await profileService.actualizarBarbero(barberoId, {
        nombre: perfil.nombre.trim(),
        telefono: perfil.telefono.trim() || null,
        avatar_url: avatarUrlFinal,
        rol: rolEfectivo.value,
        dias_disponibles: disponibilidad.dias,
        hora_inicio: disponibilidad.horaInicio,
        hora_fin: disponibilidad.horaFin
      })

      if (authStore.barbero) {
        Object.assign(authStore.barbero, barberoActualizado)
      }

      if (authStore.negocio?.id) {
        const negocioActualizado = await profileService.actualizarNegocio(authStore.negocio.id, {
          telefono: perfil.telefono.trim() || null,
          precio_base: Number(perfil.precioBase) || 0
        })
        Object.assign(authStore.negocio, negocioActualizado)
      }

      toast.success('Cambios de perfil guardados')
    } catch (err) {
      console.error('Error al guardar cambios de perfil:', err)
      toast.error('No se pudieron guardar los cambios')
    } finally {
      guardando.value = false
    }
  }

  async function cerrarSesion() {
    limpiarPreviewTemporal()
    await authStore.logout()
    router.push('/barbero/login')
  }

  return {
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
    rolEfectivo,
    rolEtiqueta,
    esAdminBarberia,
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
  }
}