/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple's dark-mode system greys. Keeping the original token names
        // means every existing component picks up the new palette without
        // being touched one by one.
        dark: {
          50:  '#F2F2F7',
          100: '#E5E5EA',
          200: '#D1D1D6',  // primary text on dark
          300: '#AEAEB2',  // secondary text
          400: '#8E8E93',  // tertiary text (systemGray)
          500: '#48484A',
          600: '#3A3A3C',  // separators / borders
          700: '#2C2C2E',  // elevated surface
          800: '#1C1C1E',  // card surface
          900: '#0A0A0B',  // app canvas
          950: '#000000',
        },
        // The palette is deliberately three hues: tomato red, leaf green, grey.
        // blue/orange/purple are kept as token names so existing components
        // keep compiling, but they resolve into the palette rather than
        // introducing a fourth and fifth colour.
        accent: {
          red: '#FF453A',      // systemRed - distraction, the fruit
          green: '#30D158',    // systemGreen - focus, the leaf
          blue: '#AEAEB2',     // -> neutral grey (informational)
          orange: '#FF6B57',   // -> light tomato (warning)
          purple: '#FF8A6B',   // -> lighter tomato (long break)
        },
        tomato: {
          light: '#FF6B57',
          DEFAULT: '#E63A28',
          deep: '#A81D14',
          leaf: '#30D158',
          stem: '#2F7A2A',
        },
      },
      fontFamily: {
        sans: [
          'Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: {
        // iOS leans on larger, softer corners than the web default
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.375rem',
        ios: '1.25rem',
      },
      boxShadow: {
        'glow-green': '0 0 24px rgba(48, 209, 88, 0.35)',
        'glow-red': '0 0 24px rgba(255, 69, 58, 0.35)',
        'ios': '0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)',
        'ios-lift': '0 2px 6px rgba(0,0,0,0.35), 0 16px 40px rgba(0,0,0,0.35)',
      },
      backdropBlur: {
        ios: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      transitionTimingFunction: {
        // Apple's standard ease - quick out, gentle settle
        ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
