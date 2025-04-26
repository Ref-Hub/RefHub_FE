/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./extension/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: "class", // class 기반 다크모드 설정
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#09D5AD",
          light: "#E8F8F5",
          dark: "#07c09b",
          hover: "#07c09b",
        },
        gray: {
          100: "#F1F3F1",
          200: "#DADDDB",
          300: "#E0E0E0",
          400: "#B5B8B5",
          500: "#8A8D8A",
          600: "#757575",
          700: "#676967",
          800: "#424242",
          900: "#212121",
        },
        emerald: {
          500: "#10B981",
        },
        red: {
          500: "#EF4444",
        },
        // 다크모드 전용 색상 추가
        dark: {
          bg: "#212121",
          surface: "#292929",
          card: "#333333",
          border: "#444444",
          hover: "#3a3a3a",
          text: {
            primary: "#ffffff",
            secondary: "#a0a0a0",
          },
          input: "#2a2a2a",
        },
        // 다크모드에서 키워드 태그 색상
        tag: {
          bg: "#0a306c",
          bgDark: "#0d4181",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      zIndex: {
        50: "50",
      },
      // 다크모드용 그림자 추가
      boxShadow: {
        "dark-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
        dark: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "dark-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
