// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  _id: string
  fullName: string
  username: string
  email: string
  avatar: string
  bio: string
  isVerified: boolean
  status: 'online' | 'offline' | 'away'
  lastSeen: string | null
  createdAt: string
  updatedAt: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  username: string
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface VerifyEmailPayload {
  token: string
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}
