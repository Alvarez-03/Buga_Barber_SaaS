<template>
    <div class="w-full h-full relative overflow-hidden bg-slate-100">
      <div ref="mapContainer" class="w-full h-full"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  
  const props = defineProps({
    negocios: {
      type: Array,
      default: () => []
    }
  })
  
  const mapContainer = ref(null)
  let mapInstance = null
  let markersLayer = null
  
  // Coordenadas centrales por defecto (Guadalajara de Buga, Valle del Cauca)
  const BUGA_LAT = 3.9008
  const BUGA_LNG = -76.3045
  
  onMounted(async () => {
    await nextTick()
    if (!mapContainer.value) return
  
    // Inicializar mapa interactivo
    mapInstance = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: false
    }).setView([BUGA_LAT, BUGA_LNG], 15)
  
    // Capa base limpia de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    }).addTo(mapInstance)
  
    markersLayer = L.layerGroup().addTo(mapInstance)
    actualizarMarcadores()
  })
  
  function actualizarMarcadores() {
    if (!markersLayer || !mapInstance) return
    markersLayer.clearLayers()
  
    props.negocios.forEach(negocio => {
      // Usar las coordenadas lat y lng de la base de datos (o un fallback aleatorio cercano en Buga si no las tienen registradas)
      const lat = negocio.lat || (BUGA_LAT + (Math.random() - 0.5) * 0.015)
      const lng = negocio.lng || (BUGA_LNG + (Math.random() - 0.5) * 0.015)
  
      const marker = L.marker([lat, lng])
      
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: #0F172A;">${negocio.nombre}</strong><br/>
          <span style="color: #64748B;">${negocio.direccion || 'Buga, Valle'}</span><br/>
          <a href="/negocio/${negocio.slug_url}" style="color: #991B1B; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 3px;">Ver perfil &rarr;</a>
        </div>
      `)
  
      markersLayer.addLayer(marker)
    })
  }
  
  watch(() => props.negocios, () => {
    actualizarMarcadores()
  }, { deep: true })
  
  onUnmounted(() => {
    if (mapInstance) {
      mapInstance.remove()
      mapInstance = null
    }
  })
  </script>
  
  <style>
  .leaflet-control-attribution {
    display: none !important;
  }
  </style>