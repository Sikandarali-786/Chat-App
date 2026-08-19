import { create } from 'zustand'
import type { Message } from '@/types'

interface MessageState {
  messages: Record<string, Message[]> // conversationId → messages[]
  replyingTo: Message | null

  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  setReplyingTo: (message: Message | null) => void
  clearMessages: (conversationId: string) => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: {},
  replyingTo: null,

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message],
      },
    })),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, ...updates } : m
        ),
      },
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m._id !== messageId
        ),
      },
    })),

  setReplyingTo: (message) => set({ replyingTo: message }),

  clearMessages: (conversationId) =>
    set((state) => {
      const newMessages = { ...state.messages }
      delete newMessages[conversationId]
      return { messages: newMessages }
    }),
}))
