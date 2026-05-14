'use client'
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token }           = useAuth()
  const wsRef               = useRef(null)
  const listenersRef        = useRef({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000/ws'
    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WS connected!')
      setTimeout(() => setConnected(true), 100)
    }

    ws.onclose = () => {
      console.log('WS disconnected!')
      setConnected(false)
    }

    ws.onerror = (e) => {
      console.log('WS error:', e)
    }
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        const handlers = listenersRef.current[data.type] || []
        handlers.forEach((fn) => fn(data))
      } catch (_) {}
    }

    return () => ws.close()
  }, [token])

  const send = useCallback((payload) => {
    console.log('WS send:', payload, 'readyState:', wsRef.current?.readyState)
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])
  const on = useCallback((type, handler) => {
    if (!listenersRef.current[type]) listenersRef.current[type] = []
    listenersRef.current[type].push(handler)
    return () => {
      listenersRef.current[type] = listenersRef.current[type].filter((h) => h !== handler)
    }
  }, [])

  return (
    <SocketContext.Provider value={{ connected, send, on }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
