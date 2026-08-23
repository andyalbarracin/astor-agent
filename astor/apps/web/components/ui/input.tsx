import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-line-default bg-surface-sunken px-3 py-1 text-300 text-fg-default shadow-sm transition-colors',
        'placeholder:text-fg-subtlest focus-visible:outline-none focus-visible:border-line-focus focus-visible:ring-1 focus-visible:ring-line-focus',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
