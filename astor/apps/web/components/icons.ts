/**
 * Mapa único `nombre lógico → componente` (lucide-react) para web.
 * Mobile tendrá su equivalente con lucide-react-native. Los componentes usan el
 * nombre lógico, no el import directo, para mantener la iconografía consistente.
 */
import {
  LayoutDashboard,
  SquareCheckBig,
  Repeat,
  Wallet,
  Dumbbell,
  BookOpen,
  Timer,
  Settings,
  LogOut,
  Sun,
  Moon,
  MonitorSmartphone,
  type LucideIcon,
} from 'lucide-react';

export const icons = {
  dashboard: LayoutDashboard,
  task: SquareCheckBig,
  habit: Repeat,
  finance: Wallet,
  workout: Dumbbell,
  study: BookOpen,
  focus: Timer,
  settings: Settings,
  signout: LogOut,
  themeLight: Sun,
  themeDark: Moon,
  themeSystem: MonitorSmartphone,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
