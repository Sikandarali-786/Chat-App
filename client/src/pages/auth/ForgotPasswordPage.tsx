import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useForgotPassword } from '@/modules/auth/auth.hooks'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess, data } = useForgotPassword()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (formData: FormData) => forgotPassword(formData)

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your inbox 📬"
        subtitle="We've sent you a password reset link"
      >
        <div className="space-y-6">
          {/* Success illustration */}
          <div className="flex flex-col items-center py-4 gap-3">
            <div className="bg-green-50 p-4 rounded-2xl">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Reset link sent to
              </p>
              <p className="text-sm text-indigo-600 font-semibold mt-0.5">
                {getValues('email')}
              </p>
            </div>
          </div>

          {/* Dev mode info */}
          {data?.data && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                🛠 Dev mode — token returned in response
              </p>
              <p className="text-xs text-amber-600 font-mono break-all">
                {(data.data as { resetToken?: string }).resetToken}
              </p>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">
            Didn't receive it? Check spam or{' '}
            <button
              onClick={() => forgotPassword({ email: getValues('email') })}
              className="text-indigo-500 hover:underline cursor-pointer"
            >
              resend
            </button>
          </p>

          <Link to="/login">
            <Button variant="outline" className="w-full" size="lg">
              <ArrowLeft size={15} />
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Forgot password? 🔐"
      subtitle="No worries, we'll send you reset instructions"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          leftIcon={<Mail size={15} />}
          hint="Enter the email associated with your account"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          loading={isPending}
          className="w-full"
          size="lg"
        >
          {!isPending && 'Send reset link'}
        </Button>

        <Link to="/login">
          <Button variant="ghost" className="w-full" size="lg">
            <ArrowLeft size={15} />
            Back to Login
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}
