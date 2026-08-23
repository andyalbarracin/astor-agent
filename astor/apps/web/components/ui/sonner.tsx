'use client';

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-surface-overlay)',
          border: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-default)',
          borderRadius: '10px',
        },
      }}
    />
  );
}
