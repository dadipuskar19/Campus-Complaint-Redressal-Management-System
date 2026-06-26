/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vignan: {
          red: '#d9232a',     // logo crimson red
          blue: '#0c59a3',    // logo vibrant blue
          purple: '#8a8bbf',  // logo light violet
          dark: '#0f172a',    // deep slate for dark panels
          light: '#f8fafc',   // light background color
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '8px',
      }
    },
  },
  plugins: [],
}
