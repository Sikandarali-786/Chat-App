import { create } from 'zustand'
import type { Conversation } from '@/types'

interface ConversationState {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  selectConversation: (conversation: Conversation | null) => void
  clearConversations: () => void
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  selectedConversation: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === id ? { ...c, ...updates } : c
      ),
      selectedConversation:
        state.selectedConversation?._id === id
          ? { ...state.selectedConversation, ...updates }
          : state.selectedConversation,
    })),

  selectConversation: (conversation) =>
    set({ selectedConversation: conversation }),

  clearConversations: () =>
    set({ conversations: [], selectedConversation: null }),
}))
