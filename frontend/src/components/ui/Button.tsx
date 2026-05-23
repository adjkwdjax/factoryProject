import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex justify-center items-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white';
    
    const variants = {
      primary: 'bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500',
      secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-amber-500',
      danger: 'bg-amber-700 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 focus:ring-amber-500',
      ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-amber-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
