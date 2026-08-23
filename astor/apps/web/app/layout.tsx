import './globals.css';
import type { Metadata } from 'next';
import { buildThemeCss } from '@astor/design-tokens/css';
import { getProfile } from '@/lib/profile';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Astor',
  description: 'Dashboard personal y sistema de ejecución diaria.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  // Dark-first: sin override explícito, la estrategia de CSS respeta el sistema.
  const themeAttr = profile && profile.theme !== 'system' ? profile.theme : undefined;

  return (
    <html lang="es-AR" data-theme={themeAttr} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildThemeCss() }} />
      </head>
      <body className="min-h-screen bg-surface-base font-sans text-fg-default antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
