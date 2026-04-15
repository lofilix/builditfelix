import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-silkscreen)', 'cursive'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
        body:    ['var(--font-outfit)', 'sans-serif'],
      },
      colors: {
        orange: {
          DEFAULT: '#FF8000',
          bright:  '#FF9633',
          deep:    '#E06800',
          glow:    'rgba(255,128,0,0.15)',
        },
        dark: {
          DEFAULT: '#0A0A0C',
          2: '#111114',
          3: '#1A1A1F',
          4: '#222228',
        },
        surface: '#16161A',
        text: {
          DEFAULT: '#EAEAEA',
          dim:     '#888890',
          muted:   '#7A7A82',
        },
      },
      borderRadius: {
        brand:    '16px',
        'brand-sm': '8px',
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
};

export default config;
