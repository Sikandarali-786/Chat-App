import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Zap, Shield, Users } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

const features = [
  {
    icon: Zap,
    title: 'Real-time messaging',
    desc: 'Instant delivery with read receipts',
  },
  {
    icon: Shield,
    title: 'Secure & private',
    desc: 'End-to-end encrypted conversations',
  },
  {
    icon: Users,
    title: 'Group chats & calls',
    desc: 'Connect with teams and friends',
  },
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
        }}
      >
        {/* Background blobs */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-2xl border border-white/30">
              <MessageCircle size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ChatApp</span>
          </Link>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Connect with anyone,<br />
              <span className="text-purple-200">anywhere.</span>
            </h1>
            <p className="text-purple-200 text-lg leading-relaxed">
              The modern messaging platform built for speed, privacy, and real-time collaboration.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl border border-white/20 shrink-0">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{title}</p>
                  <p className="text-purple-300 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-6">
          {[['10k+', 'Users'], ['99.9%', 'Uptime'], ['< 100ms', 'Latency']].map(
            ([val, label]) => (
              <div key={label}>
                <p className="text-white font-bold text-lg">{val}</p>
                <p className="text-purple-300 text-xs">{label}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto">
        {/* Mobile logo */}
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2.5 mb-8 text-indigo-600"
        >
          <div className="bg-indigo-100 p-2 rounded-xl">
            <MessageCircle size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">ChatApp</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              <p className="text-slate-500 mt-1.5 text-sm">{subtitle}</p>
            </div>

            {children}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            By continuing, you agree to our{' '}
            <span className="text-indigo-500 cursor-pointer hover:underline">Terms</span>
            {' '}and{' '}
            <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
