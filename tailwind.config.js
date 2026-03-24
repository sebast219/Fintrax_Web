/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        primary: '#0F172A',
        accent: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#06B6D4',
        surface: '#F8FAFC',
      },
      boxShadow: {
        'soft': '0 4px 20px -4px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.25), 0 4px 20px rgba(59, 130, 246, 0.15)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 40px -8px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)',
        'strong': '0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)',
        'inset': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
