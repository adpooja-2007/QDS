import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonGroupVariants = cva(
  'inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#FFFFFF] p-0.5 shadow-none overflow-hidden [&>button]:rounded-full [&>button]:border-0 [&>button:not(:first-child)]:ml-0.5',
  {
    variants: {
      orientation: {
        horizontal: 'flex-row',
        vertical: 'flex-col [&>button:not(:first-child)]:mt-0.5 [&>button:not(:first-child)]:ml-0',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(buttonGroupVariants({ orientation }), className)}
        {...props}
      />
    );
  }
);
ButtonGroup.displayName = 'ButtonGroup';

export interface ButtonGroupSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(({ className, orientation = 'vertical', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-[#E2E8F0] shrink-0',
        orientation === 'vertical' ? 'w-[1px] h-4 mx-0.5 self-center' : 'h-[1px] w-full my-0.5',
        className
      )}
      {...props}
    />
  );
});
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator';

export interface ButtonGroupTextProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  render?: React.ReactElement;
}

const ButtonGroupText = React.forwardRef<HTMLSpanElement, ButtonGroupTextProps>(
  ({ className, render, children, ...props }, ref) => {
    if (render) {
      return React.cloneElement(render, {
        className: cn(
          'text-[10px] uppercase font-bold text-[#75777D] px-2.5 py-1 select-none',
          render.props.className,
          className
        ),
        ref,
        ...props,
      });
    }

    return (
      <span
        ref={ref}
        className={cn(
          'text-[10px] uppercase font-bold text-[#75777D] px-2.5 py-1 select-none flex items-center',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
ButtonGroupText.displayName = 'ButtonGroupText';

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText };
