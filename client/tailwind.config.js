/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        white: '#ffffff',
      },
      fontSize:{
        'course-details-heading-small' : ['26px', '36px'],
        'course-details-heading-large' : ['36px', '44px'],
        'home-heading-small' : ['28px', '34px'],
        'home-heading-large' : ['48px', '56px'],
        'default' : ['15px', '21px']
      },
      gridTemplateColumns:{
        'auto' : 'repeat(auto-fit, minmax(200px,1fr))',
      },
      spacing:{
        'section-height' : '500px'
      },
      maxWidth:{
        "course-card" : "424px",
      },
      boxShadow:{
        "custom-card": "0px 4px 15px 2px rgba(0,0,0,0.1)",
        "brand-glow": "0px 4px 20px 4px rgba(34,197,94,0.25)",
      },
      borderRadius: {
        'xl': '12px',
      }
    },

  },
  plugins: [],
}