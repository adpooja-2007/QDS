import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'sm';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = 'default', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      data-size={size}
      className={cn(
        'group/card flex flex-col overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#1B1B1D] shadow-none transition-all duration-150',
        size === 'sm' ? 'p-3 gap-2.5 text-[11px]' : 'p-4 gap-3.5 text-[12px]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn(
      'flex items-center justify-between gap-2 border-b border-[#E2E8F0] -mx-4 -mt-4 mb-1 px-4 py-2 bg-[#F6F3F5] shrink-0',
      'group-data-[size=sm]/card:-mx-3 group-data-[size=sm]/card:-mt-3 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-1.5',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    data-slot="card-title"
    className={cn(
      'text-[12px] font-bold leading-none tracking-tight text-[#091426] uppercase',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="card-description"
    className={cn('text-[11px] text-[#45474C]', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-action"
    className={cn('flex items-center gap-2 ml-auto shrink-0', className)}
    {...props}
  />
));
CardAction.displayName = 'CardAction';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn('flex-1 min-h-0', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn(
      'flex items-center justify-between border-t border-[#E2E8F0] -mx-4 -mb-4 mt-auto px-4 py-2.5 bg-[#F6F3F5] shrink-0',
      'group-data-[size=sm]/card:-mx-3 group-data-[size=sm]/card:-mb-3 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:py-2',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
};
