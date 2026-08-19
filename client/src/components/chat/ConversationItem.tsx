import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useConversationStore } from '@/store/conversationStore'
import type { Conversation } from '@/types'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

interface ConversationItemProps {
  conversation: Conversation
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const user = useAuthStore((s) => s.user)
  const { selectedConversation, selectConversation } = useConversationStore()
  const isSelected = selectedConversation?._id === conversation._id

  const isGroup = conversation.type === 'group'
  const otherUser = isGroup
    ? null
    : conversation.participants.find((p) => p._id !== user?._id)

  const name = isGroup ? conversation.name : otherUser?.fullName
  const avatar = isGroup ? conversation.avatar : otherUser?.avatar
  const status = !isGroup ? otherUser?.status : null

  return (
    <div
      onClick={() => selectConversation(conversation)}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        'hover:bg-slate-50',
        isSelected && 'bg-indigo-50 hover:bg-indigo-50 border-l-3 border-l-indigo-600'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
            {isGroup ? (
              <Users size={18} />
            ) : (
              name?.charAt(0).toUpperCase()
            )}
          </div>
        )}
        {status === 'online' && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <h4 className="font-semibold text-sm text-slate-900 truncate">
            {name}
          </h4>
          {conversation.lastMessage && (
            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">
          {conversation.lastMessage?.content || 'No messages yet'}
        </p>
      </div>
    </div>
  )
}
