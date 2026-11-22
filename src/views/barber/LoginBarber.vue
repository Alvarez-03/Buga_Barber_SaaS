<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cargando = ref(false)

function redirigirSegunRol() {
  if (!authStore.loading && authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      router.replace('/admin/equipo')
    } else {
      router.replace('/barbero/fila')
    }
  }
}

watch(
  () => [authStore.loading, authStore.isAuthenticated, authStore.userRole],
  () => {
    redirigirSegunRol()
  },
  { immediate: true }
)

onMounted(() => {
  // Limpiar residuos de OAuth si el redireccionamiento volvió aquí
  if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  if (authStore.noRegistrado) {
    toast.error('Acceso denegado: este correo no está registrado en BarberBuga.')
    authStore.noRegistrado = false
  }

  redirigirSegunRol()
})

async function iniciarConGoogle() {
  cargando.value = true
  try {
    const queryRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const esRutaValida = queryRedirect.startsWith('/barbero') || queryRedirect.startsWith('/admin')
    const destino = esRutaValida ? queryRedirect : '/admin/equipo'
    await authStore.loginWithGoogle(destino)
  } catch (err) {
    console.error('Error OAuth Google:', err)
    toast.error(err.message || 'No se pudo iniciar sesión con Google')
    cargando.value = false
  }
}

function abrirContacto() {
  const msg = encodeURIComponent('Hola, quiero sumar mi barbería o perfil independiente a BarberBuga.')
  window.open(`https://wa.me/573101234567?text=${msg}`, '_blank')
}
</script>

<template>
  <div class="min-h-dvh w-full bg-[#0b1329] text-white flex flex-col justify-between px-6 py-8 sm:items-center sm:justify-center">
    <!-- Contenedor adaptable: ancho completo en móvil, centrado y limpio en PC -->
    <div class="w-full max-w-md flex-1 sm:flex-initial flex flex-col justify-between sm:justify-center sm:gap-10 sm:bg-[#101b38]/80 sm:border sm:border-slate-800/90 sm:rounded-3xl sm:p-8 sm:shadow-2xl">

      <!-- Espaciador superior solo en móvil para centrar el bloque principal -->
      <div class="sm:hidden"></div>

      <!-- Marca y acceso -->
      <div class="space-y-8 text-center my-auto sm:my-0">
        <div class="space-y-2">
          <!-- Ícono barber pole / pin -->
          <div class="w-48 h-48 mx-auto rounded-2xl flex items-center justify-center shadow-lg">
            <img
              src="/logoBarberBuga.png"
              alt="BugaBarber Logo"
              class="w-48 h-48 object-contain rounded-lg"
            />
          </div>

          <h1 class="text-3xl sm:text-4xl font-black tracking-tight pt-2">
            Buga<span class="text-[#ef4444]">Barber</span>
          </h1>
        </div>

        <div class="space-y-4">
          <button
            type="button"
            @click="iniciarConGoogle"
            :disabled="cargando"
            class="w-full bg-white hover:bg-slate-100 disabled:opacity-60 text-[#0b1329] font-extrabold py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-sm transition cursor-pointer active:scale-[0.99]"
          >
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.54-1.14 2.85-2.4 3.72v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.97z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>{{ cargando ? 'Conectando...' : 'Continuar con Google' }}</span>
          </button>

          <div class="text-[11px] sm:text-xs text-slate-400 space-y-0.5 leading-relaxed">
            <p>Acceso para barberos y administradores registrados.</p>
            <p>Tu sesión se mantiene abierta en este celular.</p>
          </div>
        </div>
      </div>

      <!-- Pie inferior -->
      <p class="text-center text-[11px] sm:text-xs text-slate-400 pt-4 sm:pt-0">
        ¿Quieres sumar tu barbería o empezar a obtener experiencia?
        <a href="#contacto" @click.prevent="abrirContacto" class="text-white font-bold underline hover:text-slate-200">
          Escríbenos
        </a>
      </p>

    </div>
  </div>
</template>