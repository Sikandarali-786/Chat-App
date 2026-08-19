import { format, isToday, isYesterday } from 'date-fns'
import type { Message } from '@/types'
import { MessageBubble } from './MessageBubble'


interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt)
    let dateKey: string

    if (isToday(date)) {
      dateKey = 'Today'
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday'
    } else {
      dateKey = format(date, 'MMMM d, yyyy')
    }

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          {/* Date divider */}
          <div className="flex items-center justify-center mb-4">
            <span className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
              {date}
            </span>
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {msgs.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
