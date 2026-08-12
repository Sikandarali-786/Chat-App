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
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, underscores'),
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: register, isPending } = useRegister()

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => register(data)

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join ChatApp and start connecting"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Muhammad Sikandar"
          leftIcon={<User size={16} />}
          error={errors.fullName?.message}
          {...formRegister('fullName')}
        />

        <Input
          label="Username"
          type="text"
          placeholder="muhammad_sikandar"
          leftIcon={<AtSign size={16} />}
          error={errors.username?.message}
          {...formRegister('username')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...formRegister('email')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 characters"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...formRegister('password')}
        />

        <Button type="submit" loading={isPending} className="w-full mt-1">
          Create account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-violet-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
