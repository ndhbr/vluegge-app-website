/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#155DFC',
        'light-blue': '#EFF6FF',
        success: '#00A63E',
        danger: '#D4183D',
        'light-red': '#FFE2E2',
        'dark-red': '#82181A',
        'text-main': '#4A5565',
        'medium-grey': '#D1D5DC',
        'light-grey': '#F0F2F5',
        purple: '#9810FA',
        'light-purple': '#F3E8FF',
        navy: '#111827',
        'dark-navy': '#0F172A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
      borderRadius: {
        card: '24px',
        'card-lg': '32px',
        btn: '16px',
      },
      boxShadow: {
        card: '0 2px 16px -2px rgba(21, 93, 252, 0.06)',
        'card-hover': '0 4px 24px -4px rgba(21, 93, 252, 0.10)',
      },
    },
  },
  plugins: [],
};
