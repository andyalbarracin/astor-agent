import { Suspense } from 'react';
import { LoginSlider } from '@/components/auth/login-slider';
import { PantherMark } from '@/components/brand/panther-mark';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-surface-base">
      {/* 60% — slider de presentación (oculto en < lg) */}
      <div className="hidden lg:block lg:w-[60%]">
        <LoginSlider />
      </div>

      {/* 40% — acceso */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-[40%]">
        {/* Marca arriba solo en mobile/tablet (cuando el slider no se ve) */}
        <div className="flex items-center gap-2.5 px-6 pt-8 lg:hidden">
          <PantherMark size={28} className="text-fg-default" />
          <span className="text-500 font-semibold tracking-[-0.01em] text-fg-default">Astor</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="border-t border-line-subtle px-8 py-4 text-center text-100 text-fg-subtlest">
          Astor © 2026
        </div>
      </div>
    </div>
  );
}
