// tailwind.config.js

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust based on your project structure
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#30c9e8',
        backgroundDark: '#212121',
        surface: '#F5F6F8',
        textPrimary: '#272F36',
        accent: '#FF2C55',
        premium: '#119C99',
        link: '#44B2DF',
        supportBorder: '#272F36',
        primary: '#212121',
        secondary: '#212121',
        inputBg: '#1E1E1E',
        inputText: '#AFAFAF',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // other plugins...
  ],
};
