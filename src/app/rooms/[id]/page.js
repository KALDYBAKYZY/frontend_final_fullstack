'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { api } from '@/lib/api'
import ChatBox from '@/components/ChatBox'
import OnlineUsers from '@/components/OnlineUsers'

export default function RoomDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const { send, on, connected } = useSocket()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !id) return
    Promise.all([
      api.get(`/rooms/${id}`, token),
      api.get(`/messages/${id}`, token),
    ])
      .then(([r, m]) => { setRoom(r); setMessages(m) })
      .finally(() => setLoading(false))
  }, [token, id])

  useEffect(() => {
    if (!id || !connected) return
    send({ type: 'join_room', roomId: id })
    return () => send({ type: 'leave_room', roomId: id })
  }, [id, send, connected])

  useEffect(() => {
    const unsubMsg = on('chat_message', (data) => {
      setMessages((prev) => [...prev, data.message])
    })
    const unsubOnline = on('online_users', (data) => {
      setOnlineUsers(data.users)
    })
    const unsubDelete = on('delete_message', (data) => {
    setMessages((prev) => prev.filter((m) => m._id !== data.messageId))
    })
    return () => { unsubMsg(); unsubOnline(); unsubDelete() }
  }, [on])

  const sendMessage = async (content) => {
    const msg = await api.post(`/messages/${id}`, { content }, token)
    console.log('msg from DB:', msg)
    console.log('user._id:', user?._id)
    send({ type: 'chat_message', roomId: id, content })
    setMessages((prev) => [...prev, msg])
  }
  const deleteMessage = async (msgId) => {
    console.log('deleting:', msgId, 'roomId:', id)
    await api.delete(`/messages/${msgId}`, token)
    setMessages((prev) => prev.filter((m) => m._id !== msgId))
    send({ type: 'delete_message', roomId: id, messageId: msgId })
  }
  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (!room)   return <div className="page"><p>Room not found.</p></div>

  return (
    <div className="page">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>{room.name}</h1>
        <span className="badge badge-subject" style={{ marginRight: '8px' }}>{room.subject}</span>
        {room.isPrivate && <span className="badge badge-private">Private</span>}
        {room.description && (
          <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>{room.description}</p>
        )}
      </div>

      <div className="chat-wrapper">
        <ChatBox
          messages={messages}
          onSend={sendMessage}
          onDelete={deleteMessage}
          currentUserId={user?._id}
        />
        <OnlineUsers users={onlineUsers} />
      </div>
    </div>
  )
}
