/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#ffb606', // Màu vàng Eduma
        'text-dark': '#333333',
      }
    },
  },
  plugins: [],
}