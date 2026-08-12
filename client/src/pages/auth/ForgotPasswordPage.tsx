import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForgotPassword } from '@/modules/auth/auth.hooks'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => forgotPassword(data)

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We sent you a password reset link"
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-green-50 p-4 rounded-full">
            <Mail size={36} className="text-green-600" />
          </div>
          <p className="text-gray-600 text-center text-sm">
            If that email is registered, you'll receive a reset link shortly.
            In development mode, the token is also returned in the API response.
          </p>
          <Link to="/login" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft size={16} />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={16} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" loading={isPending} className="w-full mt-1">
          Send reset link
        </Button>

        <Link to="/login">
          <Button variant="ghost" className="w-full">
            <ArrowLeft size={16} />
            Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}
