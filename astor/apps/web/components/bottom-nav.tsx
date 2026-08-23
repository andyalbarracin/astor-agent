'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { icons } from './icons';
import { NAV, isActive } from './sidebar';
import { cn } from '@/lib/utils';

/** Navbar inferior para pantallas < lg (tablet y mobile). */
export function BottomNav() {
  const pathname = usePathname();
  const items = NAV.filter((i) => i.href); // solo módulos construidos

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line-subtle bg-surface-raised pb-[env(safe-area-inset-bottom)] lg:hidden">
      {items.map((item) => {
        const Icon = icons[item.icon];
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.label}
            href={item.href!}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
              active ? 'text-signature' : 'text-fg-subtle',
            )}
          >
            <Icon size={20} aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
