/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'sinc-blue': {
          DEFAULT: '#27AAE1',
          light: '#D4EBFB',
        },
        'sinc-green': {
          DEFAULT: '#83B735',
          hover: '#74A32F',
        },
        'sinc-gray': {
          dark: '#333333',
          'dark-hover': '#242424',
          light: '#F7F7F7',
          'light-hover': '#EFEFEF',
        },
        'sinc-success': '#459647',
        'sinc-warning': '#E0B252',
      },
      fontFamily: {
        'heading': ['Raleway', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
