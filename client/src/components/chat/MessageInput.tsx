import { useState, useRef, KeyboardEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Send, X, Smile, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMessageStore } from '@/store/messageStore'
import { sendMessage } from '@/modules/messages/messages.api'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  conversationId: string
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('')
  const { replyingTo, setReplyingTo } = useMessageStore()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { mutate: send, isPending } = useMutation({
    mutationFn: () =>
      sendMessage({
        conversationId,
        content: content.trim(),
        replyTo: replyingTo?._id,
      }),
    onSuccess: () => {
      setContent('')
      setReplyingTo(null)
      inputRef.current?.focus()
    },
  })

  const handleSend = () => {
    if (!content.trim() || isPending) return
    send()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white">
      {/* Reply preview */}
      {replyingTo && (
        <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-indigo-600 mb-0.5">
              Replying to {replyingTo.senderId.fullName}
            </p>
            <p className="text-xs text-slate-600 truncate">{replyingTo.content}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 hover:bg-indigo-100 rounded-lg transition-colors ml-2"
          >
            <X size={14} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 py-3 flex items-end gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip size={18} className="text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile size={18} className="text-slate-500" />
          </Button>
        </div>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50',
              'text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:bg-white',
              'resize-none overflow-hidden transition-all',
              'max-h-32'
            )}
            style={{
              height: 'auto',
              minHeight: '42px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`
            }}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!content.trim() || isPending}
          size="icon"
          className="shrink-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  )
}
