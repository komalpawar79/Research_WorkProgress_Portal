/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F5F0',
        surface: '#FFFFFF',
        border: '#DDDCD5',
        primary: {
          DEFAULT: '#263A33',
          dark: '#1B2B25',
          light: '#364F46',
          hover: '#1E2F29',
        },
        secondary: {
          DEFAULT: '#6F806F',
          light: '#EBF1EB',
          dark: '#586758',
        },
        accent: {
          DEFAULT: '#B78352',
          light: '#F8F3EC',
          hover: '#A26F3E',
        },
        editorial: {
          dark: '#202522',
          muted: '#6E7671',
          subtle: '#9CA39F',
          border: '#E3E2DB',
          card: '#FFFFFF',
          cardMuted: '#F4F2EC',
        },
        status: {
          completedBg: '#EAF3EC',
          completedText: '#266C44',
          completedBorder: '#C1E1CB',
          progressBg: '#FBF2E7',
          progressText: '#B26926',
          progressBorder: '#F2D7B7',
          lockedBg: '#F0EFEA',
          lockedText: '#7B817D',
          lockedBorder: '#D7D6CF',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(32, 37, 34, 0.04), 0 1px 2px rgba(32, 37, 34, 0.03)',
        'card': '0 4px 12px rgba(32, 37, 34, 0.05), 0 1px 2px rgba(32, 37, 34, 0.02)',
        'modal': '0 20px 40px rgba(18, 27, 23, 0.15), 0 6px 16px rgba(18, 27, 23, 0.08)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}

