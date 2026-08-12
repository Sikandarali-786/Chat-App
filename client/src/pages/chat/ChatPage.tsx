import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, MessageCircle, Search, Send } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  useCreateConversation,
  useGetConversations,
  useGetMessages,
  useSearchUsers,
  useSendMessage,
} from '@/modules/chat/chat.hooks'
import { connectSocket, disconnectSocket, onSocketEvent } from '@/lib/socket'
import type { Conversation, Message } from '@/types/chat'
import type { User } from '@/types'

export function ChatPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [messageText, setMessageText] = useState('')
  const [messagePage, setMessagePage] = useState(1)

  const conversationsQuery = useGetConversations()
  const searchUsersMutation = useSearchUsers()
  const createConversationMutation = useCreateConversation()
  const sendMessageMutation = useSendMessage(selectedConversationId)
  const messagesQuery = useGetMessages(selectedConversationId, messagePage)
  const selectedConversationIdRef = useRef(selectedConversationId)

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token || !currentUser) return

    connectSocket(token)

    const removeMessageListener = onSocketEvent<{ conversationId: string }>('message:new', (data) => {
      if (data.conversationId === selectedConversationIdRef.current) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationIdRef.current] })
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return () => {
      removeMessageListener()
      disconnectSocket()
    }
  }, [currentUser, queryClient])

  const conversations = conversationsQuery.data?.conversations ?? []

  const selectedConversation = useMemo(
    () =>
      conversations.find((conversation) => conversation._id === selectedConversationId) ??
      null,
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id)
    }
  }, [conversations, selectedConversationId])

  useEffect(() => {
    setMessagePage(1)
  }, [selectedConversationId])

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.name ?? 'Group chat'
    }

    const otherUser = conversation.participants.find((participant) => participant._id !== currentUser?._id)
    return otherUser?.fullName ?? 'Direct chat'
  }

  const handleSearchUsers = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchTerm.trim()
    if (!query) return

    try {
      const result = await searchUsersMutation.mutateAsync({ query, page: 1, limit: 10 })
      setSearchResults(result.users)
    } catch {
      setSearchResults([])
    }
  }

  const findExistingConversation = (userId: string) => {
    return conversations.find((conversation) =>
      conversation.type === 'one-to-one' &&
      conversation.participants.some((participant) => participant._id === userId)
    )
  }

  const handleStartConversation = async (user: User) => {
    const existing = findExistingConversation(user._id)
    if (existing) {
      setSelectedConversationId(existing._id)
      setSearchResults([])
      setSearchTerm('')
      return
    }

    try {
      const conversation = await createConversationMutation.mutateAsync(user._id)
      setSelectedConversationId(conversation._id)
      conversationsQuery.refetch()
      setSearchResults([])
      setSearchTerm('')
    } catch {
      await conversationsQuery.refetch()
      const updated = findExistingConversation(user._id)
      if (updated) {
        setSelectedConversationId(updated._id)
      }
    }
  }

  const handleSendMessage = async () => {
    const content = messageText.trim()
    if (!content || !selectedConversationId) return

    try {
      await sendMessageMutation.mutateAsync(content)
      setMessageText('')
      messagesQuery.refetch()
      conversationsQuery.refetch()
    } catch {
      // ignore; server error handled by toast in hook
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex h-full max-w-360 gap-6 px-4 py-6 lg:px-8">
        <div className="w-full max-w-95 space-y-5 rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Messaging</p>
              <h2 className="text-2xl font-semibold text-slate-900">Your conversations</h2>
            </div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
              <MessageCircle size={22} />
            </div>
          </div>

          <form onSubmit={handleSearchUsers} className="space-y-4">
            <Input
              label="Search users"
              placeholder="Search by name or username"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              rightIcon={<Search size={18} />}
            />
            <Button type="submit" className="w-full" size="lg">
              Search
            </Button>
          </form>

          {searchUsersMutation.isLoading && <p className="text-sm text-slate-500">Searching people...</p>}

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Results</p>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onClick={() => handleStartConversation(user)}
                    className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="text-sm text-slate-500">@{user.username}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                      <ArrowRight size={16} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Recent chats</p>
                <span className="text-xs text-slate-400">{conversations.length} active</span>
              </div>
              <div className="space-y-3">
                {conversationsQuery.isLoading ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-7 text-center text-sm text-slate-500">
                    No chats yet. Search people to begin.
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const title = getConversationTitle(conversation)
                    const lastMessage = conversation.lastMessage?.content ?? 'No messages yet'
                    const isActive = conversation._id === selectedConversationId
                    return (
                      <button
                        key={conversation._id}
                        type="button"
                        onClick={() => setSelectedConversationId(conversation._id)}
                        className={`block w-full rounded-3xl px-4 py-4 text-left transition ${
                          isActive ? 'border border-indigo-200 bg-indigo-50' : 'border border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{title}</p>
                          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{lastMessage}</p>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Chat window</p>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {selectedConversation ? getConversationTitle(selectedConversation) : 'Select a conversation'}
                  </h3>
                </div>
                <div className="rounded-3xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-100">
                  {selectedConversation ? selectedConversation.participants.length : 0} participants
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden px-8 py-6">
              {selectedConversation ? (
                <div className="flex h-full flex-col gap-5">
                  <div className="flex-1 space-y-4 overflow-y-auto pr-3">
                    {messagesQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Loading messages...</p>
                    ) : messagesQuery.data?.messages.length ? (
                      messagesQuery.data.messages.map((message: Message) => {
                        const isMine = message.senderId._id === currentUser?._id
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-[28px] px-5 py-4 text-sm shadow-sm ${
                                isMine ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white' : 'bg-slate-100 text-slate-900'
                              }`}
                            >
                              <div className="mb-2 text-xs uppercase tracking-[0.18em] ${isMine ? 'text-indigo-100' : 'text-slate-400'}">
                                {isMine ? 'You' : message.senderId.fullName}
                              </div>
                              <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
                              <div className="mt-3 text-[11px] text-slate-300">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                        <p className="mb-3 text-lg font-semibold text-slate-900">No messages yet</p>
                        <p>Send a message to start the conversation.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex gap-3">
                      <Input
                        label="Write a message"
                        placeholder="Type your message here..."
                        className="flex-1"
                        value={messageText}
                        onChange={(event) => setMessageText(event.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={handleSendMessage}
                        loading={sendMessageMutation.isLoading}
                        size="lg"
                        className="px-6!"
                      >
                        <Send size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center text-slate-500">
                  <div className="rounded-[28px] bg-slate-100 p-12">
                    <Search size={52} />
                  </div>
                  <p className="text-xl font-semibold text-slate-900">No chat selected</p>
                  <p className="max-w-md text-sm leading-6 text-slate-500">
                    Choose a conversation from the left panel or search for a user to begin a secure chat.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
