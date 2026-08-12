import { MessageCircle } from 'lucide-react'

// Placeholder — will be fully built in Phase 2
export function ChatPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="bg-violet-100 p-5 rounded-full inline-flex mb-4">
          <MessageCircle size={40} className="text-violet-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ChatApp</h1>
        <p className="text-gray-500 mt-2">Chat interface coming in Phase 2</p>
      </div>
    </div>
  )
}
