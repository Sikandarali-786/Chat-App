import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { initSocket, disconnectSocket } from '@/lib/socket'
import { ConversationSidebar } from '@/components/chat/ConversationSidebar'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { useConversationStore } from '@/store/conversationStore'

export function ChatPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const selectedConversation = useConversationStore((s) => s.selectedConversation)

  useEffect(() => {
    if (accessToken) {
      initSocket(accessToken)
    }

    return () => {
      disconnectSocket()
    }
  }, [accessToken])

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar />

      {/* Chat window */}
      {selectedConversation ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="bg-slate-100 p-6 rounded-full inline-flex mb-4">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Select a conversation
            </h3>
            <p className="text-sm text-slate-500">
              Choose a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
