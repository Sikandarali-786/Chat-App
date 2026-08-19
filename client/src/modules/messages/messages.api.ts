import api from '@/lib/axios'
import type { ApiResponse, Message, PaginatedResponse } from '@/types'

// ─── Get Messages ─────────────────────────────────────────────────────────────
export const getMessages = async (conversationId: string, page = 1, limit = 50) => {
  const { data } = await api.get<ApiResponse<PaginatedResponse<Message>>>(
    `/messages/${conversationId}?page=${page}&limit=${limit}`
  )
  return data.data
}

// ─── Send Message ─────────────────────────────────────────────────────────────
export const sendMessage = async (payload: {
  conversationId: string
  content: string
  type?: string
  replyTo?: string
}) => {
  const { data } = await api.post<ApiResponse<Message>>('/messages', payload)
  return data.data
}

// ─── Edit Message ─────────────────────────────────────────────────────────────
export const editMessage = async (messageId: string, content: string) => {
  const { data } = await api.patch<ApiResponse<Message>>(
    `/messages/${messageId}`,
    { content }
  )
  return data.data
}

// ─── Delete Message ───────────────────────────────────────────────────────────
export const deleteMessage = async (messageId: string, forEveryone = false) => {
  await api.delete(`/messages/${messageId}?forEveryone=${forEveryone}`)
}

// ─── Star Message ─────────────────────────────────────────────────────────────
export const starMessage = async (messageId: string) => {
  await api.post(`/messages/${messageId}/star`)
}

// ─── Unstar Message ───────────────────────────────────────────────────────────
export const unstarMessage = async (messageId: string) => {
  await api.delete(`/messages/${messageId}/star`)
}
