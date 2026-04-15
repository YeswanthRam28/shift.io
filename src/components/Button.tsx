import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      tertiary: 'btn-pink',
      ghost: 'text-white/40 hover:text-white transition-colors',
    };

    const sizes = {
      sm: 'px-4 py-2 text-[10px]',
      md: 'px-6 py-3 text-xs',
      lg: 'px-8 py-4 text-sm',
      xl: 'px-10 py-5 text-base font-black tracking-[0.2em]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-headline uppercase transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95',
          variant !== 'ghost' && (variant === 'tertiary' ? 'btn-pink' : variant === 'secondary' ? 'btn-secondary' : 'btn-primary'),
          variant === 'ghost' && variants.ghost,
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
