'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { icons, type IconName } from './icons';
import { ThemeToggle } from './theme-toggle';
import { PantherMark } from './brand/panther-mark';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/profile';

interface NavItem {
  label: string;
  icon: IconName;
  href?: string; // sin href = módulo aún no construido
}

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Productividad', icon: 'productivity', href: '/productividad' },
  { label: 'Tareas', icon: 'task', href: '/tasks' },
  { label: 'Hábitos', icon: 'habit', href: '/habits' },
  { label: 'Finanzas', icon: 'finance' },
  { label: 'Entrenamientos', icon: 'workout' },
  { label: 'Estudios', icon: 'study' },
  { label: 'Enfoque', icon: 'focus' },
];

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-line-subtle bg-surface-base p-3">
      <div className="flex items-center gap-2.5 px-3 py-3">
        <PantherMark size={26} className="text-fg-default" />
        <span className="text-500 font-semibold tracking-[-0.01em] text-fg-default">Astor</span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5">
        {NAV.map((item) => {
          const Icon = icons[item.icon];
          const active = isActive(pathname, item.href);
          const base =
            'flex items-center gap-3 rounded-md px-3 py-2 text-300 transition-colors';
          if (!item.href) {
            return (
              <span
                key={item.label}
                className={cn(base, 'cursor-default text-fg-disabled')}
                title="Próximamente"
              >
                <Icon size={18} aria-hidden />
                <span>{item.label}</span>
                <span className="ml-auto text-100 text-fg-subtlest">pronto</span>
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                base,
                active
                  ? 'bg-surface-overlay font-medium text-fg-default'
                  : 'text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
              )}
            >
              <Icon size={18} aria-hidden className={active ? 'text-signature' : ''} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col gap-1 border-t border-line-subtle pt-4">
        <div className="px-3">
          <p className="truncate text-200 text-fg-default">{profile.display_name ?? 'Sin nombre'}</p>
          <p className="text-100 text-fg-subtlest">{profile.role === 'owner' ? 'Owner' : 'Usuario'}</p>
        </div>
        <ThemeToggle preference={profile.theme} />
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-200 text-fg-subtle transition-colors hover:bg-surface-overlay hover:text-danger-text"
          >
            <icons.signout size={16} aria-hidden />
            <span>Cerrar sesión</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
