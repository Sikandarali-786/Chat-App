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

// ─── Conversation ─────────────────────────────────────────────────────────────
export interface Conversation {
  _id: string
  type: 'one-to-one' | 'group'
  participants: User[]
  lastMessage?: Message
  name?: string
  avatar?: string
  groupAdmin?: string
  isPinned?: boolean
  createdAt: string
  updatedAt: string
}

// ─── Message ──────────────────────────────────────────────────────────────────
export interface Message {
  _id: string
  conversationId: string
  senderId: User
  content: string
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'gif'
  replyTo?: Message
  mentions?: string[]
  fileName?: string
  fileSize?: number
  mimeType?: string
  duration?: number
  isEdited: boolean
  isDeleted: boolean
  deletedBy: string[]
  deliveredTo: string[]
  seenBy: string[]
  starredBy: string[]
  createdAt: string
  updatedAt: string
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
