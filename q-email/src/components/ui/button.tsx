import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-[11px] font-medium uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0058BE] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#091426] text-white hover:bg-[#1E293B] shadow-xs',
        destructive:
          'bg-[#BA1A1A] text-white hover:bg-[#93000A] shadow-xs',
        outline:
          'border border-[#E2E8F0] bg-transparent text-[#091426] hover:bg-[#F6F3F5] hover:border-[#CBD5E1]',
        secondary:
          'bg-[#F6F3F5] text-[#091426] hover:bg-[#EAE7E9] border border-[#E2E8F0]',
        ghost:
          'hover:bg-[#F6F3F5] text-[#45474C] hover:text-[#091426]',
        link:
          'text-[#0058BE] underline-offset-4 hover:underline',
        primary:
          'bg-[#0058BE] text-white hover:bg-[#004BB3] shadow-xs',
        success:
          'bg-[#065F46] text-white hover:bg-[#044E39] shadow-xs',
      },
      size: {
        default: 'h-8 px-4 py-1.5',
        xs: 'h-6 rounded-full px-2.5 text-[9.5px]',
        sm: 'h-7 rounded-full px-3 text-[10px]',
        lg: 'h-9 rounded-full px-6 text-[12px]',
        icon: 'h-8 w-8 rounded-full',
        'icon-xs': 'h-6 w-6 rounded-full',
        'icon-sm': 'h-7 w-7 rounded-full',
        'icon-lg': 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
