'use client'
import { useEffect, useRef, useState } from 'react'

export default function ChatBox({ messages, onSend, onDelete, currentUserId }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="chat-box">
      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>
            No messages yet. Say hi!
          </p>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.sender?._id === currentUserId
          return (
            <div key={msg._id || i} style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-end' }}>
              {!isOwn && (
                <div className="chat-avatar">{msg.sender?.username?.[0]?.toUpperCase()}</div>
              )}

              <div style={{ maxWidth: '60%', minWidth: '80px' }}>
                {!isOwn && (
                  <div className="chat-sender">{msg.sender?.username}</div>
                )}
                <div style={{
                  background: isOwn ? '#e0e7ff' : '#f5f5f5',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}>
                  <div style={{ fontSize: '14px', marginBottom: '6px' }}>{msg.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isOwn && msg._id && (
                      <button onClick={() => onDelete(msg._id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#dc2626', fontSize: '11px', padding: '0',
                        whiteSpace: 'nowrap',
                      }}>
                        delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isOwn && (
                <div className="chat-avatar" style={{ background: '#e0e7ff' }}>
                  {msg.sender?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="btn btn-primary btn-sm" type="submit">Send</button>
      </form>
    </div>
  )
}