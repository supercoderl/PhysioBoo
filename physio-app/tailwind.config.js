/** @type {import('tailwindcss').Config} */
module.exports = {
  // Design tokens (type, colour, spacing, radii, shadows) live in the UI library.
  presets: [require('./projects/physioboo-ui/tailwind.preset.js')],
  content: ["./src/**/*.{html,js,ts}", "./projects/physioboo-ui/src/**/*.{html,ts}"],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      keyframes: {
        mover: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-15px)' },
        },
        flip360: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        tuck: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 0.5rem))' }, // = translate(calc(-50% - .5rem))
        },
        blinker: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        preloader: {
          '0%': { transform: 'rotate(45deg) rotateX(-25deg) rotateY(25deg)' },
          '50%': { transform: 'rotate(45deg) rotateX(-385deg) rotateY(25deg)' },
          '100%': { transform: 'rotate(45deg) rotateX(-385deg) rotateY(385deg)' }
        }
      },
      animation: {
        mover: 'mover 3s infinite alternate',
        flip360: 'flip360 0.35s linear forwards',
        tuck: 'tuck 60s linear infinite reverse forwards',
        blinker: 'blinker 0.6s ease-in-out infinite alternate',
        preloader: 'preloader 2s infinite ease'
      },
      transitionProperty: {
        switch: 'left, transform',
      },
      transitionDuration: {
        150: '150ms',
        252: '252ms',
        168: '168ms',
      },
      transitionTimingFunction: {
        switch: 'cubic-bezier(0.4, 0, 0.2, 1)',
        material: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

