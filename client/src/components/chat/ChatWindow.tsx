import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useConversationStore } from '@/store/conversationStore'
import { useMessageStore } from '@/store/messageStore'
import { getMessages } from '@/modules/messages/messages.api'
import { getSocket } from '@/lib/socket'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'

export function ChatWindow() {
  const user = useAuthStore((s) => s.user)
  const selectedConversation = useConversationStore((s) => s.selectedConversation)
  const selectConversation = useConversationStore((s) => s.selectConversation)
  const { messages, setMessages, addMessage, updateMessage } = useMessageStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversationId = selectedConversation?._id!
  const isGroup = selectedConversation?.type === 'group'
  const otherUser = !isGroup
    ? selectedConversation?.participants.find((p) => p._id !== user?._id)
    : null

  const name = isGroup ? selectedConversation?.name : otherUser?.fullName
  const status = !isGroup ? otherUser?.status : null

  // Fetch messages
  const { data } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
  })

  useEffect(() => {
    if (data) {
      setMessages(conversationId, data.data)
    }
  }, [data, conversationId, setMessages])

  // Socket listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket || !conversationId) return

    const handleNewMessage = (payload: any) => {
      if (payload.conversationId === conversationId) {
        addMessage(conversationId, payload.message)
      }
    }

    const handleEditedMessage = (payload: any) => {
      if (payload.conversationId === conversationId) {
        updateMessage(conversationId, payload.message._id, payload.message)
      }
    }

    const handleDeletedMessage = (payload: any) => {
      if (payload.conversationId === conversationId) {
        updateMessage(conversationId, payload.messageId, { isDeleted: true, content: 'This message was deleted' })
      }
    }

    socket.on('message:new', handleNewMessage)
    socket.on('message:edited', handleEditedMessage)
    socket.on('message:deleted', handleDeletedMessage)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('message:edited', handleEditedMessage)
      socket.off('message:deleted', handleDeletedMessage)
    }
  }, [conversationId, addMessage, updateMessage])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[conversationId]])

  if (!selectedConversation) return null

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => selectConversation(null)}
          >
            <ArrowLeft size={18} />
          </Button>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
            {name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{name}</h3>
            <p className="text-xs text-slate-500">
              {status === 'online' ? (
                <span className="text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Video size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50">
        <MessageList messages={messages[conversationId] || []} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput conversationId={conversationId} />
    </div>
  )
}
