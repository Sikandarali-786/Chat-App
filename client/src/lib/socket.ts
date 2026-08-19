import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = (token: string) => {
  if (socket?.connected) return socket

  socket = io('http://localhost:5000', {
    auth: { token },
    autoConnect: true,
  })

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected')
  })

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const getSocket = () => socket

export default socket
