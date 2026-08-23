import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-100 font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-overlay text-fg-subtle',
        brand: 'bg-surface-overlay text-brand-text',
        signature: 'bg-signature-soft text-signature-text',
        danger: 'bg-danger-subtle text-danger-text',
        success: 'bg-success-subtle text-success-text',
        warning: 'bg-warning-subtle text-warning-text',
        discovery: 'bg-discovery-subtle text-discovery-text',
        outline: 'border border-line-default text-fg-subtle',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
