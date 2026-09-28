/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: '#0A0A0F',
          card: '#14141C',
          border: '#252530',
          
          gold: '#D4AF37',
          gold2: '#B8941F',
          goldLight: '#E8C860',
          
          red: '#8B0000',
          redLight: '#C41E3A',
          
          green: '#2D6A4F',
          greenLight: '#52B788',
          
          text: '#E5E5E5',
          textMuted: '#A0A0B0',
          muted: '#6B6B7B',
          
          black: '#000000',
          darkRed: '#4A0000',
          purple: '#4A1A5C',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 20px rgba(212, 175, 55, 0.35)',
        goldStrong: '0 0 30px rgba(212, 175, 55, 0.6)',
        card: '0 4px 12px rgba(0, 0, 0, 0.6)',
        red: '0 4px 20px rgba(139, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl': '10px',
        '2xl': '14px',
        '3xl': '20px',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
        'red-gradient': 'linear-gradient(135deg, #8B0000 0%, #4A0000 100%)',
        'card-gradient': 'linear-gradient(135deg, #14141C 0%, #0A0A0F 100%)',
      },
    },
  },
  plugins: [],
}