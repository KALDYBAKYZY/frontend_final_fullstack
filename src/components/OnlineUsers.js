'use client'

export default function OnlineUsers({ users = [] }) {
  return (
    <div className="online-panel">
      <div className="online-title">Online — {users.length}</div>

      {users.length === 0 && (
        <p style={{ fontSize: '13px', color: '#aaa' }}>No one online yet</p>
      )}

      {users.map((u) => (
        <div key={u.userId} className="online-user">
          <div className="online-dot" />
          <div className="online-avatar">{u.username?.[0]?.toUpperCase()}</div>
          <span>{u.username}</span>
        </div>
      ))}
    </div>
  )
}
