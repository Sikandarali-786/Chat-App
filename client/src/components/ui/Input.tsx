import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}

        <div className="relative group">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            style={{
              paddingLeft: leftIcon ? '2.5rem' : undefined,
              paddingRight: rightIcon ? '2.5rem' : undefined,
            }}
            className={cn(
              // Base
              'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900',
              'placeholder:text-slate-400',
              // Transitions
              'transition-all duration-200',
              // Focus
              'outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400',
              // Hover
              'hover:border-slate-300',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50',
              // Default border
              !error ? 'border-slate-200' : 'border-red-300 bg-red-50/30 focus:ring-red-100 focus:border-red-400',
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-400">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
