import { useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MailCheck, Loader2, XCircle, ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'
import { useVerifyEmail } from '@/modules/auth/auth.hooks'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const verifyCalled = useRef(false)
  const { mutate: verify, isPending, isSuccess, isError } = useVerifyEmail()

  useEffect(() => {
    if (token && !verifyCalled.current) {
      verifyCalled.current = true
      verify(token)
    }
  }, [token, verify])

  return (
    <AuthLayout
      title="Email verification"
      subtitle="We're confirming your email address"
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Status icon */}
        <div
          className={`p-5 rounded-2xl ${
            isPending
              ? 'bg-indigo-50'
              : isSuccess
              ? 'bg-green-50'
              : isError
              ? 'bg-red-50'
              : 'bg-slate-50'
          }`}
        >
          {isPending ? (
            <Loader2 size={44} className="text-indigo-500 animate-spin" />
          ) : isSuccess ? (
            <MailCheck size={44} className="text-green-500" />
          ) : isError ? (
            <XCircle size={44} className="text-red-500" />
          ) : (
            <MailCheck size={44} className="text-slate-400" />
          )}
        </div>

        {/* Status message */}
        <div className="text-center space-y-1.5">
          {isPending && (
            <>
              <p className="font-semibold text-slate-800">Verifying your email...</p>
              <p className="text-sm text-slate-500">Please wait a moment</p>
            </>
          )}
          {isSuccess && (
            <>
              <p className="font-semibold text-green-700">Email verified!</p>
              <p className="text-sm text-slate-500">
                Your account is now active. You can sign in.
              </p>
            </>
          )}
          {isError && (
            <>
              <p className="font-semibold text-red-600">Verification failed</p>
              <p className="text-sm text-slate-500">
                The link may be expired or already used. Please register again.
              </p>
            </>
          )}
          {!token && !isPending && !isSuccess && !isError && (
            <>
              <p className="font-semibold text-slate-800">Check your inbox</p>
              <p className="text-sm text-slate-500">
                We sent a verification link to your email. Click it to activate your account.
              </p>
            </>
          )}
        </div>

        {/* Action */}
        {!isPending && (
          <Link to="/login" className="w-full">
            <Button
              variant={isSuccess ? 'primary' : 'outline'}
              className="w-full"
              size="lg"
            >
              {isSuccess ? (
                <>
                  Continue to Login
                  <ArrowRight size={15} />
                </>
              ) : (
                'Back to Login'
              )}
            </Button>
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}
