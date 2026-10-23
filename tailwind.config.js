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
          950: '#06080E',
          black: '#0A0D14',
          dark: '#111622',
          card: '#161E30',
          elevated: '#1D273E',
          border: '#283654',
          cyan: {
            DEFAULT: '#00F0FF',
            hover: '#38F4FF',
            dim: '#00B8C4',
            glow: 'rgba(0, 240, 255, 0.25)'
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
            surface: '#0F1626',
            paint: '#17223B',
            key: '#1D2B4A',
            lines: '#E2E8F0'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -2px rgba(0, 240, 255, 0.35)',
        'cyan-glow-lg': '0 0 35px 2px rgba(0, 240, 255, 0.45)',
        'indigo-glow': '0 0 20px -2px rgba(99, 102, 241, 0.35)',
        'amber-glow': '0 0 20px -2px rgba(245, 158, 11, 0.4)',
        'red-glow': '0 0 20px -2px rgba(239, 68, 68, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
