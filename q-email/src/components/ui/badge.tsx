import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[2px] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider transition-colors select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#091426] text-white border border-transparent',
        secondary:
          'bg-[#F6F3F5] text-[#091426] border border-[#E2E8F0]',
        destructive:
          'bg-[#FEE2E2] text-[#BA1A1A] border border-[#FCA5A5]',
        success:
          'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]',
        warning:
          'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
        primary:
          'bg-[#EBF3FF] text-[#0058BE] border border-[#BFDBFE]',
        outline:
          'text-[#091426] border border-[#E2E8F0]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
