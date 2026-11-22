<template>
    <div class="min-h-dvh w-full bg-[#f8fafc] text-[#0b1329] selection:bg-[#be123c] selection:text-white overflow-x-clip">
      <!-- Barra superior de progreso de scroll -->
      <div class="fixed top-0 left-0 right-0 h-[3px] z-50 bg-transparent pointer-events-none">
        <div
          class="h-full bg-gradient-to-r from-[#be123c] via-[#ef4444] to-white transition-all duration-150 ease-out"
          :style="{ width: `${scrollProgress}%` }"
        ></div>
      </div>
  
      <!-- NAVBAR STICKY -->
      <header
        :class="isScrolled
          ? 'bg-[#0b1329]/95 backdrop-blur-md shadow-xl border-b border-white/10 py-3'
          : 'bg-[#0b1329] py-4'"
        class="sticky top-0 z-40 text-white transition-all duration-300"
      >
        <div class="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          <!-- Marca con ícono Barber Pole -->
          <a href="#inicio" class="flex items-center gap-2.5 group">
            <img 
                src="/logoBarberBuga.png" 
                alt="BugaBarber Logo" 
                class="w-12 h-12 object-contain rounded-lg" 
            />
          </a>
  
          <!-- Navegación Desktop -->
          <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#para-ti" class="hover:text-white transition">Para ti</a>
            <a href="#para-barberos" class="hover:text-white transition">Para barberos</a>
            <a href="#como-funciona" class="hover:text-white transition">Cómo funciona</a>
            <a href="#planes" class="hover:text-white transition">Planes</a>
          </nav>
  
          <!-- CTA Header -->
          <div class="flex items-center gap-2.5">
            <router-link
              to="/directorio"
              class="hidden sm:inline-flex text-xs font-bold text-slate-200 hover:text-white px-3 py-2 rounded-xl transition"
            >
              Buscar Barberia
            </router-link>
            <router-link
              to="/barbero/login"
              class="bg-[#be123c] hover:bg-[#9f1239] text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-[#be123c]/25 transition active:scale-95"
            >
              Soy barbero
            </router-link>
          </div>
        </div>
      </header>
  
      <!-- 1. HERO SECTION -->
      <section id="inicio" class="relative bg-[#0b1329] text-white pt-10 pb-20 sm:pt-16 sm:pb-28 overflow-hidden">
        <!-- Resplandor de fondo -->
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#be123c]/15 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
  
        <div class="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <!-- Columna Texto -->
          <div class="lg:col-span-6 space-y-6 text-left">
            <div
              data-reveal
              class="reveal-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-rose-300"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#e11d48] animate-pulse"></span>
              Hecho en Buga, para Buga
            </div>
  
            <h1
              data-reveal
              style="--delay: 80ms"
              class="reveal-up text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.06]"
            >
              Tu corte,<br />
              sin filas ni<br />
              <span class="text-[#e11d48]">llamadas.</span>
            </h1>
  
            <p
              data-reveal
              style="--delay: 160ms"
              class="reveal-up text-sm sm:text-base text-slate-300 max-w-md leading-relaxed"
            >
              Mira qué barberías están abiertas ahora, escoge tu barbero y separa tu turno en 30 segundos.
              Sin registrarte, sin descargar nada.
            </p>
  
            <div
              data-reveal
              style="--delay: 240ms"
              class="reveal-up flex flex-wrap items-center gap-3.5 pt-1"
            >
              <router-link
                to="/directorio"
                class="bg-[#be123c] hover:bg-[#9f1239] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-[#be123c]/30 transition transform hover:-translate-y-0.5 active:scale-95"
              >
                Buscar barbería
              </router-link>
              <router-link
                to="/barbero/login"
                class="border border-white/25 hover:border-white hover:bg-white/5 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition"
              >
                Soy barbero &rarr;
              </router-link>
            </div>
  
            <p
              data-reveal
              style="--delay: 320ms"
              class="reveal-up text-[11px] text-slate-400 font-medium pt-1"
            >
              100% gratis para clientes · En tu navegador · Sin app ni cuentas
            </p>
          </div>
  
          <!-- Columna Mockup Teléfono Hero -->
          <div
            data-reveal
            style="--delay: 180ms"
            class="reveal-scale lg:col-span-6 flex justify-center lg:justify-end relative"
          >
            <div class="relative w-[285px] sm:w-[310px] hero-phone-tilt">
              <!-- Badge flotante superior derecho -->
              <div class="float-badge-slow absolute -top-4 -right-6 sm:-right-10 z-20 bg-white text-[#0b1329] rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black">✓</span>
                <div>
                  <p class="text-[11px] font-black leading-tight">Cita confirmada</p>
                  <p class="text-[10px] text-slate-500 font-semibold">Hoy, 4:00 PM</p>
                </div>
              </div>
  
              <!-- Marco del Smartphone -->
              <div class="bg-[#161e36] p-2.5 rounded-[2.6rem] shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-white/15">
                <div class="bg-white text-[#0b1329] rounded-[2.1rem] overflow-hidden">
                  <!-- Header App Mockup -->
                  <div class="bg-[#0b1329] text-white px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                        <img 
                            src="/logoBarberBuga.png" 
                            alt="BugaBarber Logo" 
                            class="w-12 h-12 object-contain rounded-lg" 
                        />
                    </div>
                    <span class="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">Buga</span>
                  </div>
  
                  <!-- Mapa simulado con pines -->
                  <div class="relative h-32 bg-slate-100 overflow-hidden border-b border-slate-200">
                    <div class="absolute inset-0 opacity-45 map-grid-pattern"></div>
                    <!-- Río / Avenida simulada -->
                    <div class="absolute top-0 bottom-0 left-1/2 w-5 bg-sky-200/70 -rotate-12"></div>
                    <!-- Pines -->
                    <span class="absolute top-6 left-12 w-5 h-5 rounded-full bg-[#be123c] text-white text-[9px] font-black flex items-center justify-center shadow-md animate-bounce">✂</span>
                    <span class="absolute top-14 right-10 w-5 h-5 rounded-full bg-[#be123c] text-white text-[9px] font-black flex items-center justify-center shadow-md">✂</span>
                    <span class="absolute bottom-5 left-24 w-4 h-4 rounded-full bg-[#0b1329] text-white text-[8px] font-black flex items-center justify-center shadow">✂</span>
                  </div>
  
                  <!-- Tarjetas de barbería dentro del mockup -->
                  <div class="p-3.5 space-y-2.5 bg-slate-50">
                    <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <p class="text-xs font-black text-[#0b1329]">Barbería El Clásico</p>
                          <p class="text-[10px] text-slate-400">Cra 14 #6-29 · Centro</p>
                        </div>
                        <span class="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Abierta</span>
                      </div>
                      <div class="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
                        <span>Corte clásico</span>
                        <span class="font-black text-[#0b1329]">$15.000</span>
                      </div>
                      <div class="w-full py-1.5 rounded-xl bg-[#be123c] text-white text-center text-[10px] font-extrabold">
                        Agendar cita
                      </div>
                    </div>
  
                    <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <p class="text-xs font-black text-[#0b1329]">Camilo Marín</p>
                          <p class="text-[10px] text-slate-400">Independiente · A domicilio</p>
                        </div>
                        <span class="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">En línea</span>
                      </div>
                      <div class="w-full py-1.5 rounded-xl bg-[#be123c] text-white text-center text-[10px] font-extrabold">
                        Separar turno
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Badge flotante inferior izquierdo -->
              <div class="float-badge-delayed absolute bottom-12 -left-6 sm:-left-12 z-20 bg-white text-[#0b1329] rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <div>
                  <p class="text-[11px] font-black leading-tight">Abierto ahora</p>
                  <p class="text-[10px] text-slate-500 font-semibold">2 personas en espera</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- FRANJA BARBER POLE + MÉTRICAS -->
      <div class="h-2.5 w-full barber-pole-stripe"></div>
      <section class="bg-white border-b border-slate-200/80 py-8 sm:py-10">
        <div class="max-w-5xl mx-auto px-5 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div data-reveal style="--delay: 0ms" class="reveal-up space-y-1">
            <p class="text-2xl sm:text-3xl font-black text-[#be123c]">30 seg</p>
            <p class="text-xs font-semibold text-slate-500">para separar tu cita</p>
          </div>
          <div data-reveal style="--delay: 80ms" class="reveal-up space-y-1">
            <p class="text-2xl sm:text-3xl font-black text-[#be123c]">$0</p>
            <p class="text-xs font-semibold text-slate-500">para los clientes</p>
          </div>
          <div data-reveal style="--delay: 160ms" class="reveal-up space-y-1">
            <p class="text-2xl sm:text-3xl font-black text-[#be123c]">0 cuentas</p>
            <p class="text-xs font-semibold text-slate-500">solo nombre y teléfono</p>
          </div>
          <div data-reveal style="--delay: 240ms" class="reveal-up space-y-1">
            <p class="text-2xl sm:text-3xl font-black text-[#be123c]">En vivo</p>
            <p class="text-xs font-semibold text-slate-500">fila y disponibilidad</p>
          </div>
        </div>
      </section>
  
      <!-- 2. PARA USUARIOS: ENCUENTRA TU BARBERO -->
      <section id="para-ti" class="py-16 sm:py-24 max-w-6xl mx-auto px-5 sm:px-8 space-y-10 sm:space-y-12">
        <div data-reveal class="reveal-up space-y-2 max-w-xl">
          <p class="text-[11px] font-black uppercase tracking-widest text-[#be123c]">Para usuarios</p>
          <h2 class="text-3xl sm:text-4xl font-black text-[#0b1329] tracking-tight leading-tight">
            Encuentra tu barbero.<br />
            Hoy mismo.
          </h2>
        </div>
  
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <article
            v-for="(item, idx) in beneficiosUsuarios"
            :key="item.titulo"
            data-reveal
            :style="{ '--delay': `${idx * 90}ms` }"
            class="reveal-up bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 space-y-4 group"
          >
            <div class="w-11 h-11 rounded-2xl bg-[#be123c] text-white flex items-center justify-center shadow-md shadow-[#be123c]/20 group-hover:scale-110 transition-transform">
              <span v-html="item.icono"></span>
            </div>
            <div class="space-y-1.5">
              <h3 class="text-base font-black text-[#0b1329]">{{ item.titulo }}</h3>
              <p class="text-xs text-slate-500 leading-relaxed">{{ item.descripcion }}</p>
            </div>
          </article>
        </div>
      </section>
  
      <!-- 3. PARA BARBEROS Y BARBERÍAS: TU BARBERÍA EN EL BOLSILLO -->
      <section id="para-barberos" class="bg-[#0b1329] text-white py-16 sm:py-24 relative overflow-hidden">
        <div class="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-[#be123c]/15 blur-3xl pointer-events-none"></div>
  
        <div class="max-w-6xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <!-- Texto y lista -->
          <div class="lg:col-span-6 space-y-6">
            <div data-reveal class="reveal-up space-y-2">
              <p class="text-[11px] font-black uppercase tracking-widest text-[#e11d48]">Para barberos y barberías</p>
              <h2 class="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Tu barbería,<br />
                en el bolsillo.
              </h2>
            </div>
  
            <ul class="space-y-3.5">
              <li
                v-for="(beneficio, idx) in beneficiosBarberos"
                :key="beneficio"
                data-reveal
                :style="{ '--delay': `${idx * 75}ms` }"
                class="reveal-left flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium"
              >
                <span class="w-5 h-5 rounded-full bg-[#be123c]/25 text-[#e11d48] border border-[#e11d48]/40 flex items-center justify-center text-[11px] font-black shrink-0">
                  ✓
                </span>
                <span>{{ beneficio }}</span>
              </li>
            </ul>
  
            <div data-reveal style="--delay: 360ms" class="reveal-up flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                @click="abrirWhatsAppPlan('Gratis primer mes')"
                class="bg-[#be123c] hover:bg-[#9f1239] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#be123c]/30 transition cursor-pointer"
              >
                Empieza gratis el primer mes
              </button>
              <a
                href="#planes"
                class="border border-white/25 hover:border-white text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition"
              >
                Ver planes
              </a>
            </div>
          </div>
  
          <!-- Mockup Interactivo Panel Barbero -->
          <div
            data-reveal
            style="--delay: 160ms"
            class="reveal-scale lg:col-span-6 flex justify-center lg:justify-end"
          >
            <div class="relative w-[285px] sm:w-[310px] barber-phone-tilt">
              <div class="bg-[#161e36] p-2.5 rounded-[2.6rem] shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-white/15">
                <div class="bg-slate-50 text-[#0b1329] rounded-[2.1rem] overflow-hidden">
                  <!-- Header Panel -->
                  <div class="bg-[#0b1329] text-white px-4 py-3.5 flex items-center justify-between">
                    <div>
                      <p class="text-xs font-black">Hola, Camilo</p>
                      <p class="text-[10px] text-slate-400">Barbería El Clásico</p>
                    </div>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
  
                  <div class="p-3.5 space-y-3">
                    <!-- Switch Disponible -->
                    <div class="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <p class="text-xs font-extrabold">Estoy disponible</p>
                        <p class="text-[10px] text-slate-400">Recibiendo clientes hoy</p>
                      </div>
                      <span class="w-10 h-5 rounded-full bg-emerald-500 p-0.5 flex justify-end items-center">
                        <span class="w-4 h-4 rounded-full bg-white shadow"></span>
                      </span>
                    </div>
  
                    <!-- Contador de fila interactivo -->
                    <div class="bg-white p-4 rounded-2xl border border-slate-200/80 text-center space-y-2">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personas en espera</p>
                      <div class="flex items-center justify-center gap-5">
                        <button
                          type="button"
                          @click="demoFila = Math.max(0, demoFila - 1)"
                          class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 font-black text-base text-[#0b1329] transition cursor-pointer"
                        >
                          −
                        </button>
                        <span class="text-3xl font-black text-[#0b1329] tabular-nums w-8">{{ demoFila }}</span>
                        <button
                          type="button"
                          @click="demoFila++"
                          class="w-9 h-9 rounded-full bg-[#be123c] hover:bg-[#9f1239] font-black text-base text-white shadow transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <p class="text-[10px] text-slate-400">Prueba tocar − o + en vivo</p>
                    </div>
  
                    <!-- Próxima cita -->
                    <div class="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-[#be123c]">Próxima cita · 03:30 p.m.</span>
                      </div>
                      <p class="text-xs font-extrabold">Andrés Morales</p>
                      <div class="grid grid-cols-2 gap-2 pt-0.5">
                        <span class="py-1.5 rounded-xl bg-emerald-600 text-white text-center text-[10px] font-bold">Completada</span>
                        <span class="py-1.5 rounded-xl bg-rose-50 text-[#be123c] text-center text-[10px] font-bold">Cancelar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              <!-- Badge flotante inferior -->
              <div class="float-badge-slow absolute -bottom-4 -left-6 sm:-left-10 z-20 bg-white text-[#0b1329] rounded-2xl px-3.5 py-2.5 shadow-2xl border border-slate-100 flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-full bg-rose-100 text-[#be123c] flex items-center justify-center text-xs font-black">⚡</span>
                <div>
                  <p class="text-[11px] font-black leading-tight">Sin cruces</p>
                  <p class="text-[10px] text-slate-500 font-semibold">Fila + citas sincronizadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- FRANJA BARBER POLE -->
      <div class="h-2.5 w-full barber-pole-stripe"></div>
  
      <!-- 4. ASÍ ES FÁCIL: TRES PASOS. CERO COMPLICACIONES. -->
      <section id="como-funciona" class="py-16 sm:py-24 max-w-6xl mx-auto px-5 sm:px-8 space-y-12">
        <div data-reveal class="reveal-up space-y-2">
          <p class="text-[11px] font-black uppercase tracking-widest text-[#be123c]">Así es fácil</p>
          <h2 class="text-3xl sm:text-4xl font-black text-[#0b1329] tracking-tight">
            Tres pasos. Cero complicaciones.
          </h2>
        </div>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14">
          <!-- Columna Cliente -->
          <div data-reveal style="--delay: 80ms" class="reveal-left space-y-6">
            <span class="inline-block bg-rose-100 text-[#be123c] text-xs font-extrabold px-3.5 py-1.5 rounded-full">
              Si quieres un corte
            </span>
  
            <div class="space-y-5">
              <div
                v-for="paso in pasosCliente"
                :key="paso.num"
                class="flex items-start gap-4 pb-5 border-b border-slate-200/80 last:border-b-0"
              >
                <span class="text-2xl font-black text-[#be123c] leading-none pt-0.5 tabular-nums">{{ paso.num }}</span>
                <div class="space-y-1">
                  <h3 class="text-sm sm:text-base font-black text-[#0b1329]">{{ paso.titulo }}</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">{{ paso.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Columna Barbero -->
          <div data-reveal style="--delay: 160ms" class="reveal-right space-y-6">
            <span class="inline-block bg-[#0b1329] text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full">
              Si eres barbero
            </span>
  
            <div class="space-y-5">
              <div
                v-for="paso in pasosBarbero"
                :key="paso.num"
                class="flex items-start gap-4 pb-5 border-b border-slate-200/80 last:border-b-0"
              >
                <span class="text-2xl font-black text-[#be123c] leading-none pt-0.5 tabular-nums">{{ paso.num }}</span>
                <div class="space-y-1">
                  <h3 class="text-sm sm:text-base font-black text-[#0b1329]">{{ paso.titulo }}</h3>
                  <p class="text-xs text-slate-500 leading-relaxed">{{ paso.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 5. PLANES PARA BARBEROS -->
      <section id="planes" class="py-16 sm:py-24 bg-slate-100/80 border-t border-slate-200/70">
        <div class="max-w-4xl mx-auto px-5 sm:px-8 space-y-12">
          <div data-reveal class="reveal-up text-center space-y-2">
            <p class="text-[11px] font-black uppercase tracking-widest text-[#be123c]">Planes para barberos</p>
            <h2 class="text-3xl sm:text-4xl font-black text-[#0b1329] tracking-tight">
              Pagas tú. El cliente nunca.
            </h2>
          </div>
  
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <!-- Plan Independiente -->
            <div
              data-reveal
              style="--delay: 80ms"
              class="reveal-up bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div class="space-y-4">
                <div>
                  <h3 class="text-base font-black text-[#0b1329]">Independiente</h3>
                  <div class="flex items-baseline gap-1 pt-2">
                    <span class="text-4xl font-black text-[#0b1329] tracking-tight">$29.000</span>
                    <span class="text-xs font-bold text-slate-400">/mes</span>
                  </div>
                  <p class="text-xs font-bold text-[#be123c] mt-1">Primer mes gratis · Sin permanencia</p>
                </div>
  
                <ul class="space-y-2.5 pt-2 text-xs font-semibold text-slate-600">
                  <li class="flex items-center gap-2.5"><span class="text-emerald-600 font-black">✓</span> Link propio + portafolio</li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-600 font-black">✓</span> Agenda sin cruces</li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-600 font-black">✓</span> Servicio a domicilio</li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-600 font-black">✓</span> Aparece en el directorio</li>
                </ul>
              </div>
  
              <button
                type="button"
                @click="abrirWhatsAppPlan('Independiente ($29.000/mes)')"
                class="w-full py-3.5 px-4 rounded-2xl border-2 border-[#0b1329] text-[#0b1329] hover:bg-[#0b1329] hover:text-white font-extrabold text-xs sm:text-sm transition cursor-pointer"
              >
                Empezar gratis
              </button>
            </div>
  
            <!-- Plan Barbería Local -->
            <div
              data-reveal
              style="--delay: 180ms"
              class="reveal-up bg-[#0b1329] text-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-800 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <span class="absolute top-5 right-5 bg-[#be123c] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                Popular
              </span>
  
              <div class="space-y-4">
                <div>
                  <h3 class="text-base font-black text-white">Barbería local</h3>
                  <div class="flex items-baseline gap-1 pt-2">
                    <span class="text-4xl font-black text-white tracking-tight">$59.000</span>
                    <span class="text-xs font-bold text-slate-400">/mes</span>
                  </div>
                  <p class="text-xs font-bold text-[#e11d48] mt-1">Primer mes gratis · Sin permanencia</p>
                </div>
  
                <ul class="space-y-2.5 pt-2 text-xs font-semibold text-slate-300">
                  <li class="flex items-center gap-2.5"><span class="text-emerald-400 font-black">✓</span> Agrega a todos los barberos que desees</li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-400 font-black">✓</span> Mapa y ubicación de local </li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-400 font-black">✓</span> Control de fila en vivo </li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-400 font-black">✓</span> Panel de administración </li>
                  <li class="flex items-center gap-2.5"><span class="text-emerald-400 font-black">✓</span> Buscar barberos independientes que se unan a tu barberia </li>
                </ul>
              </div>
  
              <button
                type="button"
                @click="abrirWhatsAppPlan('Barbería local ($59.000/mes)')"
                class="w-full py-3.5 px-4 rounded-2xl bg-[#be123c] hover:bg-[#9f1239] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#be123c]/30 transition cursor-pointer"
              >
                Empezar gratis
              </button>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 6. CTA BANNER CARMESÍ -->
      <section class="bg-gradient-to-r from-[#be123c] to-[#9f1239] text-white py-12 sm:py-16">
        <div
          data-reveal
          class="reveal-up max-w-6xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-md">
            Tu próximo corte<br />
            está a 30 segundos.
          </h2>
  
          <div class="flex flex-wrap items-center gap-3">
            <router-link
              to="/directorio"
              class="bg-white hover:bg-slate-100 text-[#0b1329] font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg transition"
            >
              Buscar barbería
            </router-link>
            <router-link
              to="/barbero/login"
              class="border border-white/40 hover:border-white hover:bg-white/10 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition"
            >
              Soy barbero
            </router-link>
          </div>
        </div>
      </section>
  
      <!-- FOOTER -->
      <footer class="bg-[#0b1329] text-slate-400 py-8 border-t border-white/10">
        <div class="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div class="flex items-center gap-2 text-white font-black">
            <img 
                src="/logoBarberBuga.png" 
                alt="BugaBarber Logo" 
                class="w-12 h-12 object-contain rounded-lg" 
            />
          </div>
  
          <p class="text-center">Hecho en Guadalajara de Buga, Valle del Cauca</p>
  
          <div class="flex items-center gap-4">
            <a href="#planes" class="hover:text-white transition">Términos</a>
            <a href="#para-ti" class="hover:text-white transition">Privacidad</a>
            <button type="button" @click="abrirWhatsAppPlan('Contacto general')" class="hover:text-white transition cursor-pointer">
              Contacto
            </button>
          </div>
        </div>
      </footer>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useScrollReveal } from '@/composables/useScrollReveal'
  
  const { scrollProgress, isScrolled } = useScrollReveal()
  const demoFila = ref(3)
  
  const beneficiosUsuarios = [
    {
      titulo: 'Mapa en vivo',
      descripcion: 'Ve qué barberías y barberos están abiertos y ubica el más cercano en Buga.',
      icono: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
    },
    {
      titulo: 'Fila en tiempo real',
      descripcion: 'Sabes cuántas personas hay esperando antes de salir de tu casa.',
      icono: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    },
    {
      titulo: 'A domicilio',
      descripcion: 'Barberos independientes que llegan hasta tu puerta. Elige y separa.',
      icono: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
    },
    {
      titulo: 'Sin registro',
      descripcion: 'Nombre y teléfono. Listo. Sin claves, sin contraseñas, sin enredos.',
      icono: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`
    }
  ]
  
  const beneficiosBarberos = [
    'Control de fila con un toque: [+] y [−]',
    'Agenda sin cruces entre citas web y clientes que llegan',
    'Tu link propio: /negocio/tu-nombre',
    'Portafolio de cortes que vende por ti',
    'Apareces en el mapa y directorio de Buga'
  ]
  
  const pasosCliente = [
    {
      num: '01',
      titulo: 'Abre el mapa',
      descripcion: 'Ve los barberos abiertos en tu barrio o cerca de donde estés.'
    },
    {
      num: '02',
      titulo: 'Elige tu hora',
      descripcion: 'Bloques de 1 hora con mínimo 2 horas de anticipación.'
    },
    {
      num: '03',
      titulo: 'Llega o espera en casa',
      descripcion: 'Tu turno queda separado. Sin filas, sin llamadas.'
    }
  ]
  
  const pasosBarbero = [
    {
      num: '01',
      titulo: 'Crea tu perfil',
      descripcion: 'Sube tu logo, tus horarios y tu portafolio de cortes.'
    },
    {
      num: '02',
      titulo: 'Comparte tu link',
      descripcion: 'Tu enlace único para WhatsApp e Instagram.'
    },
    {
      num: '03',
      titulo: 'Maneja todo desde el celular',
      descripcion: 'Fila, agenda e ingresos del día en un toque.'
    }
  ]
  
  function abrirWhatsAppPlan(plan) {
    const texto = encodeURIComponent(`Hola, quiero activar mi primer mes gratis en Barber Buga (${plan}).`)
    window.open(`https://wa.me/573173050653?text=${texto}`, '_blank')
  }
  </script>
  
  <style scoped>
  /* Patrón Barber Pole */
  .barber-pole-pill {
    background: repeating-linear-gradient(
      -45deg,
      #be123c 0px,
      #be123c 4px,
      #ffffff 4px,
      #ffffff 8px,
      #1d4ed8 8px,
      #1d4ed8 12px,
      #ffffff 12px,
      #ffffff 16px
    );
  }
  
  .barber-pole-stripe {
    background: repeating-linear-gradient(
      -45deg,
      #be123c 0px,
      #be123c 14px,
      #ffffff 14px,
      #ffffff 28px,
      #0b1329 28px,
      #0b1329 42px,
      #ffffff 42px,
      #ffffff 56px
    );
  }
  
  .map-grid-pattern {
    background-image:
      linear-gradient(to right, #cbd5e1 1px, transparent 1px),
      linear-gradient(to bottom, #cbd5e1 1px, transparent 1px);
    background-size: 22px 22px;
  }
  
  /* Inclinación 3D sutil en desktop para los mockups */
  @media (min-width: 1024px) {
    .hero-phone-tilt {
      transform: perspective(1000px) rotateY(-8deg) rotateX(3deg) rotateZ(2deg);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .hero-phone-tilt:hover {
      transform: perspective(1000px) rotateY(-2deg) rotateX(1deg) rotateZ(0deg) translateY(-6px);
    }
  
    .barber-phone-tilt {
      transform: perspective(1000px) rotateY(-7deg) rotateZ(-2deg);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .barber-phone-tilt:hover {
      transform: perspective(1000px) rotateY(0deg) rotateZ(0deg) translateY(-6px);
    }
  }
  
  /* Badges flotantes */
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-7px); }
  }
  
  .float-badge-slow {
    animation: floatSlow 4s ease-in-out infinite;
  }
  
  .float-badge-delayed {
    animation: floatSlow 4.5s ease-in-out 1.2s infinite;
  }
  
  /* Animaciones de Scroll Reveal */
  [data-reveal] {
    opacity: 0;
    transition:
      opacity 0.75s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--delay, 0ms);
    will-change: opacity, transform;
  }
  
  .reveal-up {
    transform: translateY(28px);
  }
  
  .reveal-left {
    transform: translateX(-28px);
  }
  
  .reveal-right {
    transform: translateX(28px);
  }
  
  .reveal-scale {
    transform: scale(0.93) translateY(20px);
  }
  
  [data-reveal].is-visible {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  </style>