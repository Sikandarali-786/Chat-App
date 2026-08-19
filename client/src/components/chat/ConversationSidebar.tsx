import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, LogOut, Settings, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useConversationStore } from '@/store/conversationStore'
import { useLogout } from '@/modules/auth/auth.hooks'
import { getConversations } from '@/modules/conversations/conversations.api'
import { ConversationItem } from './ConversationItem'
import { NewChatModal } from './NewChatModal'

export function ConversationSidebar() {
  const user = useAuthStore((s) => s.user)
  const conversations = useConversationStore((s) => s.conversations)
  const setConversations = useConversationStore((s) => s.setConversations)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const { mutate: logout } = useLogout()

  // Fetch conversations
  const { data } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations(),
  })

  useEffect(() => {
    if (data) {
      setConversations(data.data)
    }
  }, [data, setConversations])

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(query)
    }
    
    // One-to-one: search by participant name
    const otherUser = conv.participants.find((p) => p._id !== user?._id)
    return otherUser?.fullName.toLowerCase().includes(query) ||
           otherUser?.username.toLowerCase().includes(query)
  })

  return (
    <>
      <div className="w-[360px] bg-white border-r border-slate-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Chats</h2>
                <p className="text-xs text-slate-500">{user?.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNewChat(true)}
              >
                <Plus size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={18} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut size={18} />
              </Button>
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Search conversations..."
            leftIcon={<Search size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="bg-slate-100 p-4 rounded-full mb-3">
                <MessageCircle size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                No conversations yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Start a new chat to get started
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => setShowNewChat(true)}
              >
                <Plus size={14} />
                New Chat
              </Button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem key={conversation._id} conversation={conversation} />
            ))
          )}
        </div>
      </div>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </>
  )
}
