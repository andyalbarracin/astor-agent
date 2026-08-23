import { Suspense } from 'react';
import { LoginSlider } from '@/components/auth/login-slider';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-base">
      {/* 60% — slider de presentación */}
      <div className="hidden lg:block lg:w-[60%]">
        <LoginSlider />
      </div>

      {/* 40% — acceso */}
      <div className="flex w-full flex-col overflow-y-auto lg:w-[40%]">
        <div className="flex flex-1 items-center justify-center px-8 py-10">
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
