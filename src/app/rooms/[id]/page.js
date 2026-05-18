'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../context/AuthContext'
import { useSocket } from '../../../context/SocketContext'
import { api } from '../../../lib/api'
import ChatBox from '../../../components/ChatBox'
import OnlineUsers from '../../../components/OnlineUsers'

export default function RoomDetailPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const { send, on, connected } = useSocket()
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (!token || !id) return
    Promise.all([
      api.get(`/rooms/${id}`, token),
      api.get(`/messages/${id}`, token),
    ])
      .then(([r, m]) => {
  setRoom(r)
  setMessages(m)
  setRequests(r.pendingRequests || [])
})
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
  send({ type: 'chat_message', roomId: id, content, messageId: msg._id })
  setMessages((prev) => [...prev, msg])
}
const deleteMessage = async (msgId) => {
    console.log('deleting:', msgId, 'roomId:', id)
    await api.delete(`/messages/${msgId}`, token)
    setMessages((prev) => prev.filter((m) => m._id !== msgId))
    send({ type: 'delete_message', roomId: id, messageId: msgId })
  }
  const handleApprove = async (userId) => {
  await api.post(`/rooms/${id}/approve/${userId}`, {}, token)
  setRequests((prev) => prev.filter((r) => r._id !== userId))
}

const handleReject = async (userId) => {
  await api.post(`/rooms/${id}/reject/${userId}`, {}, token)
  setRequests((prev) => prev.filter((r) => r._id !== userId))
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
{room.owner._id === user?._id && requests.length > 0 && (
  <div className="card" style={{ marginBottom: '16px' }}>
    <p style={{ fontWeight: '600', marginBottom: '10px', fontSize: '14px' }}>
      Join Requests ({requests.length})
    </p>
    {requests.map((r) => (
      <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
        <span style={{ fontSize: '14px' }}>{r.username}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary btn-sm" onClick={() => handleApprove(r._id)}>Approve</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleReject(r._id)}>Reject</button>
        </div>
      </div>
    ))}
  </div>
)}
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
