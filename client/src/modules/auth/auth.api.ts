import api from '@/lib/axios'
import type {
  ApiResponse,
  User,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '@/types'

// ─── Register ─────────────────────────────────────────────────────────────────
export const register = async (payload: RegisterPayload) => {
  const { data } = await api.post<ApiResponse<{ verificationToken: string }>>(
    '/auth/register',
    payload
  )
  return data
}

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (token: string) => {
  const { data } = await api.post<ApiResponse>('/auth/verify-email', { token })
  return data
}

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (payload: LoginPayload) => {
  const { data } = await api.post<ApiResponse<AuthTokens & { user: User }>>(
    '/auth/login',
    payload
  )
  return data
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async () => {
  const { data } = await api.post<ApiResponse>('/auth/logout')
  return data
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const { data } = await api.post<ApiResponse<{ resetToken: string }>>(
    '/auth/forgot-password',
    payload
  )
  return data
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (payload: ResetPasswordPayload) => {
  const { data } = await api.post<ApiResponse>('/auth/reset-password', payload)
  return data
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (token: string) => {
  const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
    '/auth/refresh-token',
    { refreshToken: token }
  )
  return data
}

// ─── Get Me ───────────────────────────────────────────────────────────────────
export const getMe = async () => {
  const { data } = await api.get<ApiResponse<User>>('/auth/me')
  return data
}
