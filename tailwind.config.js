/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: '#0F0F1A', card: '#1A1A2E', border: '#2A2A3E',
          gold: '#FFD700', gold2: '#FFA500', red: '#DC143C',
          green: '#00FF7F', text: '#FFFFFF', muted: '#8888AA',
        }
      },
      boxShadow: {
        gold: '0 4px 20px rgba(255, 215, 0, 0.3)',
        card: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}