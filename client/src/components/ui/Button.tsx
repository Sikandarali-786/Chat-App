import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]',
      secondary:
        'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800',
      destructive:
        'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-md shadow-red-200 active:scale-[0.98]',
      outline:
        'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100',
    }

    const sizes = {
      sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5 h-8',
      md: 'px-5 py-2.5 text-sm rounded-xl gap-2 h-10',
      lg: 'px-6 py-3 text-sm rounded-xl gap-2 h-12',
      icon: 'p-2.5 rounded-xl',
    }

    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          'transition-all duration-150 cursor-pointer select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin shrink-0" size={15} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
