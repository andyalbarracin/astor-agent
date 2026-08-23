'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { icons } from './icons';
import { setThemePreference, type ThemePreference } from '@/app/actions/theme';

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];
const LABEL: Record<ThemePreference, string> = {
  system: 'Sistema',
  light: 'Claro',
  dark: 'Oscuro',
};
const ICON = {
  system: icons.themeSystem,
  light: icons.themeLight,
  dark: icons.themeDark,
} as const;

export function ThemeToggle({ preference }: { preference: ThemePreference }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = ICON[preference];

  function cycle() {
    const nextPref = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length]!;
    // Feedback inmediato en el <html> antes del round-trip al server.
    document.documentElement.setAttribute(
      'data-theme',
      nextPref === 'system' ? '' : nextPref,
    );
    startTransition(async () => {
      await setThemePreference(nextPref);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={cycle}
      disabled={pending}
      className="flex items-center gap-150 rounded-md px-200 py-150 text-200 text-fg-subtle transition-colors hover:bg-surface-overlay hover:text-fg-default disabled:opacity-60"
      aria-label={`Tema: ${LABEL[preference]}`}
    >
      <Icon size={16} aria-hidden />
      <span>{LABEL[preference]}</span>
    </button>
  );
}
