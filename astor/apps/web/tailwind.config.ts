import type { Config } from 'tailwindcss';
import { astorPreset } from '@astor/design-tokens/tailwind';

/**
 * Preset Astor (tokens) + bridge de nombres shadcn/ui → nuestras CSS vars, para
 * que los componentes shadcn hereden el theming de Astor sin variables propias.
 */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  presets: [astorPreset as Partial<Config>],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn semantic names → tokens Astor
        background: 'var(--color-surface-base)',
        foreground: 'var(--color-text-default)',
        card: 'var(--color-surface-raised)',
        'card-foreground': 'var(--color-text-default)',
        popover: 'var(--color-surface-overlay)',
        'popover-foreground': 'var(--color-text-default)',
        primary: 'var(--color-brand-default)',
        'primary-foreground': 'var(--color-text-inverse)',
        secondary: 'var(--color-surface-overlay)',
        'secondary-foreground': 'var(--color-text-default)',
        muted: 'var(--color-surface-sunken)',
        'muted-foreground': 'var(--color-text-subtle)',
        accent: 'var(--color-surface-overlay)',
        'accent-foreground': 'var(--color-text-default)',
        destructive: 'var(--color-danger-default)',
        'destructive-foreground': 'var(--color-text-inverse)',
        input: 'var(--color-border-default)',
        ring: 'var(--color-border-focus)',
        // Firma Astor: ámbar "ojos de pantera"
        signature: {
          DEFAULT: 'var(--color-signature-default)',
          soft: 'var(--color-signature-soft)',
          text: 'var(--color-signature-text)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--color-border-default)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slide-up 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        'scale-in': 'scale-in 140ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
