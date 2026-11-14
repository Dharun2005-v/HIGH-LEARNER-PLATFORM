/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // electric blue
        secondary: '#7c3aed', // violet
        dark: '#0a0f2c', // dark navy
        charcoal: '#1e1e2d', // deep charcoal
        accent: '#5eead4', // teal accent
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
