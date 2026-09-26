/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Orange - Brand Accent, Buttons, CTAs
        primary: {
          50: '#fef7ed',
          100: '#fdecd6',
          200: '#fbd5ac',
          300: '#F5B041', // Light Orange / Golden
          400: '#f4a32a',
          500: '#F39C12', // Primary Orange
          600: '#E67E22', // Dark Orange
          700: '#c45d0a',
          800: '#9c4a10',
          900: '#7d3e11',
        },
        // Secondary Blue - Headings, Links, Brand Text
        secondary: {
          50: '#eef1f8',
          100: '#d9e0f0',
          200: '#b8c5e3',
          300: '#8da3d1',
          400: '#5f7dba',
          500: '#2E4DA7', // Secondary Blue (lighter)
          600: '#1F3C88', // Primary Blue
          700: '#1a3270',
          800: '#172a5c',
          900: '#14234d',
        },
        // Neutral Colors
        neutral: {
          50: '#F4F6F7', // Light Gray (background)
          100: '#e8ebec',
          200: '#d4d9db',
          300: '#b5bdc0',
          400: '#8f9a9e',
          500: '#6b7880',
          600: '#576269',
          700: '#495158',
          800: '#2C2C2C', // Dark Gray (text)
          900: '#1a1a1a',
        },
        // Royal Blue - Logo-matching (header, strong sections)
        royal: {
          50: '#F4F7FB',
          600: '#1E2A78',
          700: '#182366',
          800: '#141B52',
        },
        // Accent colors for status/alerts
        accent: {
          green: '#10b981',
          red: '#ef4444',
          amber: '#f59e0b',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        display: [
          '"Caveat Brush"',
          '"Brush Script MT"',
          '"Segoe Script"',
          'cursive',
        ],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2C2C2C',
            a: {
              color: '#1F3C88',
              '&:hover': {
                color: '#2E4DA7',
              },
            },
            h1: { color: '#1F3C88' },
            h2: { color: '#1F3C88' },
            h3: { color: '#2C2C2C' },
            h4: { color: '#2C2C2C' },
          },
        },
        article: {
          css: {
            '--tw-prose-body': '#2C2C2C',
            '--tw-prose-headings': '#1F3C88',
            '--tw-prose-links': '#1A3270',
            '--tw-prose-bold': '#1A1A1A',
            '--tw-prose-quotes': '#1F3C88',
            '--tw-prose-quote-borders': '#E67E22',
            maxWidth: 'none',
            fontSize: '1.0625rem',
            lineHeight: '1.8',
            p: {
              marginTop: '1.15em',
              marginBottom: '1.15em',
            },
            a: {
              fontWeight: '600',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            },
            h1: {
              fontSize: 'clamp(1.9rem, 3vw, 2.5rem)',
              lineHeight: '1.15',
              fontWeight: '700',
              letterSpacing: '-0.03em',
            },
            h2: {
              fontSize: 'clamp(1.7rem, 2.6vw, 2.15rem)',
              lineHeight: '1.2',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              marginTop: '0',
              marginBottom: '0.85em',
            },
            h3: {
              fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
              lineHeight: '1.3',
              fontWeight: '700',
              marginTop: '1.5em',
              marginBottom: '0.55em',
            },
            img: {
              marginTop: '0',
              marginBottom: '0',
            },
            blockquote: {
              fontStyle: 'normal',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
