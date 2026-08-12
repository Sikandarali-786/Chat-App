import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useResetPassword } from '@/modules/auth/auth.hooks'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number'),
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
      <AuthLayout title="Invalid link" subtitle="This reset link is invalid">
        <div className="flex flex-col items-center gap-4 py-4">
          <AlertCircle size={40} className="text-red-500" />
          <p className="text-gray-500 text-sm text-center">
            No reset token found. Please request a new reset link.
          </p>
          <Link to="/forgot-password" className="w-full">
            <Button className="w-full">Request new link</Button>
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
      title="Reset password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="New Password"
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
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
          leftIcon={<Lock size={16} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" loading={isPending} className="w-full mt-1">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  )
}
