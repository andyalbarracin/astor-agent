import './globals.css';
import type { Metadata } from 'next';
import { buildThemeCss } from '@astor/design-tokens/css';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Astor',
  description: 'Dashboard personal y sistema de ejecución diaria.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Astor es siempre dark. Fijamos el tema explícitamente (sin toggle).
  return (
    <html lang="es-AR" data-theme="dark" suppressHydrationWarning>
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
