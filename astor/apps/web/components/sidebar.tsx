'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen, ChevronRight } from 'lucide-react';
import { icons, type IconName } from './icons';
import { ThemeToggle } from './theme-toggle';
import { PantherMark } from './brand/panther-mark';
import { cn } from '@/lib/utils';
import { HUBS, type Hub } from '@/lib/hubs';
import type { Profile } from '@/lib/profile';

export interface NavItem {
  label: string;
  icon: IconName;
  href?: string;
}

export const DASHBOARD: NavItem = { label: 'Dashboard', icon: 'dashboard', href: '/' };

/** Destinos primarios para el bottom-nav mobile (los hubs). */
export const MOBILE_NAV: NavItem[] = [
  DASHBOARD,
  ...HUBS.map((h) => ({ label: h.label, icon: h.icon, href: h.href })),
];

export function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function hubActive(hub: Hub, pathname: string): boolean {
  return isActive(pathname, hub.href) || hub.modules.some((m) => isActive(pathname, m.href));
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const activeSlug = useMemo(() => HUBS.find((h) => hubActive(h, pathname))?.slug, [pathname]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    setCollapsed(localStorage.getItem('astor-sidebar-collapsed') === '1');
  }, []);
  useEffect(() => {
    if (activeSlug) setOpenSlug(activeSlug);
  }, [activeSlug]);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('astor-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  }

  const DashIcon = icons[DASHBOARD.icon];

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
        {/* Dashboard */}
        <Link
          href={DASHBOARD.href!}
          title={collapsed ? 'Dashboard' : undefined}
          aria-current={pathname === '/' ? 'page' : undefined}
          className={cn(
            'flex items-center rounded-md text-300 transition-colors',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2',
            pathname === '/' ? 'bg-surface-overlay font-medium text-fg-default' : 'text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
          )}
        >
          <DashIcon size={18} aria-hidden />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        <div className="my-2 border-t border-line-subtle" />

        {HUBS.map((hub) => (
          <HubRow
            key={hub.slug}
            hub={hub}
            collapsed={collapsed}
            pathname={pathname}
            active={hubActive(hub, pathname)}
            open={openSlug === hub.slug}
            onToggle={() => setOpenSlug((s) => (s === hub.slug ? null : hub.slug))}
          />
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

function HubRow({
  hub,
  collapsed,
  pathname,
  active,
  open,
  onToggle,
}: {
  hub: Hub;
  collapsed: boolean;
  pathname: string;
  active: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = icons[hub.icon];

  if (collapsed) {
    return (
      <Link
        href={hub.href}
        title={hub.label}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center justify-center rounded-md px-0 py-2.5 transition-colors',
          active ? 'bg-surface-overlay' : 'hover:bg-surface-overlay',
        )}
      >
        <Icon size={18} aria-hidden style={active ? { color: hub.accent } : undefined} className={active ? '' : 'text-fg-subtle'} />
      </Link>
    );
  }

  return (
    <div>
      <div
        className={cn(
          'group flex items-center rounded-md text-300 transition-colors',
          active ? 'bg-surface-overlay font-medium text-fg-default' : 'text-fg-subtle hover:bg-surface-overlay hover:text-fg-default',
        )}
        style={active ? { boxShadow: `inset 3px 0 0 ${hub.accent}` } : undefined}
      >
        <Link href={hub.href} className="flex flex-1 items-center gap-3 py-2 pl-3">
          <Icon size={18} aria-hidden style={active ? { color: hub.accent } : undefined} />
          <span>{hub.label}</span>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? `Contraer ${hub.label}` : `Expandir ${hub.label}`}
          className="mr-1 rounded p-1.5 text-fg-subtlest transition-colors hover:text-fg-default"
        >
          <ChevronRight size={14} className={cn('transition-transform', open && 'rotate-90')} />
        </button>
      </div>

      {open && (
        <div className="mb-1 ml-[22px] flex flex-col gap-0.5 border-l border-line-subtle pl-3 pt-0.5">
          {hub.modules.map((m) => {
            const MIcon = icons[m.icon];
            const mActive = pathname === m.href;
            if (!m.href) {
              return (
                <span key={m.label} className="flex items-center gap-2.5 py-1.5 text-200 text-fg-disabled" title="Próximamente">
                  <MIcon size={15} aria-hidden />
                  <span>{m.label}</span>
                  <span className="ml-auto text-100 text-fg-subtlest">pronto</span>
                </span>
              );
            }
            return (
              <Link
                key={m.label}
                href={m.href}
                aria-current={mActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-200 transition-colors',
                  mActive ? 'text-fg-default' : 'text-fg-subtle hover:text-fg-default',
                )}
              >
                <MIcon size={15} aria-hidden style={mActive ? { color: hub.accent } : undefined} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
