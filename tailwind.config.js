/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barber: {
          dark: '#0F172A',     // Azul oscuro principal (Headers, textos fuertes, barras)
          navy: '#1E293B',     // Azul oscuro secundario (Tarjetas oscuras, bordes)
          red: '#991B1B',      // Rojo burdeos (Botones principales, alertas, acentos)
          redHover: '#7F1D1D', // Rojo más profundo para estados activos/hover
          light: '#F8FAFC',    // Blanco humo suave para fondos generales
        }
      }
    },
  },
  plugins: [],
}