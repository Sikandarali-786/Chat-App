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
        'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 shadow-sm',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
      destructive:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
      outline:
        'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
      lg: 'px-6 py-3 text-base rounded-xl gap-2',
      icon: 'p-2 rounded-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-150 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" size={16} />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
