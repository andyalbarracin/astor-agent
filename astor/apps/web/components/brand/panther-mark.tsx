import { cn } from '@/lib/utils';

/**
 * Marca de Astor: cabeza de pantera geométrica. El cuerpo usa currentColor
 * (se adapta al texto); los ojos llevan el ámbar firma ("ojos de pantera").
 */
export function PantherMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      {/* orejas */}
      <path d="M7 5 L18 13 L9 16 Z" fill="currentColor" />
      <path d="M33 5 L22 13 L31 16 Z" fill="currentColor" />
      {/* cabeza */}
      <path
        d="M20 9 C11.7 9 8 14.4 8 21.2 C8 29.4 13.6 36 20 36 C26.4 36 32 29.4 32 21.2 C32 14.4 28.3 9 20 9 Z"
        fill="currentColor"
      />
      {/* ojos ámbar (almendra, inclinados hacia adentro) */}
      <path d="M12.5 20.2 Q16 17.8 18.6 21 Q15.5 23.2 12.5 21.9 Z" fill="var(--color-signature-default)" />
      <path d="M27.5 20.2 Q24 17.8 21.4 21 Q24.5 23.2 27.5 21.9 Z" fill="var(--color-signature-default)" />
      {/* hocico */}
      <path d="M20 27 l-2.4 3.4 a2.6 2.6 0 0 0 4.8 0 Z" fill="var(--color-surface-base)" />
    </svg>
  );
}

export function AstorWordmark({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <PantherMark size={26} className="text-fg-default" />
      <span className="text-500 font-semibold tracking-[-0.01em] text-fg-default">Astor</span>
    </div>
  );
}
