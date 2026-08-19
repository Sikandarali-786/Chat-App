import { useState } from 'react'
import { format } from 'date-fns'
import { useMutation } from '@tanstack/react-query'
import { MoreVertical, Reply, Edit, Trash, Star, Check, CheckCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMessageStore } from '@/store/messageStore'
import { deleteMessage, starMessage, unstarMessage } from '@/modules/messages/messages.api'
import type { Message } from '@/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const user = useAuthStore((s) => s.user)
  const setReplyingTo = useMessageStore((s) => s.setReplyingTo)
  const [showActions, setShowActions] = useState(false)
  
  const isOwn = message.senderId._id === user?._id
  const isDeleted = message.isDeleted

  const { mutate: deleteMsg } = useMutation({
    mutationFn: (forEveryone: boolean) => deleteMessage(message._id, forEveryone),
  })

  const { mutate: toggleStar } = useMutation({
    mutationFn: () => {
      const isStarred = message.starredBy?.includes(user?._id!)
      return isStarred ? unstarMessage(message._id) : starMessage(message._id)
    },
  })

  const isDelivered = message.deliveredTo.length > 0
  const isSeen = message.seenBy.length > 0

  return (
    <div
      className={cn(
        'flex gap-2 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (left for others) */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shrink-0">
          {message.senderId.fullName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {/* Reply preview */}
        {message.replyTo && !isDeleted && (
          <div className="mb-1 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-600 border-l-2 border-indigo-400">
            <p className="font-medium text-[10px] text-indigo-600 mb-0.5">
              {message.replyTo.senderId.fullName}
            </p>
            <p className="truncate">{message.replyTo.content}</p>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl break-words',
            isOwn
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm'
              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm',
            isDeleted && 'italic opacity-60'
          )}
        >
          {!isDeleted && message.isEdited && (
            <span className="text-[10px] opacity-70 mr-1">(edited)</span>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-1.5 mt-0.5 px-1">
          <span className="text-[10px] text-slate-400">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {isOwn && !isDeleted && (
            <span>
              {isSeen ? (
                <CheckCheck size={12} className="text-indigo-500" />
              ) : isDelivered ? (
                <CheckCheck size={12} className="text-slate-400" />
              ) : (
                <Check size={12} className="text-slate-400" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && !isDeleted && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setReplyingTo(message)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reply"
          >
            <Reply size={14} className="text-slate-500" />
          </button>
          {isOwn && (
            <>
              <button
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit size={14} className="text-slate-500" />
              </button>
              <button
                onClick={() => deleteMsg(true)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash size={14} className="text-red-500" />
              </button>
            </>
          )}
          <button
            onClick={() => toggleStar()}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Star"
          >
            <Star
              size={14}
              className={cn(
                message.starredBy?.includes(user?._id!) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'
              )}
            />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical size={14} className="text-slate-500" />
          </button>
        </div>
      )}
    </div>
  )
}
