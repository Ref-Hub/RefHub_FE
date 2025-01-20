// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1ABC9C',
          light: '#E8F8F5',
          dark: '#16A085',
        },
        gray: {
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
        emerald: {
          500: '#10B981',
        },
        red: {
          500: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      zIndex: {
        50: '50',
      }
    },
  },
  plugins: [],
}