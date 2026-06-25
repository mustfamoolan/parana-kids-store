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
        primary: {
          light: '#fff1f2',
          DEFAULT: '#e11d48', // rose-600 (a beautiful premium rose color matching kids/kids store)
          dark: '#be123c',
        },
        secondary: {
          light: '#ecfdf5',
          DEFAULT: '#059669', // emerald-600
          dark: '#047857',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
