'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { icons, type IconName } from './icons';
import { ThemeToggle } from './theme-toggle';
import { PantherMark } from './brand/panther-mark';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/profile';

export interface NavItem {
  label: string;
  icon: IconName;
  href?: string;
  soon?: boolean;
}

export interface NavHub {
  label: string;
  icon: IconName;
  items: NavItem[];
}

export const DASHBOARD: NavItem = { label: 'Dashboard', icon: 'dashboard', href: '/' };

/** Astor organizado en hubs: cada hub agrupa módulos de ejecución. */
export const HUBS: NavHub[] = [
  {
    label: 'Productividad',
    icon: 'productivity',
    items: [
      { label: 'Planificador', icon: 'productivity', href: '/productividad' },
      { label: 'Tareas', icon: 'task', href: '/tasks' },
      { label: 'Hábitos', icon: 'habit', href: '/habits' },
    ],
  },
  {
    label: 'Finanzas',
    icon: 'finance',
    items: [
      { label: 'Registro', icon: 'finance', href: '/finanzas' },
      { label: 'Tarjetas', icon: 'card', href: '/finanzas/tarjetas' },
      { label: 'Patrimonio', icon: 'patrimonio', href: '/finanzas/patrimonio' },
      { label: 'Inversiones', icon: 'invest', soon: true },
    ],
  },
  {
    label: 'Conocimiento',
    icon: 'study',
    items: [
      { label: 'Estudios', icon: 'study', href: '/estudios' },
      { label: 'Ideas & Notas', icon: 'idea', soon: true },
    ],
  },
  {
    label: 'Movimiento',
    icon: 'workout',
    items: [
      { label: 'Entrenos', icon: 'workout', soon: true },
      { label: 'Recetas', icon: 'meal', soon: true },
    ],
  },
];

/** Destinos primarios para el bottom-nav mobile (hubs con ruta construida). */
export const MOBILE_NAV: NavItem[] = [
  DASHBOARD,
  { label: 'Productividad', icon: 'productivity', href: '/productividad' },
  { label: 'Finanzas', icon: 'finance', href: '/finanzas' },
  { label: 'Estudios', icon: 'study', href: '/estudios' },
];

export function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem('astor-sidebar-collapsed') === '1');
  }, []);
  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('astor-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  }

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-line-subtle bg-surface-base p-3 transition-[width] duration-200 lg:flex print:hidden',
        collapsed ? 'w-[68px]' : 'w-[248px]',
      )}
    >
      <div className={cn('flex items-center px-1 py-2', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 pl-2">
            <PantherMark size={26} className="text-fg-default" />
            <span className="text-500 font-semibold tracking-[-0.01em] text-fg-default">Astor</span>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="rounded-md p-1.5 text-fg-subtlest transition-colors hover:bg-surface-overlay hover:text-fg-default"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        <NavRow item={DASHBOARD} collapsed={collapsed} pathname={pathname} />

        {HUBS.map((hub) => (
          <div key={hub.label} className={cn(collapsed ? 'mt-2 border-t border-line-subtle pt-2' : 'mt-4')}>
            {!collapsed && (
              <p className="mb-1 flex items-center gap-2 px-3 text-100 font-semibold uppercase tracking-wider text-fg-subtlest">
                {hub.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {hub.items.map((item) => (
                <NavRow key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 flex flex-col gap-1 border-t border-line-subtle pt-4">
        {!collapsed && (
          <div className="px-3">
            <p className="truncate text-200 text-fg-default">{profile.display_name ?? 'Sin nombre'}</p>
            <p className="text-100 text-fg-subtlest">{profile.role === 'owner' ? 'Owner' : 'Usuario'}</p>
          </div>
        )}
        {!collapsed && <ThemeToggle preference={profile.theme} />}
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            title="Cerrar sesión"
            className={cn(
              'flex w-full items-center rounded-md text-200 text-fg-subtle transition-colors hover:bg-surface-overlay hover:text-danger-text',
              collapsed ? 'justify-center py-2.5' : 'gap-3 px-3 py-2',
            )}
          >
            <icons.signout size={16} aria-hidden />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}

function NavRow({ item, collapsed, pathname }: { item: NavItem; collapsed: boolean; pathname: string }) {
  const Icon = icons[item.icon];
  const active = isActive(pathname, item.href);
  const base = cn(
    'flex items-center rounded-md text-300 transition-colors',
    collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
  );
  if (!item.href) {
    return (
      <span className={cn(base, 'cursor-default text-fg-disabled')} title="Próximamente">
        <Icon size={18} aria-hidden />
        {!collapsed && (
          <>
            <span>{item.label}</span>
            <span className="ml-auto text-100 text-fg-subtlest">pronto</span>
          </>
        )}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        base,
        active ? 'bg-surface-overlay font-medium text-fg-default' : 'text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
      )}
    >
      <Icon size={18} aria-hidden className={active ? 'text-signature' : ''} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
