import api from '@/lib/axios'
import type { ApiResponse, User } from '@/types'
import type { Conversation, Message } from '@/types/chat'

export const getConversations = async () => {
  const { data } = await api.get<ApiResponse<{ conversations: Conversation[]; pagination: any }>>(
    '/conversations'
  )
  return data.data
}

export const createConversation = async (participantId: string) => {
  const { data } = await api.post<ApiResponse<Conversation>>('/conversations', {
    participantId,
  })
  return data.data
}

export const getMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
) => {
  const { data } = await api.get<ApiResponse<{ messages: Message[]; pagination: any }>>(
    `/messages/conversation/${conversationId}?page=${page}&limit=${limit}`
  )
  return data.data
}

export const sendMessage = async (payload: { conversationId: string; content: string }) => {
  const { data } = await api.post<ApiResponse<Message>>('/messages', payload)
  return data.data
}

export const searchUsers = async (query: string, page = 1, limit = 10) => {
  const { data } = await api.get<ApiResponse<{ users: User[]; pagination: any }>>(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  )
  return data.data
}
