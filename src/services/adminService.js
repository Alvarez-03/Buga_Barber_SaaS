import { supabase } from '@/services/supabase'
import imageCompression from 'browser-image-compression'

function extraerRutaBarberosAssets(url) {
  if (!url || typeof url !== 'string') return null
  const marcador = '/storage/v1/object/public/barber-assets/'
  const idx = url.indexOf(marcador)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marcador.length).split('?')[0])
}

export const adminService = {
  async obtenerEquipo(negocioId) {
    const { data: barberos, error } = await supabase
      .from('barberos')
      .select('id, negocios_id, nombre, email, telefono, avatar_url, rol, activo, personas_en_espera, dias_disponibles, hora_inicio, hora_fin')
      .eq('negocios_id', negocioId)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!barberos || barberos.length === 0) return []

    const inicioDia = new Date()
    inicioDia.setHours(0, 0, 0, 0)
    const finDia = new Date()
    finDia.setHours(23, 59, 59, 999)

    const { data: citasHoy } = await supabase
      .from('citas')
      .select('barbero_id')
      .eq('negocios_id', negocioId)
      .eq('estado', 'pendiente')
      .gte('fecha_hora_inicio', inicioDia.toISOString())
      .lte('fecha_hora_inicio', finDia.toISOString())

    const conteoPorBarbero = (citasHoy || []).reduce((acc, cita) => {
      acc[cita.barbero_id] = (acc[cita.barbero_id] || 0) + 1
      return acc
    }, {})

    return barberos.map((b) => ({
      ...b,
      citas_hoy: conteoPorBarbero[b.id] || 0
    }))
  },

  async contarCitasPendientesBarbero(barberoId) {
    const { count, error } = await supabase
      .from('citas')
      .select('id', { count: 'exact', head: true })
      .eq('barbero_id', barberoId)
      .eq('estado', 'pendiente')

    if (error) throw error
    return count || 0
  },

  async crearBarberoLocal(negocioId, { nombre, email, telefono, activo = true, diasDisponibles, horaInicio, horaFin }) {
    const emailLimpio = email.trim().toLowerCase()

    const { data: existente, error: errBusqueda } = await supabase
      .from('barberos')
      .select('id, negocios_id, rol')
      .eq('email', emailLimpio)
      .maybeSingle()

    if (errBusqueda) throw errBusqueda

    if (existente) {
      if (existente.negocios_id) {
        throw new Error('Este correo ya pertenece a un establecimiento registrado.')
      }

      const { data: vinculado, error: errVincular } = await supabase
        .from('barberos')
        .update({
          negocios_id: negocioId,
          nombre: nombre.trim(),
          telefono: telefono?.trim() || null,
          rol: 'barbero_local',
          activo: Boolean(activo),
          dias_disponibles: diasDisponibles || ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
          hora_inicio: horaInicio || '09:00',
          hora_fin: horaFin || '20:00'
        })
        .eq('id', existente.id)
        .select()
        .single()

      if (errVincular) throw errVincular
      return { ...vinculado, citas_hoy: 0 }
    }

    const payload = {
      negocios_id: negocioId,
      nombre: nombre.trim(),
      email: emailLimpio,
      telefono: telefono?.trim() || null,
      rol: 'barbero_local',
      activo: Boolean(activo),
      personas_en_espera: 0,
      dias_disponibles: diasDisponibles || ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'],
      hora_inicio: horaInicio || '09:00',
      hora_fin: horaFin || '20:00'
    }

    const { data, error } = await supabase
      .from('barberos')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return { ...data, citas_hoy: 0 }
  },

  async buscarBarberosIndependientes() {
    const { data: barberos, error } = await supabase
      .from('barberos')
      .select('id, nombre, email, telefono, avatar_url, rol, activo, negocios_id, dias_disponibles, hora_inicio, hora_fin')
      .eq('rol', 'barbero_independiente')
      .is('negocios_id', null)
      .order('nombre', { ascending: true })

    if (error) throw error
    if (!barberos || barberos.length === 0) return []

    const ids = barberos.map((b) => b.id)
    const { data: fotos } = await supabase
      .from('portafolio_fotos')
      .select('id, barbero_id, imagen_url, descripcion')
      .in('barbero_id', ids)
      .order('created_at', { ascending: false })

    const fotosPorBarbero = (fotos || []).reduce((acc, foto) => {
      if (!acc[foto.barbero_id]) acc[foto.barbero_id] = []
      if (acc[foto.barbero_id].length < 3) acc[foto.barbero_id].push(foto)
      return acc
    }, {})

    return barberos.map((b) => ({
      ...b,
      fotos: fotosPorBarbero[b.id] || []
    }))
  },

  async vincularBarberoIndependiente(barberoId, negocioId) {
    const { data, error } = await supabase
      .from('barberos')
      .update({
        negocios_id: negocioId,
        rol: 'barbero_local'
      })
      .eq('id', barberoId)
      .eq('rol', 'barbero_independiente')
      .is('negocios_id', null)
      .select()
      .single()

    if (error) throw error
    return { ...data, citas_hoy: 0 }
  },

  async eliminarBarberoDeEquipo(barberoId) {
    const { error: errCitas } = await supabase
      .from('citas')
      .delete()
      .eq('barbero_id', barberoId)
      .eq('estado', 'pendiente')

    if (errCitas) throw errCitas

    const { data, error } = await supabase
      .from('barberos')
      .update({
        negocios_id: null,
        rol: 'barbero_independiente',
        activo: false,
        personas_en_espera: 0
      })
      .eq('id', barberoId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async obtenerNegocioPorId(negocioId) {
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('id', negocioId)
      .single()

    if (error) throw error
    return data
  },

  async actualizarNegocioAdmin(negocioId, payload) {
    const { data, error } = await supabase
      .from('negocios')
      .update(payload)
      .eq('id', negocioId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async eliminarLogoAnterior(logoUrl) {
    const rutaAnterior = extraerRutaBarberosAssets(logoUrl)
    if (!rutaAnterior) return

    const { error } = await supabase.storage
      .from('barber-assets')
      .remove([rutaAnterior])

    if (error) {
      console.warn('No se pudo eliminar el logo anterior en Storage:', error)
    }
  },

  async subirLogoNegocio(negocioId, archivo, logoAnteriorUrl = null) {
    // 1. Eliminar primero el logo anterior si existía en barber-assets
    if (logoAnteriorUrl) {
      await this.eliminarLogoAnterior(logoAnteriorUrl)
    }

    // 2. Comprimir y subir el nuevo logo
    let archivoFinal = archivo
    try {
      archivoFinal = await imageCompression(archivo, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true
      })
    } catch (err) {
      console.warn('No se pudo comprimir el logo, se sube original:', err)
    }

    const ext = archivo.name?.includes('.') ? archivo.name.split('.').pop().toLowerCase() : 'jpg'
    const ruta = `logos/${negocioId}-${Date.now()}.${ext}`

    const { error: errUpload } = await supabase.storage
      .from('barber-assets')
      .upload(ruta, archivoFinal, {
        cacheControl: '3600',
        upsert: true
      })

    if (errUpload) throw errUpload

    const { data } = supabase.storage.from('barber-assets').getPublicUrl(ruta)
    return data.publicUrl
  }
}