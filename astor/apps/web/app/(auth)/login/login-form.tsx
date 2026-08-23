'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TEST_USERS } from '@/components/auth/test-users';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [magicSent, setMagicSent] = useState(false);

  function login(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos.'
            : error.message,
        );
        return;
      }
      router.push(next.startsWith('/') ? next : '/');
      router.refresh();
    });
  }

  async function magicLink() {
    if (!email) {
      setError('Ingresá tu email para el enlace mágico.');
      return;
    }
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setMagicSent(true);
  }

  function fill(u: (typeof TEST_USERS)[number]) {
    setEmail(u.email);
    setPassword(u.password);
    setError(null);
    toast.success(`Credenciales de ${u.label} cargadas`);
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-8">
        <h1 className="text-800 font-bold tracking-[-0.02em] text-fg-default">Entrá a Astor</h1>
        <p className="mt-2 text-400 text-fg-subtle">Tu sistema de ejecución diaria.</p>
      </div>

      {error && (
        <div className="mb-5 rounded-md border border-danger-subtle bg-danger-subtle px-3 py-2.5 text-200 text-danger-text">
          {error}
        </div>
      )}
      {magicSent && (
        <div className="mb-5 rounded-md border border-line-subtle bg-surface-overlay px-3 py-2.5 text-200 text-success-text">
          Te mandamos un enlace a {email}. Abrilo en este dispositivo.
        </div>
      )}

      <form onSubmit={login} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@ejemplo.com"
            className="h-12 text-400"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <button
              type="button"
              onClick={magicLink}
              className="text-100 text-fg-subtlest underline-offset-2 transition-colors hover:text-fg-subtle hover:underline"
            >
              Entrar con enlace mágico
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 pr-10 text-400"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtlest transition-colors hover:text-fg-subtle"
              aria-label={show ? 'Ocultar' : 'Mostrar'}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="signature" size="lg" disabled={pending} className="mt-1 h-12 text-400">
          {pending ? 'Entrando…' : 'Ingresar'}
        </Button>
      </form>

      {/* Cards de acceso rápido con usuarios de prueba */}
      <div className="mt-7">
        <div className="mb-2.5 flex items-center gap-2">
          <Sparkles className="size-3.5 text-signature" />
          <span className="text-100 font-medium uppercase tracking-wide text-fg-subtlest">
            Cuentas de prueba
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {TEST_USERS.map((u) => (
            <button
              key={u.email}
              type="button"
              onClick={() => fill(u)}
              className={cn(
                'group flex items-center gap-3 rounded-xl border border-line-subtle bg-surface-raised px-4 py-3 text-left transition-colors',
                'hover:border-line-default hover:bg-surface-overlay',
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-signature-soft text-200 font-semibold text-signature-text">
                {u.label.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-300 font-medium text-fg-default">{u.email}</span>
                <span className="block text-200 text-fg-subtlest">{u.hint}</span>
              </span>
              <Copy className="size-4 text-fg-subtlest opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
