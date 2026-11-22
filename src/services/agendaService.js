import { supabase } from '@/services/supabase'

export const agendaService = {
  async obtenerCitasPorRango(barberoId, inicioIso, finIso) {
    const { data, error } = await supabase
      .from('citas')
      .select('id, cliente_nombre, cliente_telefono, fecha_hora_inicio, fecha_hora_fin, estado')
      .eq('barbero_id', barberoId)
      .gte('fecha_hora_inicio', inicioIso)
      .lte('fecha_hora_inicio', finIso)
      .order('fecha_hora_inicio', { ascending: true })

    if (error) throw error
    return data || []
  },

  async cancelarCita(citaId, barberoId) {
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'cancelada' })
      .eq('id', citaId)
      .eq('barbero_id', barberoId)

    if (error) throw error
  },

  suscribirCambiosCitas(barberoId, callback) {
    return supabase
      .channel(`barbero-agenda-${barberoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'citas',
          filter: `barbero_id=eq.${barberoId}`
        },
        callback
      )
      .subscribe()
  },

  desuscribirCanal(canal) {
    if (canal) supabase.removeChannel(canal)
  }
}