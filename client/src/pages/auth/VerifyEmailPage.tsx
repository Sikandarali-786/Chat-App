import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MailCheck, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { useVerifyEmail } from '@/modules/auth/auth.hooks'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const { mutate: verify, isPending, isSuccess, isError } = useVerifyEmail()

  // Auto-verify if token in URL
  useEffect(() => {
    if (token) {
      verify(token)
    }
  }, [token, verify])

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Check your inbox for the verification link"
    >
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="bg-violet-50 p-5 rounded-full">
          {isPending ? (
            <Loader2 size={40} className="text-violet-600 animate-spin" />
          ) : (
            <MailCheck size={40} className="text-violet-600" />
          )}
        </div>

        {isPending && (
          <p className="text-gray-600 text-center">Verifying your email...</p>
        )}

        {isSuccess && (
          <div className="text-center">
            <p className="text-green-600 font-medium mb-1">Email verified!</p>
            <p className="text-gray-500 text-sm">You can now sign in.</p>
          </div>
        )}

        {isError && (
          <div className="text-center">
            <p className="text-red-500 font-medium mb-1">Verification failed</p>
            <p className="text-gray-500 text-sm">
              The link may be expired or invalid.
            </p>
          </div>
        )}

        {!token && (
          <p className="text-gray-600 text-center text-sm">
            We sent a verification link to your email address. Click the link to
            verify your account.
          </p>
        )}

        <Link to="/login">
          <Button variant="outline" className="w-full">
            Back to Login
          </Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
