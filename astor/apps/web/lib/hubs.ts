import type { IconName } from '@/components/icons';

export interface HubModule {
  label: string;
  href?: string;
  icon: IconName;
  soon?: boolean;
}

export interface Hub {
  slug: string;
  label: string;
  icon: IconName;
  href: string;
  /** Acento principal del hub (los colores son de acento, el fondo es negro). */
  accent: string;
  modules: HubModule[];
}

export const HUBS: Hub[] = [
  {
    slug: 'productividad',
    label: 'Productividad',
    icon: 'productivity',
    href: '/productividad',
    accent: '#3FA9B8', // oceanic teal
    modules: [
      { label: 'Tareas', href: '/tasks', icon: 'task' },
      { label: 'Hábitos', href: '/habits', icon: 'habit' },
      { label: 'Enfoque', href: '/productividad', icon: 'focus' },
    ],
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    icon: 'finance',
    href: '/finanzas',
    accent: '#7CC96A', // grass green (dinero)
    modules: [
      { label: 'Registro', href: '/finanzas', icon: 'finance' },
      { label: 'Tarjetas', href: '/finanzas/tarjetas', icon: 'card' },
      { label: 'Reportes', href: '/finanzas/reportes', icon: 'invest' },
      { label: 'Patrimonio', href: '/finanzas/patrimonio', icon: 'patrimonio' },
      { label: 'Inversiones', icon: 'invest', soon: true },
    ],
  },
  {
    slug: 'conocimiento',
    label: 'Conocimiento',
    icon: 'study',
    href: '/conocimiento',
    accent: '#9F8FEF', // discovery purple
    modules: [
      { label: 'Estudios', href: '/estudios', icon: 'study' },
      { label: 'Ideas & Notas', icon: 'idea', soon: true },
    ],
  },
  {
    slug: 'movimiento',
    label: 'Movimiento',
    icon: 'workout',
    href: '/movimiento',
    accent: '#FFBD76', // nectarine (energía)
    modules: [
      { label: 'Entrenos', icon: 'workout', soon: true },
      { label: 'Recetas', icon: 'meal', soon: true },
    ],
  },
];

export const HUB_BY_SLUG = Object.fromEntries(HUBS.map((h) => [h.slug, h])) as Record<string, Hub>;
