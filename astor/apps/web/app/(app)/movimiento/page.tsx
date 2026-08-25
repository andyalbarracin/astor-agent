import { redirect } from 'next/navigation';
import { Dumbbell, Utensils, Target } from 'lucide-react';
import { getDomainContext } from '@/lib/domain';

const ACCENT = '#FFBD76';

const MODULES = [
  { icon: Dumbbell, title: 'Entrenos', desc: 'Rutinas, ejercicios, progresión y PRs por consulta.' },
  { icon: Utensils, title: 'Recetas & Meal planner', desc: 'Planificá comidas, guardá recetas y armá la semana.' },
  { icon: Target, title: 'Objetivos', desc: 'Metas de fuerza, peso y hábitos de movimiento.' },
];

export default async function MovimientoPage() {
  const ctx = await getDomainContext();
  if (!ctx) redirect('/login');

  return (
    <div className="mx-auto max-w-[1100px]">
      <header className="astor-fade mb-6">
        <h1 className="text-700 font-bold tracking-[-0.02em] text-fg-default">Movimiento</h1>
        <p className="text-200 text-fg-subtle">Entrenamiento, nutrición y objetivos físicos. El hub está en construcción.</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {MODULES.map((m, i) => (
          <div key={m.title} className="astor-rise rounded-xl border border-dashed border-line-default bg-surface-raised/50 p-5" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-md" style={{ background: `${ACCENT}20`, color: ACCENT }}><m.icon className="size-4" /></span>
              <span className="ml-auto rounded-full bg-surface-overlay px-2 py-0.5 text-100 text-fg-subtlest">pronto</span>
            </div>
            <h2 className="text-400 font-semibold text-fg-default">{m.title}</h2>
            <p className="mt-1 text-200 text-fg-subtle">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
