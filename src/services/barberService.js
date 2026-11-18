import { supabase } from './supabase'
import imageCompression from 'browser-image-compression'

export const barberService = {
  // ==========================================
  // 1. DIRECTORIO PÚBLICO (HOME)
  // ==========================================
  async getNegociosActivos() {
    const { data, error } = await supabase
      .from('negocios')
      .select(`
        *,
        barberos ( id, nombre, activo, personas_en_espera ),
        portafolio_fotos ( id, imagen_url, descripcion )
      `)
      .eq('estado_suscripcion', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Obtener detalle de una sola barbería o independiente por su slug
  async getNegocioBySlug(slug) {
    const { data, error } = await supabase
      .from('negocios')
      .select(`
        *,
        barberos ( id, nombre, activo, personas_en_espera ),
        portafolio_fotos ( id, imagen_url, descripcion )
      `)
      .eq('slug_url', slug)
      .single()

    if (error) throw error
    return data
  },

  // ==========================================
  // 2. MOTOR DE TURNOS Y VALIDACIÓN INTELIGENTE
  // ==========================================
  
  // Valida y crea la cita calculando bloques de 1 hora y el impacto de la fila física
  async crearCita({ negocios_id, barbero_id, cliente_nombre, cliente_telefono, fecha_hora_inicio_str }) {
    const inicioDeseado = new Date(fecha_hora_inicio_str)
    const ahora = new Date()

    // REGLA 1: Mínimo 2 horas de anticipación
    const diferenciaHoras = (inicioDeseado - ahora) / (1000 * 60 * 60)
    if (diferenciaHoras < 2) {
      throw new Error('Las citas deben programarse con al menos 2 horas de anticipación.')
    }

    // Cada corte toma exactamente 1 hora fija
    const finDeseado = new Date(inicioDeseado.getTime() + 60 * 60 * 1000)

    // REGLA 2: Consultar estado actual del barbero (Fila presencial)
    const { data: barbero, error: errBarbero } = await supabase
      .from('barberos')
      .select('activo, personas_en_espera')
      .eq('id', barbero_id)
      .single()

    if (errBarbero || !barbero.activo) {
      throw new Error('El barbero seleccionado no se encuentra activo en este momento.')
    }

    // Si hay personas en espera física, cada una suma 1 hora de retraso estimado al inicio disponible
    if (barbero.personas_en_espera > 0) {
      const tiempoExtraMs = barbero.personas_en_espera * 60 * 60 * 1000
      const primerEspacioReal = new Date(ahora.getTime() + tiempoExtraMs)
      
      if (inicioDeseado < primerEspacioReal) {
        throw new Error(`El barbero tiene ${barbero.personas_en_espera} persona(s) en espera presencial. El próximo espacio libre estimado es a partir de las ${primerEspacioReal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`)
      }
    }

    // REGLA 3: Verificar cruces con otras citas pendientes en ese rango de 1 hora
    const { data: citasExistentes, error: errCitas } = await supabase
      .from('citas')
      .select('id, fecha_hora_inicio, fecha_hora_fin')
      .eq('barbero_id', barbero_id)
      .eq('estado', 'pendiente')

    if (errCitas) throw errCitas

    const hayCruce = citasExistentes.some(cita => {
      const citaInicio = new Date(cita.fecha_hora_inicio)
      const citaFin = new Date(cita.fecha_hora_fin)
      // Comprobación de solapamiento de rangos de tiempo
      return inicioDeseado < citaFin && finDeseado > citaInicio
    })

    if (hayCruce) {
      throw new Error('El horario seleccionado ya se encuentra ocupado. Por favor elige otra hora.')
    }

    // REGLA 4: Insertar la cita (Sin necesidad de registro del cliente)
    const { data: nuevaCita, error: errInsert } = await supabase
      .from('citas')
      .insert({
        negocios_id,
        barbero_id,
        cliente_nombre,
        cliente_telefono,
        fecha_hora_inicio: inicioDeseado.toISOString(),
        fecha_hora_fin: finDeseado.toISOString(),
        estado: 'pendiente'
      })
      .select()
      .single()

    if (errInsert) throw errInsert
    return nuevaCita
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
    // Comprimir imagen antes de subir (Ideal para móviles en Buga)
    const opcionesCompresion = {
      maxSizeMB: 0.3,          // Máximo 300KB
      maxWidthOrHeight: 1024,  // Resolución óptima para web/móvil
      useWebWorker: true
    }

    let archivoFinal = file
    try {
      archivoFinal = await imageCompression(file, opcionesCompresion)
    } catch (err) {
      console.warn('La compresión falló, se subirá el archivo original:', err)
    }

    const nombreArchivo = `${carpeta}/${Date.now()}-${Math.random().toString(36.(2, 8))}.jpg`

    const { error: errorUpload } = await supabase.storage
      .from('barber-assets')
      .upload(nombreArchivo, archivoFinal, {
        cacheControl: '3600',
        upsert: false
      })

    if (errorUpload) throw errorUpload

    // Obtener URL pública
    const { data } = supabase.storage
      .from('barber-assets')
      .getPublicUrl(nombreArchivo)

    return data.publicUrl
  },

  async agregarFotoPortafolio(negocios_id, file, descripcion = '') {
    const imagen_url = await this.subirImagenBucket(file, 'portafolios')

    const { data, error } = await supabase
      .from('portafolio_fotos')
      .insert({ negocios_id, imagen_url, descripcion })
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