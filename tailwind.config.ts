// tailwind.config.js

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust based on your project structure
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#119C99',
        backgroundDark: '#0F181E',
        surface: '#F5F6F8',
        textPrimary: '#272F36',
        accent: '#FF2C55',
        premium: '#F7B84B',
        link: '#44B2DF',
        supportBorder: '#272F36',
        primary: '#0F181E',
        secondary: '#0F181E',
        inputBg: '#1E1E1E',
        inputText: '#AFAFAF',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica', 'Arial', 'sans-serif'], // Minimalistic and clean font stack
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    // other plugins...
  ],
};
