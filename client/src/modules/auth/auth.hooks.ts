import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import * as authApi from './auth.api'
import type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types'

// ─── Register ─────────────────────────────────────────────────────────────────
export const useRegister = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      toast.success(data.message)
      // In dev mode token is returned in response
      const token = (data.data as { verificationToken?: string })?.verificationToken
      if (token) {
        navigate(`/verify-email?token=${token}`)
      } else {
        navigate('/verify-email')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Registration failed')
    },
  })
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const useVerifyEmail = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      toast.success(data.message)
      navigate('/login')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Verification failed')
    },
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────
export const useLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.fullName}!`)
      navigate('/chat')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Login failed')
    },
  })
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export const useLogout = () => {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      navigate('/login')
      toast.success('Logged out successfully')
    },
  })
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Something went wrong')
    },
  })
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export const useResetPassword = () => {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: (data) => {
      toast.success(data.message)
      navigate('/login')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? 'Reset failed')
    },
  })
}

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const useGetMe = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setUser = useAuthStore((s) => s.setUser)

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await authApi.getMe()
      setUser(data.data)
      return data.data
    },
    enabled: isAuthenticated,
  })
}
