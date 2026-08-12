import type { User } from './index'

export interface Conversation {
  _id: string
  type: 'one-to-one' | 'group'
  participants: User[]
  name?: string
  avatar?: string
  admin?: string
  lastMessage?: Message | null
  lastMessageAt?: string | null
  pinnedBy: string[]
  createdAt: string
  updatedAt: string
}

export interface Message {
  _id: string
  conversationId: string
  senderId: User
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'gif'
  content: string
  fileName?: string | null
  fileSize?: number | null
  mimeType?: string | null
  duration?: number | null
  mentions: User[]
  replyTo?: Message | null
  status: 'sent' | 'delivered' | 'seen'
  deliveredTo: string[]
  seenBy: string[]
  starredBy: string[]
  isDeleted: boolean
  deletedFor: string[]
  isEdited: boolean
  editedAt?: string | null
  createdAt: string
  updatedAt: string
}
