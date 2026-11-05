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
        cuervos: {
          950: '#050505',
          chalk: '#F8FAFC',
          black: '#0A0A0C',
          dark: '#121214',
          card: '#1A1A20',
          elevated: '#24242C',
          border: '#33333E',
          orange: {
            DEFAULT: '#ED4B00',
            hover: '#FF6014',
            dim: '#C23E00',
            glow: 'rgba(237, 75, 0, 0.40)'
          },
          cyan: {
            DEFAULT: '#ED4B00',
            hover: '#FF6014',
            dim: '#C23E00',
            glow: 'rgba(237, 75, 0, 0.40)'
          },
          indigo: {
            DEFAULT: '#6366F1',
            hover: '#818CF8',
            dim: '#4F46E5',
            glow: 'rgba(99, 102, 241, 0.25)'
          },
          amber: {
            DEFAULT: '#F59E0B',
            ball: '#EA580C',
            glow: 'rgba(245, 158, 11, 0.25)'
          },
          red: {
            DEFAULT: '#EF4444',
            dark: '#DC2626',
            light: '#F87171'
          },
          green: {
            DEFAULT: '#10B981',
            dark: '#059669',
            light: '#34D399'
          },
          court: {
            surface: '#08080A',
            paint: '#16161C',
            key: '#1E1E26',
            lines: '#FFFFFF'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Roboto Condensed"', '"Arial Narrow"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        // Restrained elevation: soft drop shadows instead of neon halos
        'orange-glow': '0 2px 10px -4px rgba(237, 75, 0, 0.45)',
        'orange-glow-lg': '0 4px 16px -6px rgba(237, 75, 0, 0.55)',
        'cyan-glow': '0 2px 10px -4px rgba(237, 75, 0, 0.45)',
        'cyan-glow-lg': '0 4px 16px -6px rgba(237, 75, 0, 0.55)',
        'indigo-glow': '0 2px 10px -4px rgba(0, 0, 0, 0.6)',
        'amber-glow': '0 2px 10px -4px rgba(0, 0, 0, 0.6)',
        'red-glow': '0 2px 10px -4px rgba(0, 0, 0, 0.6)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'float': '0 8px 24px -8px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(248, 250, 252, 0.04)',
        'token': '0 2px 6px rgba(0, 0, 0, 0.55)'
      }
    },
  },
  plugins: [],
}
