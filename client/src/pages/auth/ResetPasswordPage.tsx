import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useResetPassword } from '@/modules/auth/auth.hooks'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters required')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { mutate: resetPassword, isPending } = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This reset link is missing a token">
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="bg-red-50 p-4 rounded-2xl">
            <AlertTriangle size={36} className="text-red-500" />
          </div>
          <p className="text-slate-500 text-sm text-center">
            No reset token found in the URL. Please request a new password reset link.
          </p>
          <Link to="/forgot-password" className="w-full">
            <Button className="w-full" size="lg">
              Request new link
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const onSubmit = (data: FormData) => {
    resetPassword({ token, password: data.password })
  }

  return (
    <AuthLayout
      title="Set new password 🔑"
      subtitle="Choose a strong password for your account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New Password"
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

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          leftIcon={<Lock size={15} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full"
          size="lg"
        >
          {!isPending && 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
