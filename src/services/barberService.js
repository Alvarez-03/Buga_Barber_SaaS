import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

// Obtener detalles de un negocio por su slug con sus respectivos barberos y catálogo
export async function obtenerNegocioPorSlug(slug) {
  const { data: negocio, error: errNegocio } = await supabase
    .from('negocios')
    .select('*')
    .eq('slug_url', slug)
    .single()

  if (errNegocio) throw errNegocio

  const { data: barberos, error: errBarberos } = await supabase
    .from('barberos')
    .select('id, negocios_id, nombre, activo, personas_en_espera, avatar_url, rol, telefono, dias_disponibles, hora_inicio, hora_fin')
    .eq('negocios_id', negocio.id)

  if (errBarberos) throw errBarberos

  const { data: fotosCatalogo, error: errFotos } = await supabase
    .from('portafolio_fotos')
    .select('id, negocios_id, barbero_id, imagen_url, descripcion, created_at')
    .eq('negocios_id', negocio.id)
    .is('barbero_id', null)
    .order('created_at', { ascending: false })

  if (errFotos) throw errFotos

  return {
    ...negocio,
    barberos: barberos || [],
    portafolio_fotos: fotosCatalogo || []
  }
}

// Suscribirse a cambios en tiempo real para la fila en vivo de un negocio
export function suscribirseAFilaEnVivo(negocioId, callback) {
  return supabase
    .channel(`public:barberos:negocios_id=eq.${negocioId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'barberos',
        filter: `negocios_id=eq.${negocioId}`
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()
}

export const barberService = {
  // ==========================================
  // 1. DIRECTORIO PÚBLICO (HOME)
  // ==========================================
  async getNegociosActivos() {
    const { data, error } = await supabase
      .from('negocios')
      .select(`
        *,
        barberos ( id, negocios_id, nombre, activo, personas_en_espera, avatar_url, rol ),
        portafolio_fotos ( id, negocios_id, barbero_id, imagen_url, descripcion )
      `)
      .eq('estado_suscripcion', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((negocio) => ({
      ...negocio,
      portafolio_fotos: (negocio.portafolio_fotos || []).filter(
        (foto) => !foto.barbero_id
      )
    }))
  },

  // Obtener detalle de una sola barbería o independiente por su slug
  async getNegocioBySlug(slug) {
    return obtenerNegocioPorSlug(slug)
  },

  // ==========================================
  // 2. MOTOR DE TURNOS Y VALIDACIÓN INTELIGENTE
  // ==========================================

  // Valida y crea la cita calculando bloques de 1 hora y el impacto de la fila física
  async crearCita({
    negocios_id,
    barbero_id,
    cliente_nombre,
    cliente_telefono,
    cliente_email = null,
    fecha_hora_inicio_str
  }) {
    const inicioDeseado = new Date(fecha_hora_inicio_str)
    const ahora = new Date()

    const esHoy = inicioDeseado.toDateString() === ahora.toDateString()

    // REGLA 1: Solo si la cita es para HOY, aplicar la restricción de 2 horas de anticipación y la fila presencial
    if (esHoy) {
      const diferenciaHoras = (inicioDeseado - ahora) / (1000 * 60 * 60)
      if (diferenciaHoras < 2) {
        throw new Error('Para citas el día de hoy, debes programarlas con al menos 2 horas de anticipación.')
      }

      // Consultar estado actual del barbero (Fila presencial) solo para hoy
      const { data: barbero, error: errBarbero } = await supabase
        .from('barberos')
        .select('activo, personas_en_espera')
        .eq('id', barbero_id)
        .single()

      if (errBarbero || !barbero.activo) {
        throw new Error('El barbero seleccionado no se encuentra activo en este momento.')
      }

      if (barbero.personas_en_espera > 0) {
        const tiempoExtraMs = barbero.personas_en_espera * 60 * 60 * 1000
        const primerEspacioReal = new Date(ahora.getTime() + tiempoExtraMs)

        if (inicioDeseado < primerEspacioReal) {
          throw new Error(`El barbero tiene ${barbero.personas_en_espera} persona(s) en espera presencial. El próximo espacio libre estimado es a partir de las ${primerEspacioReal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`)
        }
      }
    }

    // Cada corte toma exactamente 1 hora fija
    const finDeseado = new Date(inicioDeseado.getTime() + 60 * 60 * 1000)

    // REGLA 2: Verificar cruces con otras citas pendientes en ese rango de 1 hora (Aplica para cualquier día)
    const { data: citasExistentes, error: errCitas } = await supabase
      .from('citas')
      .select('id, fecha_hora_inicio, fecha_hora_fin')
      .eq('barbero_id', barbero_id)
      .eq('estado', 'pendiente')

    if (errCitas) throw errCitas

    const hayCruce = citasExistentes.some(cita => {
      const citaInicio = new Date(cita.fecha_hora_inicio)
      const citaFin = new Date(cita.fecha_hora_fin)
      return inicioDeseado < citaFin && finDeseado > citaInicio
    })

    if (hayCruce) {
      throw new Error('El horario seleccionado ya se encuentra ocupado. Por favor elige otra hora.')
    }

    // REGLA 3: Insertar la cita
    const { data: nuevaCita, error: errInsert } = await supabase
      .from('citas')
      .insert({
        negocios_id,
        barbero_id,
        cliente_nombre,
        cliente_telefono,
        cliente_email: cliente_email?.trim() || null,
        fecha_hora_inicio: inicioDeseado.toISOString(),
        fecha_hora_fin: finDeseado.toISOString(),
        estado: 'pendiente'
      })
      .select()
      .single()

    if (errInsert) throw errInsert
    return nuevaCita
  },

  // Consultar una cita pública por su tracking_token con datos del negocio y barbero
  async obtenerCitaPorTrackingToken(token) {
    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        negocios_id,
        barbero_id,
        cliente_nombre,
        cliente_telefono,
        cliente_email,
        fecha_hora_inicio,
        fecha_hora_fin,
        estado,
        tracking_token,
        motivo_cancelacion,
        created_at,
        negocios ( id, nombre, slug_url, direccion, telefono, precio_base, tipo ),
        barberos ( id, nombre, avatar_url, telefono )
      `)
      .eq('tracking_token', token)
      .single()

    if (error) throw error
    return data
  },

  // Cancelar una cita desde el panel del barbero/admin
  async cancelarCita(citaId, motivoCancelacion = null) {
    const { data, error } = await supabase
      .from('citas')
      .update({
        estado: 'cancelada',
        motivo_cancelacion: motivoCancelacion?.trim() || null
      })
      .eq('id', citaId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ==========================================
  // 3. PANEL DE BARBERO / ESTADO Y FILA FÍSICA
  // ==========================================
  async actualizarEstadoBarbero(barbero_id, activo) {
    const { data, error } = await supabase
      .from('barberos')
      .update({ activo })
      .eq('id', barbero_id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async actualizarFilaPresencial(barbero_id, personas_en_espera) {
    const { data, error } = await supabase
      .from('barberos')
      .update({ personas_en_espera: Math.max(0, personas_en_espera) })
      .eq('id', barbero_id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ==========================================
  // 4. GESTIÓN DE IMÁGENES Y SUPABASE STORAGE
  // ==========================================
  async subirImagenBucket(file, carpeta = 'cortes') {
    const opcionesCompresion = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1024,
      useWebWorker: true
    }

    let archivoFinal = file
    try {
      archivoFinal = await imageCompression(file, opcionesCompresion)
    } catch (err) {
      console.warn('La compresión falló, se subirá el archivo original:', err)
    }

    const nombreArchivo = `${carpeta}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`

    const { error: errorUpload } = await supabase.storage
      .from('barber-assets')
      .upload(nombreArchivo, archivoFinal, {
        cacheControl: '3600',
        upsert: false
      })

    if (errorUpload) throw errorUpload

    const { data } = supabase.storage
      .from('barber-assets')
      .getPublicUrl(nombreArchivo)

    return data.publicUrl
  },

  async agregarFotoPortafolio(negocios_id, file, descripcion = '', barbero_id = null) {
    const imagen_url = await this.subirImagenBucket(file, 'portafolios')

    const { data, error } = await supabase
      .from('portafolio_fotos')
      .insert({ negocios_id, barbero_id, imagen_url, descripcion })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async actualizarLogoNegocio(negocios_id, file) {
    const logo_url = await this.subirImagenBucket(file, 'logos')

    const { data, error } = await supabase
      .from('negocios')
      .update({ logo_url })
      .eq('id', negocios_id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}