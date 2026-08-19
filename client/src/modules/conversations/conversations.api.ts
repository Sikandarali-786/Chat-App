import api from '@/lib/axios'
import type { ApiResponse, Conversation, PaginatedResponse } from '@/types'

// ─── Get Conversations ────────────────────────────────────────────────────────
export const getConversations = async (page = 1, limit = 20) => {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Conversation>>>(
    `/conversations?page=${page}&limit=${limit}`
  )
  return data.data
}

// ─── Get Conversation by ID ───────────────────────────────────────────────────
export const getConversation = async (id: string) => {
  const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`)
  return data.data
}

// ─── Create One-to-One Conversation ───────────────────────────────────────────
export const createConversation = async (participantId: string) => {
  const { data } = await api.post<ApiResponse<Conversation>>('/conversations', {
    participantId,
  })
  return data.data
}

// ─── Search Users ─────────────────────────────────────────────────────────────
export const searchUsers = async (query: string) => {
  const { data } = await api.get<ApiResponse<PaginatedResponse<any>>>(
    `/users/search?q=${query}&limit=10`
  )
  return data.data
}
