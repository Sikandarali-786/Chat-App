import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { X, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useConversationStore } from '@/store/conversationStore'
import { searchUsers, createConversation } from '@/modules/conversations/conversations.api'
import { queryClient } from '@/lib/queryClient'

interface NewChatModalProps {
  onClose: () => void
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const [query, setQuery] = useState('')
  const selectConversation = useConversationStore((s) => s.selectConversation)

  const { data, isLoading } = useQuery({
    queryKey: ['search-users', query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  })

  const { mutate: startChat, isPending } = useMutation({
    mutationFn: (userId: string) => createConversation(userId),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      selectConversation(conversation)
      onClose()
    },
  })

  const users = data?.data || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">New Chat</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <Input
            placeholder="Search by name or username..."
            leftIcon={<Search size={14} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-indigo-500" size={24} />
            </div>
          )}

          {!query && !isLoading && (
            <p className="text-center text-sm text-slate-400 py-8">
              Search for users to start a conversation
            </p>
          )}

          {query && !isLoading && users.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-8">
              No users found
            </p>
          )}

          {users.length > 0 && users.map((user: any) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
              onClick={() => !isPending && startChat(user._id)}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500 truncate">@{user.username}</p>
              </div>
              {isPending && (
                <Loader2 className="animate-spin text-indigo-500" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
