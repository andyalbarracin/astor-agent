import * as React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[72px] w-full rounded-md border border-line-default bg-surface-sunken px-3 py-2 text-300 text-fg-default shadow-sm transition-colors',
      'placeholder:text-fg-subtlest focus-visible:outline-none focus-visible:border-line-focus focus-visible:ring-1 focus-visible:ring-line-focus',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
