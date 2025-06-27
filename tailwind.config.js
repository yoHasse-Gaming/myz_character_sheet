/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        myz: {
          "primary": "#a991f7",
          "secondary": "#f6d55c",
          "accent": "#3abff8",
          "neutral": "#3d4451",
          "base-100": "#f5f5f5",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "light",
      "dark",
    ],
  },
}
