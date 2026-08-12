import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Conversation, Message } from '@/types/chat'
import type { User } from '@/types'
import * as chatApi from './chat.api'

export const useGetConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const useSearchUsers = () => {
  return useMutation({
    mutationFn: ({ query, page = 1, limit = 10 }: { query: string; page?: number; limit?: number }) =>
      chatApi.searchUsers(query, page, limit),
  })
}

export const useCreateConversation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (participantId: string) => chatApi.createConversation(participantId),
    onSuccess: () => queryClient.invalidateQueries(['conversations']),
  })
}

export const useGetMessages = (conversationId: string | null, page = 1) => {
  return useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => {
      if (!conversationId) throw new Error('Conversation ID required')
      return chatApi.getMessages(conversationId, page)
    },
    enabled: Boolean(conversationId),
    keepPreviousData: true,
    staleTime: 1000 * 30,
    retry: 1,
  })
}

export const useSendMessage = (conversationId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => {
      if (!conversationId) throw new Error('Conversation ID required')
      return chatApi.sendMessage({ conversationId, content })
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries(['messages', conversationId])
        queryClient.invalidateQueries(['conversations'])
      }
    },
  })
}
