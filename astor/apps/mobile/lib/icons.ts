/**
 * Mapa único `nombre lógico → componente` (lucide-react-native) para mobile.
 * Espeja el mapa de web (apps/web/components/icons.ts) con los mismos nombres.
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
  type LucideIcon,
} from 'lucide-react-native';

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
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
