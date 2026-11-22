import { supabase } from '@/services/supabase'

export const profileService = {
  async obtenerPortafolio({ negocioId, barberoId = null, esAdminNegocio = false, limite = 4 }) {
    let query = supabase
      .from('portafolio_fotos')
      .select('id, negocios_id, barbero_id, imagen_url, descripcion')
      .eq('negocios_id', negocioId)
      .order('created_at', { ascending: false })
      .limit(limite)

    if (esAdminNegocio) {
      query = query.is('barbero_id', null)
    } else if (barberoId) {
      query = query.eq('barbero_id', barberoId)
    }

    const { data, error } = await query
    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      url: item.imagen_url,
      descripcion: item.descripcion || '',
      barbero_id: item.barbero_id || null
    }))
  },

  async subirImagenStorage(bucket, ruta, archivo) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(ruta, archivo, { upsert: true })

    if (error) throw error

    const { data } = supabase.storage.from(bucket).getPublicUrl(ruta)
    return data.publicUrl
  },

  async guardarRegistroPortafolio({ negocioId, barberoId = null, imagenUrl, descripcion = '' }) {
    const { data, error } = await supabase
      .from('portafolio_fotos')
      .insert({
        negocios_id: negocioId,
        barbero_id: barberoId,
        imagen_url: imagenUrl,
        descripcion
      })
      .select('id, negocios_id, barbero_id, imagen_url, descripcion')
      .single()

    if (error) throw error
    return {
      id: data.id,
      url: data.imagen_url,
      descripcion: data.descripcion || '',
      barbero_id: data.barbero_id || null
    }
  },

  async eliminarFotoPortafolio(fotoId) {
    const { error } = await supabase
      .from('portafolio_fotos')
      .delete()
      .eq('id', fotoId)

    if (error) throw error
  },

  async actualizarBarbero(barberoId, payload) {
    const { data, error } = await supabase
      .from('barberos')
      .update(payload)
      .eq('id', barberoId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async actualizarNegocio(negocioId, payload) {
    const { data, error } = await supabase
      .from('negocios')
      .update(payload)
      .eq('id', negocioId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}