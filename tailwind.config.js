/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--bg)',
        soft: 'var(--bg-soft)',
        card: 'var(--card)',
        ink: 'var(--text)',
        muted: 'var(--text-soft)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        'accent-soft': 'var(--accent-soft)',
        'accent-2': 'var(--accent-2)',
        'accent-3': 'var(--accent-3)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
      },
      borderRadius: {
        card: '24px',
        'card-sm': '18px',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(94, 72, 42, 0.08)',
        'soft-lg': '0 16px 40px rgba(94, 72, 42, 0.12)',
      },
      fontFamily: {
        rounded: [
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"MiSans"',
          '"Noto Sans SC"',
          '"Segoe UI"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
