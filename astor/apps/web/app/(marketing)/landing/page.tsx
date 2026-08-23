import Link from 'next/link';
import { PantherMark } from '@/components/brand/panther-mark';
import { Button } from '@/components/ui/button';

/**
 * Placeholder de la landing pública (marketing). Más adelante se construye al
 * estilo rimuapp.com (animaciones, secciones de features) con CTA al login.
 * Ruta pública: whitelisted en el middleware.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-base">
      <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-10%,rgba(244,184,96,0.10),transparent_50%)]" />

      <header className="relative mx-auto flex max-w-[1100px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <PantherMark size={26} className="text-fg-default" />
          <span className="text-500 font-semibold tracking-[-0.01em] text-fg-default">Astor</span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/login">Entrar</Link>
        </Button>
      </header>

      <main className="relative mx-auto flex max-w-[820px] flex-col items-center px-6 pb-24 pt-24 text-center">
        <span className="mb-5 rounded-full border border-line-subtle bg-surface-raised px-3 py-1 text-100 text-fg-subtle">
          Tareas · Hábitos · Finanzas AR · y más
        </span>
        <h1 className="text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] text-fg-default sm:text-[3.4rem]">
          El sistema de ejecución diaria,{' '}
          <span className="text-signature">hecho para Argentina</span>.
        </h1>
        <p className="mt-5 max-w-[540px] text-300 leading-relaxed text-fg-subtle">
          Captura sin fricción, contexto local (blue/MEP, cuotas), y todo tu día en un solo lugar.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild variant="signature" size="lg">
            <Link href="/login">Empezar</Link>
          </Button>
        </div>
        <p className="mt-16 text-100 text-fg-subtlest">
          Landing de marketing en construcción · estética estilo Rimu.
        </p>
      </main>
    </div>
  );
}
