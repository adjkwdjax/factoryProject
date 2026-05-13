import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex justify-center items-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white focus:ring-blue-500',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 focus:ring-slate-500',
      danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 focus:ring-red-500',
      ghost: 'hover:bg-slate-800 text-slate-400 focus:ring-slate-500',
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
