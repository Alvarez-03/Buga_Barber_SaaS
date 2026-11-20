<template>
    <header class="sticky top-0 z-40 bg-barber-dark text-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <router-link to="/" class="flex items-center space-x-2.5">
          <!-- Icono de la aplicación desde public -->
          <img 
            src="/logoBarberBuga.png" 
            alt="BugaBarber Logo" 
            class="w-12 h-12 object-contain rounded-lg" 
          />
          <span class="text-xl font-extrabold tracking-tight">
            Buga<span class="text-barber-red">Barber</span>
          </span>
        </router-link>
  
      </div>
    </header>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>