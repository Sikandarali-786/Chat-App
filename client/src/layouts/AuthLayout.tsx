import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-violet-600 to-violet-800 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <MessageCircle size={24} />
          </div>
          <span className="text-xl font-semibold">ChatApp</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Connect with anyone,<br />anywhere
          </h1>
          <p className="text-violet-200 text-lg">
            Real-time messaging, voice & video calls, group chats and so much more.
          </p>
        </div>

        <div className="flex gap-4">
          {['100k+ users', 'Real-time', 'Secure'].map((tag) => (
            <span
              key={tag}
              className="bg-white/15 px-3 py-1.5 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-white overflow-y-auto">
        {/* Mobile brand */}
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 mb-8 text-violet-600"
        >
          <MessageCircle size={28} />
          <span className="text-xl font-bold">ChatApp</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
