import merge from 'lodash.merge';

const customConfig = {
  extend: {
    colors: {
      basic: { white: '#ffffff', black: '#000000' },
      primary: {
        '50': '#fef6ec',
        '100': '#fcedd9',
        '200': '#f9d9ae',
        '300': '#f5c07a',
        '400': '#f1a541',
        '500': '#de8411',
        '600': '#c7770f',
        '700': '#af690d',
        '800': '#93580b',
        '900': '#633c08',
      },
      secondary: {
        '50': '#eff6fb',
        '100': '#deedf7',
        '200': '#b9daee',
        '300': '#8cc2e3',
        '400': '#4ca0d3',
        '500': '#3694ce',
        '600': '#2e86bc',
        '700': '#2874a4',
        '800': '#205d83',
        '900': '#17435e',
      },
      neutral: {
        '50': '#f5f5f5',
        '100': '#ebebeb',
        '200': '#d4d4d3',
        '300': '#bdbdbc',
        '400': '#9c9c9b',
        '500': '#70706f',
        '600': '#646463',
        '700': '#5a5a59',
        '800': '#454545',
        '850': '#333232',
        '900': '#313130',
        '950': '#262626',
      },
      orange: {
        '50': '#fff7ed',
        '100': '#ffedd5',
        '200': '#fed7aa',
        '300': '#fdba74',
        '400': '#fb923c',
        '500': '#f97316',
        '600': '#ea580c',
        '700': '#c2410c',
        '800': '#9a3412',
        '900': '#7c2d12',
      },
      yellow: {
        '50': '#FEFCE8',
        '100': '#FEF9C3',
        '200': '#FEF08A',
        '300': '#FDE047',
        '400': '#FACC15',
        '500': '#EAB308',
        '600': '#CA8A04',
        '700': '#A16207',
        '800': '#854D0E',
        '900': '#713F12',
      },
      blue: {
        '50': '#eff6ff',
        '100': '#dbeafe',
        '200': '#bfdbfe',
        '300': '#93c5fd',
        '400': '#60a5fa',
        '500': '#3b82f6',
        '600': '#2563eb',
        '700': '#1d4ed8',
        '800': '#1e40af',
        '900': '#1e3a8a',
        googleButton: '#4285F4',
        facebookButton: '#1877F2',
      },
      red: {
        '50': '#fef3f2',
        '100': '#fee4e2',
        '200': '#fecdca',
        '300': '#fda29b',
        '400': '#f97066',
        '500': '#f04438',
        '600': '#d92d20',
        '700': '#b42318',
        '800': '#912018',
        '900': '#7a271a',
      },
      pink: {
        '50': '#fdf2f8',
        '100': '#fce7f3',
        '200': '#fbcfe8',
        '300': '#f9a8d4',
        '400': '#f472b6',
        '500': '#ec4899',
        '600': '#db2777',
        '700': '#be185d',
        '800': '#9d174d',
        '900': '#831843',
      },
      green: {
        '50': '#f0fdf4',
        '100': '#dcfce7',
        '200': '#bbf7d0',
        '300': '#86efac',
        '400': '#4ade80',
        '500': '#22c55e',
        '600': '#16a34a',
        '700': '#15803d',
        '800': '#166534',
        '900': '#14532d',
      },
      lime: {
        '50': '#f7fee7',
        '100': '#ecfccb',
        '200': '#d9f99d',
        '300': '#bef264',
        '400': '#a3e635',
        '500': '#84cc16',
        '600': '#65a30d',
        '700': '#4d7c0f',
        '800': '#3f6212',
        '900': '#365314',
      },
      error: {
        '50': '#FEF3F2',
        '100': '#FEE4E2',
        '200': '#FECDCA',
        '300': '#FDA29B',
        '400': '#F97066',
        '500': '#F04438',
        '600': '#D92D20',
        '700': '#B42318',
        '800': '#912018',
        '900': '#7A271A',
      },
    },
  },
};

const shadcnConfig = {
  container: {
    center: true,
    padding: '2rem',
    screens: {
      '2xl': '1400px',
    },
  },
  extend: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
      },
      dotsLoading: {
        '0%': { clipPath: 'inset(0 100% 0 0)' },
        '100%': { clipPath: 'inset(0 -20% 0 0)' },
      },
      scale: {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' },
      },
    },

    animation: {
      dotsLoading: 'dotsLoading 1s steps(4) infinite',
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
      scale: 'scale 3s ease-in-out infinite',
    },
  },
};

export default {
  darkMode: ['class'],
  mode: 'jit',
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: merge({}, customConfig, shadcnConfig),
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
