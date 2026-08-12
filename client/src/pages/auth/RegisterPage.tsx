import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Eye, EyeOff, AtSign } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRegister } from '@/modules/auth/auth.hooks'

const schema = z.object({
  fullName: z.string().min(2, 'At least 2 characters required'),
  username: z
    .string()
    .min(3, 'At least 3 characters required')
    .regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers & underscores only'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters required')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: registerUser, isPending } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => registerUser(data)

  return (
    <AuthLayout
      title="Create account ✨"
      subtitle="Join ChatApp and start connecting today"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            leftIcon={<User size={15} />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Username"
            type="text"
            placeholder="john_doe"
            autoComplete="username"
            leftIcon={<AtSign size={15} />}
            error={errors.username?.message}
            {...register('username')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={15} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          leftIcon={<Lock size={15} />}
          hint="Must include uppercase letter and number"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer hover:text-slate-700 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full"
          size="lg"
        >
          {!isPending && 'Create account'}
        </Button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-slate-400">
              Already have an account?
            </span>
          </div>
        </div>

        <Link to="/login">
          <Button variant="outline" className="w-full" size="lg">
            Sign in instead
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}
