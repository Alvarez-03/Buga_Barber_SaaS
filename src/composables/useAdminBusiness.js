import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { toast } from 'vue3-toastify'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuthStore } from '@/stores/authStore'
import { adminService } from '@/services/adminService'

const DEFAULT_LAT = 3.9009
const DEFAULT_LNG = -76.2978

export function useAdminBusiness() {
  const authStore = useAuthStore()

  const mapContainer = ref(null)
  const logoInput = ref(null)
  const logoFile = ref(null)
  const logoPreview = ref('')
  const guardando = ref(false)
  const modalConfirmarAbierto = ref(false)

  const form = reactive({
    nombre: '',
    direccion: '',
    telefono: '',
    precioBase: 0,
    lat: DEFAULT_LAT,
    lng: DEFAULT_LNG,
    slugUrl: ''
  })

  let mapInstance = null
  let markerInstance = null

  const negocioId = computed(() => authStore.negocio?.id || authStore.barbero?.negocios_id || null)
  const estadoTexto = computed(() => (authStore.negocio?.estado_suscripcion ? 'Activo' : 'Inactivo'))

  const inicialesNegocio = computed(() => {
    const base = form.nombre || 'BB'
    return base
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  })

  function actualizarPosicionMapa(lat, lng, centrar = true) {
    const latNum = Number(lat) || DEFAULT_LAT
    const lngNum = Number(lng) || DEFAULT_LNG
    form.lat = Number(latNum.toFixed(6))
    form.lng = Number(lngNum.toFixed(6))

    if (markerInstance) {
      markerInstance.setLatLng([form.lat, form.lng])
    }
    if (mapInstance && centrar) {
      mapInstance.setView([form.lat, form.lng], mapInstance.getZoom())
    }
  }

  function sincronizarNegocio() {
    const n = authStore.negocio
    if (!n) return
    form.nombre = n.nombre || ''
    form.direccion = n.direccion || ''
    form.telefono = n.telefono || ''
    form.precioBase = Number(n.precio_base ?? 0)
    form.lat = Number(n.lat ?? DEFAULT_LAT)
    form.lng = Number(n.lng ?? DEFAULT_LNG)
    form.slugUrl = n.slug_url || ''
    if (!logoFile.value) {
      logoPreview.value = n.logo_url || ''
    }
    actualizarPosicionMapa(form.lat, form.lng, true)
  }

  async function initMapa() {
    await nextTick()
    if (!mapContainer.value || mapInstance) return

    mapInstance = L.map(mapContainer.value, {
      center: [form.lat, form.lng],
      zoom: 15
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(mapInstance)

    const pinIcon = L.divIcon({
      className: 'custom-pin-buga',
      html: `<div style="width:28px;height:28px;border-radius:9999px;background:#991b1b;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })

    markerInstance = L.marker([form.lat, form.lng], {
      draggable: true,
      icon: pinIcon
    }).addTo(mapInstance)

    markerInstance.on('dragend', () => {
      const pos = markerInstance.getLatLng()
      actualizarPosicionMapa(pos.lat, pos.lng, false)
    })

    mapInstance.on('click', (e) => {
      actualizarPosicionMapa(e.latlng.lat, e.latlng.lng, false)
    })
  }

  watch(
    () => authStore.negocio,
    () => {
      sincronizarNegocio()
    },
    { immediate: true }
  )

  onMounted(async () => {
    if (authStore.loading) await authStore.initSession()
    if (negocioId.value) {
      try {
        const fresco = await adminService.obtenerNegocioPorId(negocioId.value)
        if (fresco && authStore.negocio) {
          Object.assign(authStore.negocio, fresco)
        }
      } catch (err) {
        console.warn('No se pudo refrescar negocio:', err)
      }
    }
    sincronizarNegocio()
    await initMapa()
  })

  onUnmounted(() => {
    if (logoPreview.value?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview.value)
    }
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }
  })

  function triggerLogoInput() {
    logoInput.value?.click()
  }

  function onLogoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.warning('Selecciona una imagen válida para el logo')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.warning('El logo debe pesar máximo 3 MB')
      return
    }

    if (logoPreview.value?.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview.value)
    }
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
    toast.info('Nuevo logo seleccionado. Pulsa "Guardar cambios" para confirmar')
  }

  function validarFormularioNegocio() {
    if (!form.nombre.trim()) {
      toast.warning('El nombre de la barbería es obligatorio')
      return false
    }
    if (!form.direccion.trim()) {
      toast.warning('La dirección del local es obligatoria')
      return false
    }
    const telLimpio = (form.telefono || '').replace(/\D/g, '')
    if (telLimpio.length < 7) {
      toast.warning('Ingresa un teléfono válido')
      return false
    }
    if (Number(form.precioBase) <= 0) {
      toast.warning('El precio base debe ser mayor a 0')
      return false
    }
    if (Number.isNaN(Number(form.lat)) || Number.isNaN(Number(form.lng))) {
      toast.warning('Selecciona una ubicación válida en el mapa')
      return false
    }
    return true
  }

  function solicitarGuardarNegocio() {
    if (!negocioId.value) return
    if (!validarFormularioNegocio()) return
    modalConfirmarAbierto.value = true
  }

  function cancelarGuardarNegocio() {
    modalConfirmarAbierto.value = false
  }

  async function confirmarGuardarNegocio() {
    if (!negocioId.value) return
    if (!validarFormularioNegocio()) return

    guardando.value = true
    try {
      const logoAnteriorUrl = authStore.negocio?.logo_url || null
      let logoUrlFinal = logoPreview.value?.startsWith('blob:')
        ? logoAnteriorUrl
        : (logoPreview.value || null)

      if (logoFile.value) {
        logoUrlFinal = await adminService.subirLogoNegocio(
          negocioId.value,
          logoFile.value,
          logoAnteriorUrl
        )
        if (logoPreview.value?.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview.value)
        }
        logoFile.value = null
        logoPreview.value = logoUrlFinal
      }

      const actualizado = await adminService.actualizarNegocioAdmin(negocioId.value, {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim(),
        precio_base: Number(form.precioBase),
        lat: Number(form.lat),
        lng: Number(form.lng),
        logo_url: logoUrlFinal
      })

      if (authStore.negocio) {
        Object.assign(authStore.negocio, actualizado)
      }
      modalConfirmarAbierto.value = false
      toast.success('Información, logo y ubicación de la barbería guardados')
    } catch (err) {
      console.error('Error al guardar negocio:', err)
      toast.error(err?.message || 'No se pudieron guardar los cambios del negocio')
    } finally {
      guardando.value = false
    }
  }

  return {
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
  }
}