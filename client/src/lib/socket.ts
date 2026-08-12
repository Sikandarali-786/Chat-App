import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

const getServerUrl = () => {
  if (import.meta.env.DEV) {
    return 'http://localhost:5000'
  }
  return window.location.origin
}

export const connectSocket = (token: string) => {
  if (socket && socket.connected) {
    return socket
  }

  socket = io(getServerUrl(), {
    auth: { token },
    transports: ['websocket'],
    withCredentials: true,
  })

  return socket
}

export const disconnectSocket = () => {
  if (!socket) return
  socket.disconnect()
  socket = null
}

export const onSocketEvent = <T>(event: string, callback: (data: T) => void) => {
  if (!socket) return () => {}
  socket.on(event, callback)
  return () => {
    socket.off(event, callback)
  }
}

export const emitSocketEvent = (event: string, payload: unknown) => {
  socket?.emit(event, payload)
}

export const getSocket = () => socket
