/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 레퍼브 컬러 시스템
        primary: "#1A6DFF",
        secondary: "#6691FF",
        black: "#000000",
        white: "#FFFFFF",
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
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      spacing: {
        // 필요한 경우 커스텀 spacing 추가
      },
      borderRadius: {
        // 필요한 경우 커스텀 border radius 추가
      },
    },
  },
  plugins: [],
}